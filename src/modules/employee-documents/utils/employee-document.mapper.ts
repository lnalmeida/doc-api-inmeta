import { Employee } from '../../employees/entities/employee.entity';
import {
  DocumentDetailDto,
  EmployeeDocumentStatusDto,
} from '../dtos/employee-document-status.dto';
import { PendingDocumentResponseDto } from '../dtos/pending-document-response.dto';
import {
  EmployeeDocumentWithDocumentType,
  EmployeeDocumentWithRelations,
} from 'src/common/types/EmployeeDocumentTypes';

export class EmployeeDocumentMapper {
  static toDocumentDetailDto(
    employeeDocument: EmployeeDocumentWithDocumentType,
  ): DocumentDetailDto {
    return {
      documentTypeId: employeeDocument.documentTypeId,
      documentTypeName: employeeDocument.documentType.name,
      status: employeeDocument.status,
      submittedAt: employeeDocument.submittedAt || null,
    };
  }

  static toEmployeeDocumentStatusDto(
    employee: Employee,
    employeeDocuments: EmployeeDocumentWithDocumentType[],
  ): EmployeeDocumentStatusDto {
    return {
      employeeId: employee.id,
      employeeName: employee.name,
      documents: employeeDocuments.map((doc) =>
        EmployeeDocumentMapper.toDocumentDetailDto(doc),
      ),
    };
  }

  static toPendingDocumentResponseDto(
    employeeDocument: EmployeeDocumentWithRelations,
  ): PendingDocumentResponseDto {
    return {
      id: employeeDocument.id,
      employeeId: employeeDocument.employeeId,
      employeeName: employeeDocument.employee.name,
      employeeCpf: employeeDocument.employee.cpf,
      documentTypeId: employeeDocument.documentTypeId,
      documentTypeName: employeeDocument.documentType.name,
      status: employeeDocument.status,
      submittedAt: employeeDocument.submittedAt || null,
    };
  }
}
