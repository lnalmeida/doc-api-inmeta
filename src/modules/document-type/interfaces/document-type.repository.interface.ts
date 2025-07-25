import { DocumentType } from '@prisma/client';
import { CreateDocumentTypeDto } from '../dtos/create-document-type.dto';
import { UpdateDocumentTypeDto } from '../dtos/update-document-type.dto';
import { ListDocumentTypeDto } from '../dtos/list-document-types.dto';
import { PaginationResult } from 'src/common/types/pagination.types';

export interface IDocumentTypeRepository {
  createDocumentType(data: CreateDocumentTypeDto): Promise<DocumentType>;
  findAllDocumentTypes(filters: ListDocumentTypeDto): Promise<PaginationResult<DocumentType>>;
  findDocumentTypeById(id: string): Promise<DocumentType | null>;
  findDocumentTypeByName(name: string): Promise<DocumentType | null>;
  updateDocumentType(id: string, data: UpdateDocumentTypeDto): Promise<DocumentType>;
  deleteDocumentType(id: string): Promise<void>;
}

export const DOCUMENT_TYPE_REPOSITORY = 'DOCUMENT_TYPE_REPOSITORY'; 