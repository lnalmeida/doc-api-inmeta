import { TestingModule, Test } from '@nestjs/testing';
import { Employee } from '@prisma/client';
import { cpf } from 'cpf-cnpj-validator';
import { EmployeeController } from 'src/modules/employees/employee.controller';
import { EmployeeService } from 'src/modules/employees/employee.service';
import { PaginationResult } from 'src/common/types/pagination.types';
import { CreateEmployeeDto } from 'src/modules/employees/dtos/create-employee.dto';
import { EmployeeResponseDto } from 'src/modules/employees/dtos/employee-response.dto';
import { ListEmployeeDto } from 'src/modules/employees/dtos/list-employee.dto';
import { UpdateEmployeeDto } from 'src/modules/employees/dtos/update-employee.dto';
import {
  IEmployeeRepository,
  EMPLOYEE_REPOSITORY,
} from 'src/modules/employees/interfaces/employee.repository.interface';
import { config } from 'dotenv';

config({ path: '.env.test', override: true });

// Mocks de dados
const mockEmployee1: Employee = {
  id: 'employee-id-1',
  name: 'Ana Silva',
  cpf: cpf.generate(),
  hiredAt: new Date('2023-01-01'),
  createdAt: new Date(),
  updatedAt: new Date(),
};
const mockEmployee2: Employee = {
  id: 'employee-id-2',
  name: 'Pedro Souza',
  cpf: cpf.generate(),
  hiredAt: new Date('2023-02-01'),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('EmployeesController (Integration)', () => {
  let controller: EmployeeController;
  let service: EmployeeService;
  let mockEmployeeRepository: jest.Mocked<IEmployeeRepository>;

  beforeEach(async () => {
    mockEmployeeRepository = {
      createEmployee: jest.fn(),
      findAllEmployees: jest.fn(),
      findEmployeeById: jest.fn(),
      findEmployeeByCpf: jest.fn(),
      updateEmployee: jest.fn(),
      deleteEmployee: jest.fn(),
    } as jest.Mocked<IEmployeeRepository>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        EmployeeService,
        { provide: EMPLOYEE_REPOSITORY, useValue: mockEmployeeRepository },
      ],
    }).compile();

    controller = module.get<EmployeeController>(EmployeeController);
    service = module.get<EmployeeService>(EmployeeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('POST /employee', () => {
    it('deve chamar o serviço para criar e retornar o colaborador', async () => {
      const createDto: CreateEmployeeDto = {
        name: 'Novo Colaborador',
        cpf: cpf.generate(),
        hiredAt: '2024-03-01',
      };
      const createdEmployee: Employee = {
        ...mockEmployee1,
        id: 'new-id',
        name: createDto.name,
        cpf: createDto.cpf,
      };
      jest.spyOn(service, 'create').mockResolvedValue(createdEmployee);

      const result = await controller.create(createDto);

      expect(result).toEqual(new EmployeeResponseDto(createdEmployee));
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('GET /employee', () => {
    it('deve chamar o serviço para listar colaboradores com paginação', async () => {
      const filters: ListEmployeeDto = { page: 1, limit: 10 };
      const serviceResult: PaginationResult<Employee> = {
        data: [mockEmployee1, mockEmployee2],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      jest.spyOn(service, 'findAll').mockResolvedValue(serviceResult);

      const result = await controller.findAll(filters);

      expect(result.data.length).toBe(2);
      expect(result.total).toBe(2);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('GET /employee/:id', () => {
    it('deve chamar o serviço para buscar um colaborador pelo ID', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockEmployee1);

      const result = await controller.findOne(mockEmployee1.id);

      expect(result).toEqual(new EmployeeResponseDto(mockEmployee1));
      expect(service.findOne).toHaveBeenCalledWith(mockEmployee1.id);
    });
  });

  describe('PATCH /employee/:id', () => {
    it('deve chamar o serviço para atualizar um colaborador', async () => {
      const updateDto: UpdateEmployeeDto = { name: 'Updated Employee' };
      const updatedEmployee: Employee = {
        ...mockEmployee1,
        name: 'Updated Employee',
      };
      jest.spyOn(service, 'update').mockResolvedValue(updatedEmployee);

      const result = await controller.update(mockEmployee1.id, updateDto);

      expect(result).toEqual(new EmployeeResponseDto(updatedEmployee));
      expect(service.update).toHaveBeenCalledWith(mockEmployee1.id, updateDto);
    });
  });

  describe('DELETE /employee/:id', () => {
    it('deve chamar o serviço para remover um colaborador', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      const result = await controller.remove(mockEmployee1.id);

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(mockEmployee1.id);
    });
  });
});
