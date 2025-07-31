/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IEmployeeDocumentRepository } from './interfaces/employee-documents.repository.interface';
import { DocumentStatus, EmployeeDocument, Prisma } from '@prisma/client';
import { ListPendingDocumentsDto } from '../employee-documents/dtos/list-pending-documents.dto';
import { PaginationResult } from '../../common/types/pagination.types';
import {
  EmployeeDocumentWithDocumentType,
  EmployeeDocumentWithRelations,
} from 'src/common/types/EmployeeDocumentTypes';

@Injectable()
export class EmployeeDocumentRepository implements IEmployeeDocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async assignDocumentTypes(
    employeeId: string,
    documentTypeIds: string[],
  ): Promise<EmployeeDocument[]> {
    const existing = await this.prisma.employeeDocument.findMany({
      where: {
        employeeId,
        documentTypeId: { in: documentTypeIds },
      },
      select: { documentTypeId: true },
    });

    const createData = documentTypeIds.map((documentTypeId) => ({
      employeeId,
      documentTypeId,
      status: DocumentStatus.PENDING,
    }));

    if (createData.length > 0) {
      await this.prisma.employeeDocument.createMany({
        data: createData,
      });
    }

    return this.prisma.employeeDocument.findMany({
      where: {
        employeeId,
        documentTypeId: {
          in: documentTypeIds,
        },
      },
      include: {
        employee: true,
        documentType: true,
      },
    });
  }

  async unassignDocumentTypes(
    employeeId: string,
    documentTypeIds: string[],
  ): Promise<void> {
    await this.prisma.employeeDocument.deleteMany({
      where: {
        employeeId,
        documentTypeId: {
          in: documentTypeIds,
        },
      },
    });
  }

  async submitDocument(
    employeeId: string,
    documentTypeId: string,
  ): Promise<EmployeeDocument> {
    return this.prisma.employeeDocument.update({
      where: {
        employeeId_documentTypeId: {
          employeeId,
          documentTypeId,
        },
      },
      data: {
        status: DocumentStatus.SUBMITTED,
        submittedAt: new Date(),
      },
    });
  }

  async findEmployeeDocumentsByEmployeeId(
    employeeId: string,
  ): Promise<EmployeeDocumentWithDocumentType[]> {
    return this.prisma.employeeDocument.findMany({
      where: { employeeId },
      include: {
        employee: true,
        documentType: true,
      },
    });
  }

  async findPendingDocuments(
    filters: ListPendingDocumentsDto,
  ): Promise<PaginationResult<EmployeeDocumentWithRelations>> {
    const {
      page = 1,
      limit = 10,
      employeeId: filterEmployeeId,
      documentTypeId: filterDocumentTypeId,
    } = filters;
    const offset = (page - 1) * limit;

    const where: Prisma.EmployeeDocumentWhereInput = {
      status: DocumentStatus.PENDING,
    };

    if (filterEmployeeId) {
      where.employeeId = filterEmployeeId;
    }
    if (filterDocumentTypeId) {
      where.documentTypeId = filterDocumentTypeId;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.employeeDocument.findMany({
        where,
        skip: offset,
        take: limit,
        include: {
          employee: true,
          documentType: true,
        },
      }),
      this.prisma.employeeDocument.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findByEmployeeIdAndDocumentTypeId(
    employeeId: string,
    documentTypeId: string,
  ): Promise<EmployeeDocument | null> {
    return this.prisma.employeeDocument.findUnique({
      where: {
        employeeId_documentTypeId: {
          employeeId,
          documentTypeId,
        },
      },
    });
  }
}
