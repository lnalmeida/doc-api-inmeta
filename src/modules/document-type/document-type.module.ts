import { Module } from '@nestjs/common';
import { DocumentTypeRepository } from './document-type.repository';
import { DocumentTypeService } from './document-type.service';
import { DocumentTypeController } from './document-type.controller';
import { DOCUMENT_TYPE_REPOSITORY } from './interfaces/document-type.repository.interface';
import { PrismaService } from 'src/database/prisma.service';

@Module({
    controllers: [DocumentTypeController],
    providers: [
      DocumentTypeService,
      {
        provide: DOCUMENT_TYPE_REPOSITORY,
        useClass: DocumentTypeRepository,
      },
    ],
    exports: [DocumentTypeService, DOCUMENT_TYPE_REPOSITORY], 
})
export class DocumentTypeModule {}
