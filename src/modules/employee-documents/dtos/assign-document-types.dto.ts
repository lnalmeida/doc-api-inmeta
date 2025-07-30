import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssignDocumentTypesDto {
  @ApiProperty({
    description:
      'ID do colaborador ao qual os tipos de documentos serão vinculados',
    example: 'uuid-do-colaborador',
  })
  @IsString({ message: 'O ID do colaborador deve ser uma string.' })
  @IsUUID('4', { message: 'O ID do colaborador deve ser um UUID válido.' })
  employeeId: string;

  @ApiProperty({
    description: 'Array de IDs dos tipos de documentos a serem vinculados',
    type: [String],
    example: ['uuid-do-cpf', 'uuid-do-rg'],
  })
  @IsArray({ message: 'Os tipos de documentos devem ser um array.' })
  @IsString({
    each: true,
    message: 'Cada ID de tipo de documento deve ser uma string.',
  })
  @IsUUID('4', {
    each: true,
    message: 'Cada ID de tipo de documento deve ser um UUID válido.',
  })
  @IsNotEmpty({
    each: true,
    message: 'Os IDs dos tipos de documentos não podem ser vazios.',
  })
  documentTypeIds: string[];
}
