import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Employee } from '@prisma/client';
import { CreateEmployeeDto } from './dtos/create-employee.dto';
import { UpdateEmployeeDto } from './dtos/update-employee.dto';
import { IEmployeeRepository, EMPLOYEE_REPOSITORY } from './interfaces/employee.repository.interface';

@Injectable()
export class EmployeeService {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: IEmployeeRepository,
  ) {}

  async create(data: CreateEmployeeDto): Promise<Employee> {
    const existingEmployee = await this.employeeRepository.findEmployeeByCpf(data.cpf);
    if (existingEmployee) {
      throw new ConflictException(`Um colaborador com o CPF "${data.cpf}" já existe.`);
    }
    return this.employeeRepository.createEmployee(data);
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.findAllEmployees();
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