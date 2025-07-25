import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './database/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { DocumentTypeService } from './modules/document-type/document-type.service';
import { EmployeeService } from './modules/employees/employees.service';
import { DocumentTypeModule } from './modules/document-type/document-type.module';
import { EmployeeModule } from './modules/employees/employees.module';
import { PrismaModule } from './database/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
      envFilePath: '../.env',
    }),
    DocumentTypeModule,
    EmployeeModule
  ],
  controllers: [AppController,],
  providers: [
    AppService, 
    DocumentTypeService,
    EmployeeService
  ],
})
export class AppModule {}
