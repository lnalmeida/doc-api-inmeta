import { EmployeeDocument, Prisma } from '@prisma/client';
import { AssignDocumentTypesDto } from '../dtos/assign-document-types.dto';
import { SubmitDocumentDto } from '../dtos/submit-document.dto';
import { ListPendingDocumentsDto } from '../dtos/list-pending-documents.dto';
import { PaginationResult } from '../../../common/types/pagination.types'; // Vamos criar este tipo
import { EmployeeDocumentWithRelations } from 'src/common/types/EmployeeDocumentTypes';

export interface IEmployeeDocumentRepository {
  // Vinculação e Desvinculação
  assignDocumentTypes(employeeId: string, documentTypeIds: string[]): Promise<EmployeeDocument[]>;
  unassignDocumentTypes(employeeId: string, documentTypeIds: string[]): Promise<void>;

  // Envio de Documento
  submitDocument(employeeId: string, documentTypeId: string, data: SubmitDocumentDto): Promise<EmployeeDocument>;

  // Consulta de Status
  findEmployeeDocumentsByEmployeeId(employeeId: string): Promise<EmployeeDocumentWithRelations[]>;

  // Listar Pendências
  findPendingDocuments(filters: ListPendingDocumentsDto): Promise<PaginationResult<EmployeeDocument>>;

  // Métodos auxiliares para verificações
  findByEmployeeIdAndDocumentTypeId(employeeId: string, documentTypeId: string): Promise<EmployeeDocument | null>;
};

export const EMPLOYEE_DOCUMENT_REPOSITORY = 'EMPLOYEE_DOCUMENT_REPOSITORY';