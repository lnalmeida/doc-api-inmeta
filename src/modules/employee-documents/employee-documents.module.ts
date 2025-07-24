import { Module } from '@nestjs/common';
import { EmployeeDocumentsService } from './employee-documents.service';
import { EmployeeDocumentsController } from './employee-documents.controller';
import { PrismaService } from '../../database/prisma.service';
import { EmployeeDocumentRepository } from './employee-documents.repository';
import { EMPLOYEE_DOCUMENT_REPOSITORY } from './interfaces/employee-documents.repository.interface';
import { EmployeeModule } from '../employees/employee.module'; // Importa o módulo de Employees
import { DocumentTypeModule } from '../document-type/document-type.module'; // Importa o módulo de DocumentTypes

@Module({
  imports: [
    EmployeeModule, // Necessário para acessar o IEmployeeRepository
    DocumentTypeModule, // Necessário para acessar o IDocumentTypeRepository
  ],
  controllers: [EmployeeDocumentsController],
  providers: [
    EmployeeDocumentsService,
    {
      provide: EMPLOYEE_DOCUMENT_REPOSITORY,
      useClass: EmployeeDocumentRepository,
    },
    // PrismaService não precisa ser listado aqui novamente se PrismaModule é global
  ],
})
export class EmployeeDocumentsModule {}