import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DocumentType } from '@prisma/client';
import { CreateDocumentTypeDto } from './dtos/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dtos/update-document-type.dto';
import {
  IDocumentTypeRepository,
  DOCUMENT_TYPE_REPOSITORY,
} from './interfaces/document-type.repository.interface';
import { PaginationResult } from 'src/common/types/pagination.types';
import { ListDocumentTypeDto } from './dtos/list-document-types.dto';
@Injectable()
export class DocumentTypeService {
  private static readonly CACHE_PREFIX_LIST = 'document_types_list';
  private static readonly CACHE_PREFIX_SINGLE = 'document_type_single';
  constructor(
    @Inject(DOCUMENT_TYPE_REPOSITORY)
    private readonly documentTypeRepository: IDocumentTypeRepository,
  ) {}

  async create(data: CreateDocumentTypeDto): Promise<DocumentType> {
    const existingDocumentType =
      await this.documentTypeRepository.findDocumentTypeByName(data.name);
    if (existingDocumentType) {
      throw new ConflictException(
        `Um tipo de documento com o nome "${data.name}" já existe.`,
      );
    }
    return this.documentTypeRepository.createDocumentType(data);
  }

  async findAll(
    filters: ListDocumentTypeDto,
  ): Promise<PaginationResult<DocumentType>> {
    const result =
      await this.documentTypeRepository.findAllDocumentTypes(filters);

    return result;
  }

  async findOne(id: string): Promise<DocumentType> {
    const documentType =
      await this.documentTypeRepository.findDocumentTypeById(id);
    if (!documentType) {
      throw new NotFoundException(
        `Tipo de documento com ID "${id}" não encontrado.`,
      );
    }
    return documentType;
  }

  async update(id: string, data: UpdateDocumentTypeDto): Promise<DocumentType> {
    const existingType =
      await this.documentTypeRepository.findDocumentTypeById(id);
    if (!existingType) {
      throw new NotFoundException(
        `Tipo de documento com ID "${id}" não encontrado.`,
      );
    }

    if (data.name && data.name !== existingType.name) {
      const typeWithSameName =
        await this.documentTypeRepository.findDocumentTypeByName(data.name);
      if (typeWithSameName && typeWithSameName.id !== id) {
        throw new ConflictException(
          `Um tipo de documento com o nome "${data.name}" já existe.`,
        );
      }
    }

    return this.documentTypeRepository.updateDocumentType(id, data);
  }

  async remove(id: string): Promise<void> {
    const documentType =
      await this.documentTypeRepository.findDocumentTypeById(id);
    if (!documentType) {
      throw new NotFoundException(
        `Tipo de documento com ID "${id}" não encontrado.`,
      );
    }
    await this.documentTypeRepository.deleteDocumentType(id);
  }
}
