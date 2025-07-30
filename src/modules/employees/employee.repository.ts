import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IEmployeeRepository } from './interfaces/employee.repository.interface';
import { Employee, Prisma } from '@prisma/client';
import { CreateEmployeeDto } from './dtos/create-employee.dto';
import { UpdateEmployeeDto } from './dtos/update-employee.dto';
import { PaginationResult } from 'src/common/types/pagination.types';
import { ListEmployeeDto } from './dtos/list-employee.dto';

@Injectable()
export class EmployeeRepository implements IEmployeeRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createEmployee(data: CreateEmployeeDto): Promise<Employee> {
    const employeeData = {
      ...data,
      hiredAt: new Date(data.hiredAt),
    };
    return this.prismaService.employee.create({ data: employeeData });
  }

  async findAllEmployees(
    filters: ListEmployeeDto,
  ): Promise<PaginationResult<Employee>> {
    const { page = 1, limit = 10, name } = filters;
    const offset = (page - 1) * limit;

    const where: Prisma.EmployeeWhereInput = {};

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.employee.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.employee.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      page,
      limit,
      total,
      totalPages,
    };
  }

  async findEmployeeById(id: string): Promise<Employee | null> {
    return this.prismaService.employee.findUnique({ where: { id } });
  }

  async findEmployeeByCpf(cpf: string): Promise<Employee | null> {
    return this.prismaService.employee.findUnique({ where: { cpf } });
  }

  async updateEmployee(id: string, data: UpdateEmployeeDto): Promise<Employee> {
    const updateData: any = { ...data };
    if (data.hiredAt) {
      updateData.hiredAt = new Date(data.hiredAt);
    }
    return this.prismaService.employee.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteEmployee(id: string): Promise<void> {
    await this.prismaService.employee.delete({ where: { id } });
  }
}
