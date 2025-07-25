import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationParamsDto } from "src/common/types/pagination.types";

export class ListDocumentTypeDto extends PaginationParamsDto{
    @ApiProperty({
        description: 'Filtrar tipo de documento pelo nome(busca parcial).',
        example: 'Carteira de Trabalho',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'O nome deve ser uma string.' })
    name?: string;
};