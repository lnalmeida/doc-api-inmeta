import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationParamsDto } from 'src/common/types/pagination.types';

export class ListEmployeeDto extends PaginationParamsDto {
  @ApiProperty({
    description:
      'Filtrar colaborador pelo nome(busca parcial) Ex.: "Luis" retorna "Luis Silva", "André Luis", etc.',
    example: 'Luis',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string.' })
  name?: string;
}
