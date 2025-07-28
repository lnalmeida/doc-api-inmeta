import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IDocumentTypeRepository } from './interfaces/document-type.repository.interface';
import { DocumentType } from './entities/document-type.entity';
import { CreateDocumentTypeDto } from './dtos/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dtos/update-document-type.dto';
import { ListDocumentTypeDto } from './dtos/list-document-types.dto';
import { PaginationResult } from 'src/common/types/pagination.types';
import { Prisma } from '@prisma/client';

@Injectable()
export class DocumentTypeRepository implements IDocumentTypeRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createDocumentType(data: CreateDocumentTypeDto): Promise<DocumentType> {
    return this.prismaService.documentType.create({ data });
  }

  async findAllDocumentTypes(filters: ListDocumentTypeDto): Promise<PaginationResult<DocumentType>> {
    const {page = 1, limit = 10, name} = filters;
    const offset = (page - 1) * limit;

    const where: Prisma.DocumentTypeWhereInput = {};

    if(name) {
      where.name = {
        contains: name,
        // mode: 'insensitive', //removido provisóruiamente, para compatibilidade com SQLite
      };
    }

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.documentType.findMany({
        where,
        skip: offset,
        take: limit,
        // orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.documentType.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      page,
      limit,
      total,
      totalPages,
    };
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