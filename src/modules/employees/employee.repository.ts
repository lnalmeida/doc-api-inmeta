import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IEmployeeRepository } from './interfaces/employee.repository.interface';
import { Employee } from '@prisma/client';
import { CreateEmployeeDto } from './dtos/create-employee.dto';
import { UpdateEmployeeDto } from './dtos/update-employee.dto';

@Injectable()
export class EmployeeRepository implements IEmployeeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createEmployee(data: CreateEmployeeDto): Promise<Employee> {
    const employeeData = {
      ...data,
      hiredAt: new Date(data.hiredAt),
    };
    return this.prisma.employee.create({ data: employeeData });
  }

  async findAllEmployees(): Promise<Employee[]> {
    return this.prisma.employee.findMany();
  }

  async findEmployeeById(id: string): Promise<Employee | null> {
    return this.prisma.employee.findUnique({ where: { id } });
  }

  async findEmployeeByCpf(cpf: string): Promise<Employee | null> {
    return this.prisma.employee.findUnique({ where: { cpf } });
  }

  async updateEmployee(id: string, data: UpdateEmployeeDto): Promise<Employee> {
    const updateData: any = { ...data };
    if (data.hiredAt) {
      updateData.hiredAt = new Date(data.hiredAt);
    }
    return this.prisma.employee.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteEmployee(id: string): Promise<void> {
    await this.prisma.employee.delete({ where: { id } });
  }
}