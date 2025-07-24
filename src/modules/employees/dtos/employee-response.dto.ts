import { ApiProperty } from '@nestjs/swagger';
import { Employee } from '../entities/employee.entity';


export class EmployeeResponseDto {
  @ApiProperty({ description: 'ID único do colaborador', example: 'uuid-do-colaborador' })
  id: string;

  @ApiProperty({ description: 'Nome completo do colaborador', example: 'João da Silva' })
  name: string;

  @ApiProperty({ description: 'CPF do colaborador', example: '123.456.789-00' })
  cpf: string;

  @ApiProperty({ description: 'Data de contratação do colaborador', example: '2023-01-15T00:00:00.000Z' })
  hiredAt: Date;

  constructor(employee: Employee) {
    this.id = employee.id;
    this.name = employee.name;
    this.cpf = employee.cpf;
    this.hiredAt = employee.hiredAt;
  }
}