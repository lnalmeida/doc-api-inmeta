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
import { EmployeeDocumentStatusDto } from './dtos/employee-document-status.dto';
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

    // 2. Verificar se todos os tipos de documentos existem
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
        !foundDocumentTypes.data // Reutiliza a lista para filtrar IDs que seriam criados
            .filter(dt => dt.id === id)
            .some(dt => existingDocumentTypeIds.has(dt.id)) // Esta linha precisa ser ajustada após checkAndHandle...
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

    // 1. Verificar se o colaborador existe
    const employee = await this.employeeRepository.findEmployeeById(employeeId);
    if (!employee) {
      throw new NotFoundException(
        `Colaborador com ID "${employeeId}" não encontrado.`,
      );
    }

    // Não é estritamente necessário verificar a existência dos tipos de documento aqui
    // pois a operação de deleteMany apenas afeta registros existentes.
    // Poderíamos adicionar essa validação se quiséssemos um erro 400 mais explícito
    // para IDs de tipos de documentos inexistentes na requisição de desvinculação.

    // 2. Desvincular os documentos
    await this.employeeDocumentRepository.unassignDocumentTypes(
      employeeId,
      documentTypeIds,
    );
  }

  async submitDocument(data: SubmitDocumentDto): Promise<EmployeeDocument> {
    const { employeeId, documentTypeId } = data;

    // 1. Verificar se o colaborador existe
    const employee = await this.employeeRepository.findEmployeeById(employeeId);
    if (!employee) {
      throw new NotFoundException(
        `Colaborador com ID "${employeeId}" não encontrado.`,
      );
    }

    // 2. Verificar se o tipo de documento existe
    const documentType = await this.documentTypeRepository.findDocumentTypeById(
      documentTypeId,
    );
    if (!documentType) {
      throw new NotFoundException(
        `Tipo de documento com ID "${documentTypeId}" não encontrado.`,
      );
    }

    // 3. Verificar se o documento está vinculado e pendente
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

    // 4. Registrar o envio
    return this.employeeDocumentRepository.submitDocument(
      employeeId,
      documentTypeId,
      data,
    );
  }

  async getEmployeeDocumentStatus(employeeId: string): Promise<EmployeeDocumentStatusDto> {
    // 1. Verificar se o colaborador existe
    const employee = await this.employeeRepository.findEmployeeById(employeeId);
    if (!employee) {
      throw new NotFoundException(
        `Colaborador com ID "${employeeId}" não encontrado.`,
      );
    }

    // 2. Obter todos os documentos vinculados a este colaborador
    const employeeDocuments =
      await this.employeeDocumentRepository.findEmployeeDocumentsByEmployeeId(
        employeeId,
      );

    // 3. Mapear para o DTO de resposta detalhado
    return EmployeeDocumentMapper.toEmployeeDocumentStatusDto(
      employee,
      employeeDocuments,
    );
  }

  async listPendingDocuments(
    filters: ListPendingDocumentsDto,
  ): Promise<PaginationResult<PendingDocumentResponseDto>> {
    const result = await this.employeeDocumentRepository.findPendingDocuments(
      filters,
    );

    // Mapear os dados para o DTO de resposta
    const mappedData = result.data.map((doc: any) =>
      EmployeeDocumentMapper.toPendingDocumentResponseDto(
        doc as EmployeeDocumentWithRelations, 
      ),
    );

    return {
      ...result,
      data: mappedData,
    };
  }

  private async verifyDuplicateDocumentAssignments(
      employeeId: string,
      documentTypeIds: string[],
      employee: Employee,
      allDocumentTypesInSystem: DocumentType[], // Ajuste para o tipo DocumentType[]
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
}