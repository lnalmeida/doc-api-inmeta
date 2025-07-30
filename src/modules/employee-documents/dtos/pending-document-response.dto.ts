import { ApiProperty } from '@nestjs/swagger';
import { DocumentStatus } from '@prisma/client';

export class PendingDocumentResponseDto {
  @ApiProperty({
    description: 'ID do registro do documento do colaborador',
    example: 'uuid-do-registro',
  })
  id: string;

  @ApiProperty({
    description: 'ID do colaborador',
    example: 'uuid-do-colaborador',
  })
  employeeId: string;

  @ApiProperty({ description: 'Nome do colaborador', example: 'João da Silva' })
  employeeName: string;

  @ApiProperty({ description: 'CPF do colaborador', example: '123.456.789-00' })
  employeeCpf: string;

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
