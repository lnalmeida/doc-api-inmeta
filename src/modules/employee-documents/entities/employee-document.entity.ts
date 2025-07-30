import { $Enums } from '@prisma/client';

export class EmployeeDocument {
  id: string;
  status: $Enums.DocumentStatus;
  employeeId: string;
  documentTypeId: string;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
