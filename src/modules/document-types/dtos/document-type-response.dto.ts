import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';

export class DocumentTypeResponseDto {

  @ApiProperty({ description: 'ID único do tipo de documento', example: 'uuid-do-tipo-documento' })
  id: string;

  @ApiProperty({ description: 'Nome do tipo de documento', example: 'CPF' })
  name: string;

  constructor(documentType: DocumentType) {
    this.id = documentType.id;
    this.name = documentType.name;
  }
}