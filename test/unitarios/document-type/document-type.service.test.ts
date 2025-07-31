// src/modules/document-types/document-types.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { DocumentTypeService } from '../../../src/modules/document-type/document-type.service';
import {
  IDocumentTypeRepository,
  DOCUMENT_TYPE_REPOSITORY,
} from '../../../src/modules/document-type/interfaces/document-type.repository.interface';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DocumentType } from '@prisma/client';
import { PaginationResult } from '../../../src/common/types/pagination.types';

describe('DocumentTypesService', () => {
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
      providers: [
        DocumentTypeService,
        {
          provide: DOCUMENT_TYPE_REPOSITORY,
          useValue: mockDocumentTypeRepository,
        },
      ],
    }).compile();

    service = module.get<DocumentTypeService>(DocumentTypeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  // --- Testes para create() ---
  describe('criar', () => {
    it('deve criar um tipo de documento com sucesso', async () => {
      const createDto = { name: 'RG', description: 'Registro Geral' };
      const createdDocumentType: DocumentType = {
        id: 'mock-id-1',
        name: 'RG',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDocumentTypeRepository.findDocumentTypeByName.mockResolvedValue(null);
      mockDocumentTypeRepository.createDocumentType.mockResolvedValue(
        createdDocumentType,
      );

      const result = await service.create(createDto);

      expect(result).toEqual(createdDocumentType);
      expect(
        mockDocumentTypeRepository.findDocumentTypeByName,
      ).toHaveBeenCalledWith(createDto.name);
      expect(
        mockDocumentTypeRepository.createDocumentType,
      ).toHaveBeenCalledWith(createDto);
    });

    it('deve lançar ConflictException se o nome do tipo de documento já existir', async () => {
      const createDto = {
        name: 'CPF',
        description: 'Cadastro de Pessoa Física',
      };
      const existingDocumentType: DocumentType = {
        id: 'mock-id-existing',
        name: 'CPF',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDocumentTypeRepository.findDocumentTypeByName.mockResolvedValue(
        existingDocumentType,
      );

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(
        mockDocumentTypeRepository.findDocumentTypeByName,
      ).toHaveBeenCalledWith(createDto.name);
      expect(
        mockDocumentTypeRepository.createDocumentType,
      ).not.toHaveBeenCalled();
    });
  });

  // --- Testes para findAll() ---
  describe('buscarTodos', () => {
    it('deve retornar uma lista paginada de tipos de documentos', async () => {
      const filters = { page: 1, limit: 10, name: 'Doc' };
      const mockDocuments: DocumentType[] = [
        {
          id: '1',
          name: 'Documento A',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Documento B',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const paginationResult: PaginationResult<DocumentType> = {
        data: mockDocuments,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockDocumentTypeRepository.findAllDocumentTypes.mockResolvedValue(
        paginationResult,
      );

      const result = await service.findAll(filters);

      expect(result).toEqual(paginationResult);
      expect(
        mockDocumentTypeRepository.findAllDocumentTypes,
      ).toHaveBeenCalledWith(filters);
    });

    it('deve retornar uma lista vazia se nenhum tipo de documento for encontrado', async () => {
      const filters = { page: 1, limit: 10, name: 'NaoExistente' };
      const emptyPaginationResult: PaginationResult<DocumentType> = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockDocumentTypeRepository.findAllDocumentTypes.mockResolvedValue(
        emptyPaginationResult,
      );

      const result = await service.findAll(filters);

      expect(result).toEqual(emptyPaginationResult);
      expect(
        mockDocumentTypeRepository.findAllDocumentTypes,
      ).toHaveBeenCalledWith(filters);
    });
  });

  // --- Testes para findOne() ---
  describe('buscarUm', () => {
    it('deve retornar um tipo de documento pelo ID', async () => {
      const id = 'mock-id-encontrado';
      const foundDocumentType: DocumentType = {
        id,
        name: 'CNH',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDocumentTypeRepository.findDocumentTypeById.mockResolvedValue(
        foundDocumentType,
      );

      const result = await service.findOne(id);

      expect(result).toEqual(foundDocumentType);
      expect(
        mockDocumentTypeRepository.findDocumentTypeById,
      ).toHaveBeenCalledWith(id);
    });

    it('deve lançar NotFoundException se o tipo de documento não for encontrado pelo ID', async () => {
      const id = 'mock-id-nao-encontrado';

      mockDocumentTypeRepository.findDocumentTypeById.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(
        mockDocumentTypeRepository.findDocumentTypeById,
      ).toHaveBeenCalledWith(id);
    });
  });

  // --- Testes para update() ---
  describe('atualizar', () => {
    it('deve atualizar um tipo de documento com sucesso', async () => {
      const id = 'mock-id-atualizar';
      const updateDto = { name: 'RG Atualizado', description: 'RG Atualizado' };
      const existingDocumentType: DocumentType = {
        id,
        name: 'RG Original',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedDocumentType: DocumentType = {
        ...existingDocumentType,
        name: 'RG Atualizado',
        updatedAt: new Date(),
      };

      mockDocumentTypeRepository.findDocumentTypeById.mockResolvedValue(
        existingDocumentType,
      );
      mockDocumentTypeRepository.findDocumentTypeByName.mockResolvedValue(null);
      mockDocumentTypeRepository.updateDocumentType.mockResolvedValue(
        updatedDocumentType,
      );

      const result = await service.update(id, updateDto);

      expect(result).toEqual(updatedDocumentType);
      expect(
        mockDocumentTypeRepository.findDocumentTypeById,
      ).toHaveBeenCalledWith(id);
      expect(
        mockDocumentTypeRepository.findDocumentTypeByName,
      ).toHaveBeenCalledWith(updateDto.name);
      expect(
        mockDocumentTypeRepository.updateDocumentType,
      ).toHaveBeenCalledWith(id, updateDto);
    });

    it('deve lançar NotFoundException se o tipo de documento a ser atualizado não for encontrado', async () => {
      const id = 'mock-id-nao-encontrado';
      const updateDto = { name: 'NaoExistente' };

      mockDocumentTypeRepository.findDocumentTypeById.mockResolvedValue(null);

      await expect(service.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(
        mockDocumentTypeRepository.findDocumentTypeById,
      ).toHaveBeenCalledWith(id);
      expect(
        mockDocumentTypeRepository.findDocumentTypeByName,
      ).not.toHaveBeenCalled();
      expect(
        mockDocumentTypeRepository.updateDocumentType,
      ).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException se a atualização resultar em um nome de tipo de documento existente', async () => {
      const id = 'mock-id-para-atualizar';
      const updateDto = { name: 'Nome Existente' };
      const existingDocumentType: DocumentType = {
        id,
        name: 'Nome Original',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const otherDocumentTypeWithSameName: DocumentType = {
        id: 'outro-id',
        name: 'Nome Existente',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDocumentTypeRepository.findDocumentTypeById.mockResolvedValue(
        existingDocumentType,
      );
      mockDocumentTypeRepository.findDocumentTypeByName.mockResolvedValue(
        otherDocumentTypeWithSameName,
      );

      await expect(service.update(id, updateDto)).rejects.toThrow(
        ConflictException,
      );
      expect(
        mockDocumentTypeRepository.findDocumentTypeById,
      ).toHaveBeenCalledWith(id);
      expect(
        mockDocumentTypeRepository.findDocumentTypeByName,
      ).toHaveBeenCalledWith(updateDto.name);
      expect(
        mockDocumentTypeRepository.updateDocumentType,
      ).not.toHaveBeenCalled();
    });
  });

  // --- Testes para remove() ---
  describe('remover', () => {
    it('deve deletar um tipo de documento com sucesso', async () => {
      const id = 'mock-id-deletar';
      const existingDocumentType: DocumentType = {
        id,
        name: 'Documento a ser deletado',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDocumentTypeRepository.findDocumentTypeById.mockResolvedValue(
        existingDocumentType,
      );
      mockDocumentTypeRepository.deleteDocumentType.mockResolvedValue(
        undefined,
      );

      await service.remove(id);

      expect(
        mockDocumentTypeRepository.findDocumentTypeById,
      ).toHaveBeenCalledWith(id);
      expect(
        mockDocumentTypeRepository.deleteDocumentType,
      ).toHaveBeenCalledWith(id);
    });

    it('deve lançar NotFoundException se o tipo de documento a ser deletado não for encontrado', async () => {
      const id = 'mock-id-nao-encontrado';

      mockDocumentTypeRepository.findDocumentTypeById.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
      expect(
        mockDocumentTypeRepository.findDocumentTypeById,
      ).toHaveBeenCalledWith(id);
      expect(
        mockDocumentTypeRepository.deleteDocumentType,
      ).not.toHaveBeenCalled();
    });
  });
});
