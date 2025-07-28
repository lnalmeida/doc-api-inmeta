import { TestingModule, Test } from "@nestjs/testing";
import { ListDocumentTypeDto } from "../../../src/modules/document-type/dtos/list-document-types.dto";
import { DocumentType } from "../../../src/modules/document-type/entities/document-type.entity";
import { PaginationResult } from "src/common/types/pagination.types";
import { DocumentTypeController } from "src/modules/document-type/document-type.controller";
import { DocumentTypeService } from "src/modules/document-type/document-type.service";
import { CreateDocumentTypeDto } from "src/modules/document-type/dtos/create-document-type.dto";
import { DocumentTypeResponseDto } from "src/modules/document-type/dtos/document-type-response.dto";
import { UpdateDocumentTypeDto } from "src/modules/document-type/dtos/update-document-type.dto";
import { IDocumentTypeRepository, DOCUMENT_TYPE_REPOSITORY } from "src/modules/document-type/interfaces/document-type.repository.interface";

// Mocks de dados
const mockDocType1: DocumentType = { 
  id: '1234-5678-9012-345678901234', 
  name: 'CPF Test', 
  createdAt: new Date(), 
  updatedAt: new Date(), 
};
const mockDocType2: DocumentType = { 
  id: '4321-5678-9012-345678901234',
  name: 'RG Test',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('DocumentTypesController (Integration)', () => {
  let controller: DocumentTypeController;
  let service: DocumentTypeService;
  let mockDocumentTypeRepository: jest.Mocked<IDocumentTypeRepository>;

  beforeEach(async () => {
    mockDocumentTypeRepository = {
      createDocumentType: jest.fn(),
      findAllDocumentTypes: jest.fn(),
      findDocumentTypeById: jest.fn(),
      findDocumentTypeByName: jest.fn(),
      updateDocumentType: jest.fn(),
      deleteDocumentType: jest.fn(),
    } as jest.Mocked<IDocumentTypeRepository>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentTypeController],
      providers: [
        DocumentTypeService,
        { provide: DOCUMENT_TYPE_REPOSITORY, useValue: mockDocumentTypeRepository },
      ],
    }).compile();

    controller = module.get<DocumentTypeController>(DocumentTypeController);
    service = module.get<DocumentTypeService>(DocumentTypeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('POST /document-type', () => {
    it('deve chamar o serviço para criar e retornar o tipo de documento', async () => {
      const createDto: CreateDocumentTypeDto = { name: 'New Doc Type' };
      const createdDoc: DocumentType = { ...mockDocType1, name: 'New Doc Type', id: 'new-id' };
      jest.spyOn(service, 'create').mockResolvedValue(createdDoc);

      const result = await controller.create(createDto);

      expect(result).toEqual(new DocumentTypeResponseDto(createdDoc));
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('GET /document-type', () => {
    it('deve chamar o serviço para listar tipos de documentos com paginação', async () => {
      const filters: ListDocumentTypeDto = { page: 1, limit: 10 };
      const serviceResult: PaginationResult<DocumentType> = {
        data: [mockDocType1, mockDocType2], total: 2, page: 1, limit: 10, totalPages: 1
      };
      jest.spyOn(service, 'findAll').mockResolvedValue(serviceResult);

      const result = await controller.findAll(filters);

      expect(result.data.length).toBe(2);
      expect(result.total).toBe(2);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('GET /document-type/:id', () => {
    it('deve chamar o serviço para buscar um tipo de documento pelo ID', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockDocType1);

      const result = await controller.findOne(mockDocType1.id);

      expect(result).toEqual(new DocumentTypeResponseDto(mockDocType1));
      expect(service.findOne).toHaveBeenCalledWith(mockDocType1.id);
    });
  });

  describe('PATCH /document-type/:id', () => {
    it('deve chamar o serviço para atualizar um tipo de documento', async () => {
      const updateDto: UpdateDocumentTypeDto = { name: 'Updated Name' };
      const updatedDoc: DocumentType = { ...mockDocType1, name: 'Updated Name' };
      jest.spyOn(service, 'update').mockResolvedValue(updatedDoc);

      const result = await controller.update(mockDocType1.id, updateDto);

      expect(result).toEqual(new DocumentTypeResponseDto(updatedDoc));
      expect(service.update).toHaveBeenCalledWith(mockDocType1.id, updateDto);
    });
  });

  describe('DELETE /document-type/:id', () => {
    it('deve chamar o serviço para remover um tipo de documento', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      const result = await controller.remove(mockDocType1.id);

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(mockDocType1.id);
    });
  });
});