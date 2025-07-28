import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { DocumentTypeModule } from './modules/document-type/document-type.module';
import { EmployeeModule } from './modules/employees/employee.module';
import { PrismaModule } from './database/prisma.module';
import { EmployeeDocumentsModule } from './modules/employee-documents/employee-documents.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '../.env.test' : '../.env',
    }),
    DocumentTypeModule,
    EmployeeModule,
    EmployeeDocumentsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
