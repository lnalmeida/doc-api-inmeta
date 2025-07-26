import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationParamsDto } from '../../../common/types/pagination.types';
import { Transform } from 'class-transformer';

export class ListPendingDocumentsDto extends PaginationParamsDto {
  @ApiProperty({
    description: 'ID do colaborador para filtrar documentos pendentes',
    example: 'uuid-do-colaborador',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O ID do colaborador deve ser uma string.' })
  @IsUUID('4', { message: 'O ID do colaborador deve ser um UUID válido.' })
  @Transform(({ value }) => value === '' ? undefined : value )
  employeeId?: string;

  @ApiProperty({
    description: 'ID do tipo de documento para filtrar documentos pendentes',
    example: 'uuid-do-cpf',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O ID do tipo de documento deve ser uma string.' })
  @IsUUID('4', { message: 'O ID do tipo de documento deve ser um UUID válido.' })
  @Transform(({ value }) => value === '' ? undefined : value )
  documentTypeId?: string;
}