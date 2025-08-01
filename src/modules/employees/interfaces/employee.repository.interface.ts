import { Employee } from '@prisma/client';
import { CreateEmployeeDto } from '../dtos/create-employee.dto';
import { UpdateEmployeeDto } from '../dtos/update-employee.dto';
import { PaginationResult } from 'src/common/types/pagination.types';
import { ListEmployeeDto } from '../dtos/list-employee.dto';

export interface IEmployeeRepository {
  createEmployee(data: CreateEmployeeDto): Promise<Employee>;
  findAllEmployees(
    filters: ListEmployeeDto,
  ): Promise<PaginationResult<Employee>>;
  findEmployeeById(id: string): Promise<Employee | null>;
  findEmployeeByCpf(cpf: string): Promise<Employee | null>;
  updateEmployee(id: string, data: UpdateEmployeeDto): Promise<Employee>;
  deleteEmployee(id: string): Promise<void>;
}

export const EMPLOYEE_REPOSITORY = 'EMPLOYEE_REPOSITORY';
