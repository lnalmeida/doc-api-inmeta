import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { DocumentTypeService } from './modules/document-type/document-type.service';
import { EmployeeService } from './modules/employees/employee.service';
import { DocumentTypeModule } from './modules/document-type/document-type.module';
import { EmployeeModule } from './modules/employees/employee.module';
import { PrismaModule } from './database/prisma.module';
import { EmployeeDocumentsService } from './modules/employee-documents/employee-documents.service';
import { EmployeeDocumentsModule } from './modules/employee-documents/employee-documents.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
      envFilePath: '../.env',
    }),
    DocumentTypeModule,
    EmployeeModule,
    EmployeeDocumentsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
