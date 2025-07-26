import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Employee } from '@prisma/client';
import { CreateEmployeeDto } from './dtos/create-employee.dto';
import { UpdateEmployeeDto } from './dtos/update-employee.dto';
import { IEmployeeRepository, EMPLOYEE_REPOSITORY } from './interfaces/employee.repository.interface';
import { ListEmployeeDto } from './dtos/list-employee.dto';
import { PaginationResult } from 'src/common/types/pagination.types';

@Injectable()
export class EmployeeService {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: IEmployeeRepository,
  ) {}

  async create(data: CreateEmployeeDto): Promise<Employee> {
    const cleanedCpf = data.cpf.replace(/\D/g, '');
    const existingEmployee = await this.employeeRepository.findEmployeeByCpf(cleanedCpf);
    if (existingEmployee) {
      throw new ConflictException(`Um colaborador com o CPF "${data.cpf}" já existe.`);
    }
    data.cpf = cleanedCpf; 
    return this.employeeRepository.createEmployee(data);
  }

  async findAll(filters: ListEmployeeDto): Promise<PaginationResult<Employee>> {
    return this.employeeRepository.findAllEmployees(filters);
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findEmployeeById(id);
    if (!employee) {
      throw new NotFoundException(`Colaborador com ID "${id}" não encontrado.`);
    }
    return employee;
  }

  async update(id: string, data: UpdateEmployeeDto): Promise<Employee> {
    const existingEmployee = await this.employeeRepository.findEmployeeById(id);
    if (!existingEmployee) {
      throw new NotFoundException(`Colaborador com ID "${id}" não encontrado.`);
    }

    if (data.cpf && data.cpf !== existingEmployee.cpf) {
      const employeeWithSameCpf = await this.employeeRepository.findEmployeeByCpf(data.cpf);
      if (employeeWithSameCpf && employeeWithSameCpf.id !== id) {
        throw new ConflictException(`Um colaborador com o CPF "${data.cpf}" já existe.`);
      }
    }

    return this.employeeRepository.updateEmployee(id, data);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.employeeRepository.findEmployeeById(id);
    if (!employee) {
      throw new NotFoundException(`Colaborador com ID "${id}" não encontrado.`);
    }
    await this.employeeRepository.deleteEmployee(id);
  }
}