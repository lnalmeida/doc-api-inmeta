import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Patch,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { EmployeeDocumentsService } from './employee-documents.service';
import { AssignDocumentTypesDto } from './dtos/assign-document-types.dto';
import { UnassignDocumentTypesDto } from './dtos/unassign-document-types.dto';
import { SubmitDocumentDto } from './dtos/submit-document.dto';
import { EmployeeDocumentStatusDto } from './dtos/employee-document-status.dto';
import { ListPendingDocumentsDto } from './dtos/list-pending-documents.dto';
import { PaginationGroupedPendingDocumentResult, PaginationResult } from '../../common/types/pagination.types';
import { PendingDocumentResponseDto } from './dtos/pending-document-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('employee-documents')
@Controller('employee-documents') 
export class EmployeeDocumentsController {
  constructor(
    private readonly employeeDocumentsService: EmployeeDocumentsService,
  ) {}

  @Post('assign')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Vincula tipos de documentos a um colaborador',
    description: 'Associa um ou mais tipos de documentos a um colaborador, marcando-os como PENDENTE.',
  })
  @ApiBody({ type: AssignDocumentTypesDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tipos de documentos vinculados com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Colaborador não encontrado.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos ou IDs de tipo de documento inexistentes.',
  })
  async assignDocumentTypes(@Body() data: AssignDocumentTypesDto): Promise<any> {
    const assignedDocs = await this.employeeDocumentsService.assignDocumentTypes(data);
    return {
      message: 'Tipos de documentos vinculados com sucesso.',
      assignedDocumentsCount: assignedDocs.length,
    };
  }

  @Delete('unassign')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Desvincula tipos de documentos de um colaborador',
    description: 'Remove a associação de um ou mais tipos de documentos de um colaborador.',
  })
  @ApiBody({ type: UnassignDocumentTypesDto })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Tipos de documentos desvinculados com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Colaborador não encontrado.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos.',
  })
  async unassignDocumentTypes(@Body() data: UnassignDocumentTypesDto): Promise<void> {
    await this.employeeDocumentsService.unassignDocumentTypes(data);
  }


  @Patch('submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registra o envio de um documento de um colaborador',
    description: 'Altera o status de um documento específico para "ENVIADO".',
  })
  @ApiBody({ type: SubmitDocumentDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Documento submetido com sucesso.',
    type: PendingDocumentResponseDto, 
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Colaborador, tipo de documento ou vinculação não encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'O documento já foi enviado.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos.',
  })
  async submitDocument(@Body() data: SubmitDocumentDto): Promise<any> {
    const updatedDoc = await this.employeeDocumentsService.submitDocument(data);
    
    return updatedDoc; 
  }

  @Get('status/:employeeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtém o status de documentação de um colaborador específico',
    description: 'Retorna a lista de documentos vinculados a um colaborador, indicando quais estão PENDENTES e quais foram ENVIADOS.',
  })
  @ApiParam({
    name: 'employeeId',
    description: 'ID do colaborador para consultar o status da documentação',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status da documentação do colaborador.',
    type: EmployeeDocumentStatusDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Colaborador não encontrado.',
  })
  async getEmployeeDocumentStatus(
    @Param('employeeId') employeeId: string,
  ): Promise<EmployeeDocumentStatusDto> {
    return this.employeeDocumentsService.getEmployeeDocumentStatus(employeeId);
  }

  @Get('pending')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lista todos os documentos pendentes de todos os colaboradores',
    description: 'Retorna uma lista paginada de todos os documentos que ainda estão PENDENTES de envio, com filtros opcionais por colaborador e tipo de documento.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (padrão: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de itens por página (padrão: 10)',
  })
  @ApiQuery({
    name: 'employeeId',
    required: false,
    type: String,
    description: 'Filtrar por ID do colaborador',
  })
  @ApiQuery({
    name: 'documentTypeId',
    required: false,
    type: String,
    description: 'Filtrar por ID do tipo de documento',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista paginada de documentos pendentes.',
    type: () => PendingDocumentResponseDto, 
    isArray: true,
  })
  async listPendingDocuments(
    @Query() filters: ListPendingDocumentsDto,
  ): Promise<PaginationGroupedPendingDocumentResult<EmployeeDocumentStatusDto>> {
    return this.employeeDocumentsService.listPendingDocuments(filters);
  }
}