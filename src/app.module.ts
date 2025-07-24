import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './database/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { DocumentTypesModule } from './modules/document-types/document-types.module';
import { DocumentTypesController } from './modules/document-types/document-types.controller';
import { DocumentTypesService } from './modules/document-types/document-types.service';
import { DocumentTypeRepository } from './modules/document-types/document-types.repository';
import { DOCUMENT_TYPE_REPOSITORY } from './modules/document-types/interfaces/document-type.repository.interface';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
      envFilePath: '../.env',
    }),
    DocumentTypesModule,
  ],
  controllers: [AppController, DocumentTypesController],
  providers: [
    AppService, 
    PrismaService, 
    DocumentTypesService,
    {
      provide: DOCUMENT_TYPE_REPOSITORY,
      useClass: DocumentTypeRepository,
    },
  ],
})
export class AppModule {}
