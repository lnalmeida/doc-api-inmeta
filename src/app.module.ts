import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { DocumentTypeModule } from './modules/document-type/document-type.module';
import { EmployeeModule } from './modules/employees/employee.module';
import { PrismaModule } from './database/prisma.module';
import { EmployeeDocumentsModule } from './modules/employee-documents/employee-documents.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      load: [appConfig, databaseConfig],
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'Throttler',
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    DocumentTypeModule,
    EmployeeModule,
    EmployeeDocumentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
