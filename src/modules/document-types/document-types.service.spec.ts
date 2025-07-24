import { Test, TestingModule } from '@nestjs/testing';
import { DocumentTypesService } from './document-types.service';
import { DocumentTypeRepository } from './document-types.repository';
import { DOCUMENT_TYPE_REPOSITORY } from './interfaces/document-type.repository.interface';
import { PrismaService } from 'src/database/prisma.service';

describe('DocumentTypesService', () => {
  let service: DocumentTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaService],
      providers: [
        DocumentTypesService,
        {
          provide: DOCUMENT_TYPE_REPOSITORY,
          useClass: DocumentTypeRepository,
        },
      ],
    }).compile();

    service = module.get<DocumentTypesService>(DocumentTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
