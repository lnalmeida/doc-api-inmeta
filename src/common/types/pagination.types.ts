import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationParamsDto {
  @ApiProperty({
    description: 'Número da página (baseado em 1)',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro.' })
  @Min(1, { message: 'A página deve ser no mínimo 1.' })
  page?: number = 1;

  @ApiProperty({
    description: 'Número de itens por página',
    example: 10,
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro.' })
  @Min(1, { message: 'O limite deve ser no mínimo 1.' })
  limit?: number = 10;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}