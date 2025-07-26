import { EmployeeDocument, Prisma } from '@prisma/client';
import { SubmitDocumentDto } from '../dtos/submit-document.dto';
import { ListPendingDocumentsDto } from '../dtos/list-pending-documents.dto';
import { PaginationResult } from '../../../common/types/pagination.types'; // Vamos criar este tipo
import { EmployeeDocumentWithDocumentType, EmployeeDocumentWithRelations } from 'src/common/types/EmployeeDocumentTypes';

export interface IEmployeeDocumentRepository {
  assignDocumentTypes(employeeId: string, documentTypeIds: string[]): Promise<EmployeeDocument[]>;
  unassignDocumentTypes(employeeId: string, documentTypeIds: string[]): Promise<void>;

  submitDocument(employeeId: string, documentTypeId: string, data: SubmitDocumentDto): Promise<EmployeeDocument>;

  findEmployeeDocumentsByEmployeeId(employeeId: string): Promise<EmployeeDocumentWithDocumentType[]>;

  findPendingDocuments(filters: ListPendingDocumentsDto): Promise<PaginationResult<EmployeeDocumentWithRelations>>;

  findByEmployeeIdAndDocumentTypeId(employeeId: string, documentTypeId: string): Promise<EmployeeDocument | null>;
};

export const EMPLOYEE_DOCUMENT_REPOSITORY = 'EMPLOYEE_DOCUMENT_REPOSITORY';