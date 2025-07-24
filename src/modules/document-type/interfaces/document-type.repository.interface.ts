import { DocumentType } from '@prisma/client';
import { CreateDocumentTypeDto } from '../dtos/create-document-type.dto';
import { UpdateDocumentTypeDto } from '../dtos/update-document-type.dto';

export interface IDocumentTypeRepository {
  createDocumentType(data: CreateDocumentTypeDto): Promise<DocumentType>;
  findAllDocumentTypes(): Promise<DocumentType[]>;
  findDocumentTypeById(id: string): Promise<DocumentType | null>;
  findDocumentTypeByName(name: string): Promise<DocumentType | null>;
  updateDocumentType(id: string, data: UpdateDocumentTypeDto): Promise<DocumentType>;
  deleteDocumentType(id: string): Promise<void>;
}

export const DOCUMENT_TYPE_REPOSITORY = 'DOCUMENT_TYPE_REPOSITORY'; 