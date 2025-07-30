import { ApiProperty } from '@nestjs/swagger';
import { DocumentStatus } from '@prisma/client'; // Importa o enum do Prisma

export class DocumentDetailDto {
  @ApiProperty({
    description: 'ID do tipo de documento',
    example: 'uuid-do-cpf',
  })
  documentTypeId: string;

  @ApiProperty({ description: 'Nome do tipo de documento', example: 'CPF' })
  documentTypeName: string;

  @ApiProperty({
    enum: DocumentStatus,
    description: 'Status do documento',
    example: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @ApiProperty({
    description: 'Data de envio do documento (se enviado)',
    example: '2023-07-20T10:00:00.000Z',
    required: false,
    nullable: true,
  })
  submittedAt?: Date | null;
}

export class EmployeeDocumentStatusDto {
  @ApiProperty({
    description: 'ID do colaborador',
    example: 'uuid-do-colaborador',
  })
  employeeId: string;

  @ApiProperty({ description: 'Nome do colaborador', example: 'João da Silva' })
  employeeName: string;

  @ApiProperty({
    type: [DocumentDetailDto],
    description: 'Lista detalhada dos documentos do colaborador',
  })
  documents: DocumentDetailDto[];
}
