import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  EMPLOYEE_DOCUMENT_REPOSITORY,
  IEmployeeDocumentRepository,
} from './interfaces/employee-documents.repository.interface';
import {
  EMPLOYEE_REPOSITORY,
  IEmployeeRepository,
} from '../employees/interfaces/employee.repository.interface';
import {
  DOCUMENT_TYPE_REPOSITORY,
  IDocumentTypeRepository,
} from '../document-type/interfaces/document-type.repository.interface';
import { AssignDocumentTypesDto } from './dtos/assign-document-types.dto';
import { UnassignDocumentTypesDto } from './dtos/unassign-document-types.dto';
import { SubmitDocumentDto } from './dtos/submit-document.dto';
import {
  EmployeeDocument,
  DocumentStatus,
  Employee,
  DocumentType,
} from '@prisma/client';
import { DocumentDetailDto, EmployeeDocumentStatusDto } from './dtos/employee-document-status.dto';
import { EmployeeDocumentMapper } from './utils/employee-document.mapper';
import { ListPendingDocumentsDto } from './dtos/list-pending-documents.dto';
import { PaginationResult } from '../../common/types/pagination.types';
import { PendingDocumentResponseDto } from './dtos/pending-document-response.dto';
import { EmployeeDocumentWithRelations } from 'src/common/types/EmployeeDocumentTypes';

@Injectable()
export class EmployeeDocumentsService {
  constructor(
    @Inject(EMPLOYEE_DOCUMENT_REPOSITORY)
    private readonly employeeDocumentRepository: IEmployeeDocumentRepository,
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: IEmployeeRepository,
    @Inject(DOCUMENT_TYPE_REPOSITORY)
    private readonly documentTypeRepository: IDocumentTypeRepository,
  ) {}

  async assignDocumentTypes(
    data: AssignDocumentTypesDto,
  ): Promise<EmployeeDocument[]> {
    const { employeeId, documentTypeIds } = data;

    const employee = await this.employeeRepository.findEmployeeById(employeeId);
    if (!employee) {
      throw new NotFoundException(
        `Colaborador com ID "${employeeId}" não encontrado.`,
      );
    }

    const foundDocumentTypes =
      await this.documentTypeRepository
        .findAllDocumentTypes({}); 
    
    const existingDocumentTypeIds = new Set(
      foundDocumentTypes.data.map((dt: any) => dt.id),
    );

    const invalidDocumentTypeIds = documentTypeIds.filter(
      (id) => !existingDocumentTypeIds.has(id),
    );

    if (invalidDocumentTypeIds.length > 0) {
      throw new BadRequestException(
        `Os seguintes IDs de tipo de documento são inválidos ou não existem: ${invalidDocumentTypeIds.join(
          ', ',
        )}`,
      );
    }

    await this.verifyDuplicateDocumentAssignments(
        employeeId,
        documentTypeIds,
        employee,
        foundDocumentTypes.data
    );
    
    const documentsToCreate = documentTypeIds.filter(id =>
        !foundDocumentTypes.data 
            .filter(dt => dt.id === id)
            .some(dt => existingDocumentTypeIds.has(dt.id)) 
    );

    return this.employeeDocumentRepository.assignDocumentTypes(
      employeeId,
      documentTypeIds,
    );
  }

  async unassignDocumentTypes(
    data: UnassignDocumentTypesDto,
  ): Promise<void> {
    const { employeeId, documentTypeIds } = data;

    const employee = await this.employeeRepository.findEmployeeById(employeeId);
    if (!employee) {
      throw new NotFoundException(
        `Colaborador com ID "${employeeId}" não encontrado.`,
      );
    }

    await this.employeeDocumentRepository.unassignDocumentTypes(
      employeeId,
      documentTypeIds,
    );
  }

  async submitDocument(data: SubmitDocumentDto): Promise<EmployeeDocument> {
    const { employeeId, documentTypeId } = data;

    const employee = await this.employeeRepository.findEmployeeById(employeeId);
    if (!employee) {
      throw new NotFoundException(
        `Colaborador com ID "${employeeId}" não encontrado.`,
      );
    }

    const documentType = await this.documentTypeRepository.findDocumentTypeById(
      documentTypeId,
    );
    if (!documentType) {
      throw new NotFoundException(
        `Tipo de documento com ID "${documentTypeId}" não encontrado.`,
      );
    }

    const employeeDocument =
      await this.employeeDocumentRepository.findByEmployeeIdAndDocumentTypeId(
        employeeId,
        documentTypeId,
      );

    if (!employeeDocument) {
      throw new NotFoundException(
        `Documento do tipo "${documentType.name}" não vinculado ou já enviado para o colaborador "${employee.name}".`,
      );
    }

    if (employeeDocument.status === DocumentStatus.SUBMITTED) {
      throw new ConflictException(
        `O documento "${documentType.name}" do colaborador "${employee.name}" já foi enviado.`,
      );
    }

    return this.employeeDocumentRepository.submitDocument(
      employeeId,
      documentTypeId,
      data,
    );
  }

  async getEmployeeDocumentStatus(employeeId: string): Promise<EmployeeDocumentStatusDto> {
    const employee = await this.employeeRepository.findEmployeeById(employeeId);
    if (!employee) {
      throw new NotFoundException(
        `Colaborador com ID "${employeeId}" não encontrado.`,
      );
    }

    const employeeDocuments =
      await this.employeeDocumentRepository.findEmployeeDocumentsByEmployeeId(
        employeeId,
      );

    return EmployeeDocumentMapper.toEmployeeDocumentStatusDto(
      employee,
      employeeDocuments,
    );
  }

  async listPendingDocuments(
    filters: ListPendingDocumentsDto,
  ): Promise<PaginationResult<EmployeeDocumentStatusDto>> {
   
    const result = await this.employeeDocumentRepository.findPendingDocuments(
      filters
    );

    const groupedData = this.groupDocumentsByEmployee(result.data);

    const { page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    const paginatedGroupedData = groupedData.slice(offset, offset + limit);
    const totalGroupedItems = groupedData.length; // O total agora é o número de colaboradores com pendências
    const totalPagesGrouped = Math.ceil(totalGroupedItems / limit);

    return {
      data: paginatedGroupedData,
      total: totalGroupedItems,
      page,
      limit,
      totalPages: totalPagesGrouped
    };
  }

  private async verifyDuplicateDocumentAssignments(
      employeeId: string,
      documentTypeIds: string[],
      employee: Employee,
      allDocumentTypesInSystem: DocumentType[], 
    ): Promise<void> {
      const currentlyAssignedDocuments = await this.employeeDocumentRepository.findEmployeeDocumentsByEmployeeId(employeeId);
      const currentlyAssignedDocumentTypeIds = new Set(
        currentlyAssignedDocuments.map(doc => doc.documentTypeId)
      );

      const alreadyAssignedDocumentTypes = documentTypeIds.filter(id => currentlyAssignedDocumentTypeIds.has(id));

      if (alreadyAssignedDocumentTypes.length > 0) {
        const alreadyAssignedNames = allDocumentTypesInSystem
          .filter(dt => alreadyAssignedDocumentTypes.includes(dt.id))
          .map(dt => dt.name);

        throw new ConflictException(
          `O(s) tipo(s) de documento "${alreadyAssignedNames.join(', ')}" já está(ão) vinculado(s) ao colaborador ${employee.name}.`,
        );
      }
    }

   private groupDocumentsByEmployee(
    documents: EmployeeDocumentWithRelations[]
    ): EmployeeDocumentStatusDto[] {
    const groupedDocumentsMap = new Map<string, EmployeeDocumentStatusDto>();

    for (const doc of documents) {
      const employeeId = doc.employee.id;

      if (employeeId && !groupedDocumentsMap.has(employeeId)) {
        groupedDocumentsMap.set(employeeId, {
          employeeId: employeeId,
          employeeName: doc.employee.name,
          documents: [],
        });
      }
      
      const documentDetail: DocumentDetailDto = {
        documentTypeId: doc.documentType.id,
        documentTypeName: doc.documentType.name,
        status: doc.status,
        submittedAt: doc.submittedAt || null,
      };

      groupedDocumentsMap.get(employeeId)!.documents.push(documentDetail);
    }

    return Array.from(groupedDocumentsMap.values());
  }

};