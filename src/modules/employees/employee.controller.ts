import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dtos/create-employee.dto';
import { UpdateEmployeeDto } from './dtos/update-employee.dto';
import { EmployeeResponseDto } from './dtos/employee-response.dto';
import { ApiTags, ApiResponse, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('employee') 
@Controller('employee') 
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um novo colaborador' })
  @ApiBody({ type: CreateEmployeeDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Colaborador criado com sucesso.', type: EmployeeResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Colaborador com o mesmo CPF já existe.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados de entrada inválidos.' })
  async create(@Body() createEmployeeDto: CreateEmployeeDto): Promise<EmployeeResponseDto> {
    const employee = await this.employeeService.create(createEmployeeDto);
    return new EmployeeResponseDto(employee);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lista todos os colaboradores' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de colaboradores.', type: [EmployeeResponseDto] })
  async findAll(): Promise<EmployeeResponseDto[]> {
    const employees = await this.employeeService.findAll();
    return employees.map(emp => new EmployeeResponseDto(emp));
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtém um colaborador pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do colaborador', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detalhes do colaborador.', type: EmployeeResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Colaborador não encontrado.' })
  async findOne(@Param('id') id: string): Promise<EmployeeResponseDto> {
    const employee = await this.employeeService.findOne(id);
    return new EmployeeResponseDto(employee);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualiza um colaborador pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do colaborador', type: String })
  @ApiBody({ type: UpdateEmployeeDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Colaborador atualizado com sucesso.', type: EmployeeResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Colaborador não encontrado.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Colaborador com o mesmo CPF já existe.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados de entrada inválidos.' })
  async update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto): Promise<EmployeeResponseDto> {
    const employee = await this.employeeService.update(id, updateEmployeeDto);
    return new EmployeeResponseDto(employee);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui um colaborador pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do colaborador', type: String })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Colaborador excluído com sucesso.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Colaborador não encontrado.' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.employeeService.remove(id);
  }
}