import { Module } from '@nestjs/common';
import { EmployeeDocumentsService } from './employee-documents.service';
import { EmployeeDocumentsController } from './employee-documents.controller';
import { EmployeeDocumentRepository } from './employee-documents.repository';
import { EMPLOYEE_DOCUMENT_REPOSITORY } from './interfaces/employee-documents.repository.interface';
import { EmployeeModule } from '../employees/employee.module'; // Importa o módulo de Employees
import { DocumentTypeModule } from '../document-type/document-type.module'; // Importa o módulo de DocumentTypes

@Module({
  imports: [EmployeeModule, DocumentTypeModule],
  controllers: [EmployeeDocumentsController],
  providers: [
    EmployeeDocumentsService,
    {
      provide: EMPLOYEE_DOCUMENT_REPOSITORY,
      useClass: EmployeeDocumentRepository,
    },
  ],
})
export class EmployeeDocumentsModule {}
