import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { DocumentTypeService } from './document-type.service';
import { CreateDocumentTypeDto } from './dtos/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dtos/update-document-type.dto';
import { DocumentTypeResponseDto } from './dtos/document-type-response.dto';
import { ApiTags, ApiResponse, ApiOperation, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ListDocumentTypeDto } from './dtos/list-document-types.dto';
import { PaginationResult } from 'src/common/types/pagination.types';

@ApiTags('document-type') 
@Controller('document-type') 
export class DocumentTypeController {
  constructor(private readonly documentTypeService: DocumentTypeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um novo tipo de documento' })
  @ApiBody({ type: CreateDocumentTypeDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Tipo de documento criado com sucesso.', type: DocumentTypeResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Tipo de documento com o mesmo nome já existe.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados de entrada inválidos.' })
  async create(@Body() createDocumentTypeDto: CreateDocumentTypeDto): Promise<DocumentTypeResponseDto> {
    const documentType = await this.documentTypeService.create(createDocumentTypeDto);
    return new DocumentTypeResponseDto(documentType);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lista todos os tipos de documentos' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página (padrão: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número de itens por página (padrão: 10)' })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filtrar por nome do tipo de documento (busca parcial)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de tipos de documentos.', type: [DocumentTypeResponseDto] })
  async findAll(@Query() filters: ListDocumentTypeDto): Promise<PaginationResult<DocumentTypeResponseDto>> {
    const result = await this.documentTypeService.findAll(filters);
    const data =  result.data.map(dt => new DocumentTypeResponseDto(dt));
    return {
      ...result,
      data,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtém um tipo de documento pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do tipo de documento', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detalhes do tipo de documento.', type: DocumentTypeResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tipo de documento não encontrado.' })
  async findOne(@Param('id') id: string): Promise<DocumentTypeResponseDto> {
    const documentType = await this.documentTypeService.findOne(id);
    return new DocumentTypeResponseDto(documentType);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualiza um tipo de documento pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do tipo de documento', type: String })
  @ApiBody({ type: UpdateDocumentTypeDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tipo de documento atualizado com sucesso.', type: DocumentTypeResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tipo de documento não encontrado.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Tipo de documento com o mesmo nome já existe.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados de entrada inválidos.' })
  async update(@Param('id') id: string, @Body() updateDocumentTypeDto: UpdateDocumentTypeDto): Promise<DocumentTypeResponseDto> {
    const documentType = await this.documentTypeService.update(id, updateDocumentTypeDto);
    return new DocumentTypeResponseDto(documentType);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui um tipo de documento pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do tipo de documento', type: String })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Tipo de documento excluído com sucesso.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tipo de documento não encontrado.' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.documentTypeService.remove(id);
  }
}