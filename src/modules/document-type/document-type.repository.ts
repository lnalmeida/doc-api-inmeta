import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IDocumentTypeRepository } from './interfaces/document-type.repository.interface';
import { DocumentType } from './entities/document-type.entity';
import { CreateDocumentTypeDto } from './dtos/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dtos/update-document-type.dto';

@Injectable()
export class DocumentTypeRepository implements IDocumentTypeRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createDocumentType(data: CreateDocumentTypeDto): Promise<DocumentType> {
    return this.prismaService.documentType.create({ data });
  }

  async findAllDocumentTypes(): Promise<DocumentType[]> {
    return this.prismaService.documentType.findMany();
  }

  async findDocumentTypeById(id: string): Promise<DocumentType | null> {
    return this.prismaService.documentType.findUnique({ where: { id } });
  }

  async findDocumentTypeByName(name: string): Promise<DocumentType | null> {
    return this.prismaService.documentType.findUnique({ where: { name } });
  }

  async updateDocumentType(id: string, data: UpdateDocumentTypeDto): Promise<DocumentType> {
    return this.prismaService.documentType.update({
      where: { id },
      data,
    });
  }

  async deleteDocumentType(id: string): Promise<void> {
    await this.prismaService.documentType.delete({ where: { id } });
  }
};