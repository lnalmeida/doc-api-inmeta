import { Prisma } from '@prisma/client';

export type EmployeeDocumentWithRelations = Prisma.EmployeeDocumentGetPayload<{
  include: {
    employee: true;
    documentType: true;
  };
}>;

export type EmployeeDocumentWithDocumentType =
  Prisma.EmployeeDocumentGetPayload<{
    include: { documentType: true };
  }>;
