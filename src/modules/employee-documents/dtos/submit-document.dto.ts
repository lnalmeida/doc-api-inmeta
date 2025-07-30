import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class SubmitDocumentDto {
  @ApiProperty({
    description: 'ID do colaborador que está enviando o documento',
    example: 'uuid-do-colaborador',
  })
  @IsString({ message: 'O ID do colaborador deve ser uma string.' })
  @IsUUID('4', { message: 'O ID do colaborador deve ser um UUID válido.' })
  employeeId: string;

  @ApiProperty({
    description: 'ID do tipo de documento que está sendo enviado',
    example: 'uuid-do-cpf',
  })
  @IsString({ message: 'O ID do tipo de documento deve ser uma string.' })
  @IsUUID('4', {
    message: 'O ID do tipo de documento deve ser um UUID válido.',
  })
  documentTypeId: string;
}
