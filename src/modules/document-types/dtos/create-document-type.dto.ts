import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDocumentTypeDto {
  @ApiProperty({
    description: 'Nome do tipo de documento (ex: "CPF", "RG")',
    example: 'Carteira de Trabalho',
  })
  @IsString({ message: 'O nome deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
  @MaxLength(100, { message: 'O nome não pode ter mais de 100 caracteres.' })
  name: string;
};