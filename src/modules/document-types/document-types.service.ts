// src/modules/document-types/document-types.service.ts

import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DocumentType } from '@prisma/client';
import { CreateDocumentTypeDto } from './dtos/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dtos/update-document-type.dto';
import { IDocumentTypeRepository, DOCUMENT_TYPE_REPOSITORY } from './interfaces/document-type.repository.interface';

@Injectable()
export class DocumentTypesService {
  constructor(
    @Inject(DOCUMENT_TYPE_REPOSITORY)
    private readonly documentTypeRepository: IDocumentTypeRepository,
  ) {}

  async create(data: CreateDocumentTypeDto): Promise<DocumentType> {
    const existingDocumentType = await this.documentTypeRepository.findDocumentTypeByName(data.name);
    if (existingDocumentType) {
      throw new ConflictException(`Um tipo de documento com o nome "${data.name}" já existe.`);
    }
    return this.documentTypeRepository.createDocumentType(data);
  }

  async findAll(): Promise<DocumentType[]> {
    return this.documentTypeRepository.findAllDocumentTypes();
  }

  async findOne(id: string): Promise<DocumentType> {
    const documentType = await this.documentTypeRepository.findDocumentTypeById(id);
    if (!documentType) {
      throw new NotFoundException(`Tipo de documento com ID "${id}" não encontrado.`);
    }
    return documentType;
  }

  async update(id: string, data: UpdateDocumentTypeDto): Promise<DocumentType> {
    // Verificar se o tipo de documento existe
    const existingType = await this.documentTypeRepository.findDocumentTypeById(id);
    if (!existingType) {
      throw new NotFoundException(`Tipo de documento com ID "${id}" não encontrado.`);
    }

    // Se estiver tentando atualizar o nome, verificar unicidade
    if (data.name && data.name !== existingType.name) {
      const typeWithSameName = await this.documentTypeRepository.findDocumentTypeByName(data.name);
      if (typeWithSameName && typeWithSameName.id !== id) {
        throw new ConflictException(`Um tipo de documento com o nome "${data.name}" já existe.`);
      }
    }
    
    return this.documentTypeRepository.updateDocumentType(id, data);
  }

  async remove(id: string): Promise<void> {
    const documentType = await this.documentTypeRepository.findDocumentTypeById(id);
    if (!documentType) {
      throw new NotFoundException(`Tipo de documento com ID "${id}" não encontrado.`);
    }
    await this.documentTypeRepository.deleteDocumentType(id);
  }
}