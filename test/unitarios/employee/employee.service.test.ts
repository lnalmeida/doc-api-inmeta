// test/unit/modules/employees/employees.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeService } from '../../../src/modules/employees/employee.service';
import { IEmployeeRepository, EMPLOYEE_REPOSITORY } from '../../../src/modules/employees/interfaces/employee.repository.interface'; // Ajuste o caminho
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Employee } from '@prisma/client';
import { PaginationResult } from '../../../src/common/types/pagination.types'; // Ajuste o caminho

describe('EmployeesService', () => {
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
      providers: [
        EmployeeService,
        {
          provide: EMPLOYEE_REPOSITORY,
          useValue: mockEmployeeRepository,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('criar', () => {
    const createDto = {
      name: 'João da Silva',
      cpf: '123.456.789-00',
      hiredAt: '2023-01-01',
    };
    const createdEmployee: Employee = {
      id: 'mock-id-1',
      name: createDto.name,
      cpf: createDto.cpf,
      hiredAt: new Date(createDto.hiredAt),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('deve criar um colaborador com sucesso', async () => {
      mockEmployeeRepository.findEmployeeByCpf.mockResolvedValue(null); // CPF não existe
      mockEmployeeRepository.createEmployee.mockResolvedValue(createdEmployee);

      const result = await service.create(createDto);

      expect(result).toEqual(createdEmployee);
      expect(mockEmployeeRepository.findEmployeeByCpf).toHaveBeenCalledWith(createDto.cpf);
      expect(mockEmployeeRepository.createEmployee).toHaveBeenCalledWith(createDto);
    });

    it('deve lançar ConflictException se o CPF do colaborador já existir', async () => {
      mockEmployeeRepository.findEmployeeByCpf.mockResolvedValue(createdEmployee); // CPF já existe

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(mockEmployeeRepository.findEmployeeByCpf).toHaveBeenCalledWith(createDto.cpf);
      expect(mockEmployeeRepository.createEmployee).not.toHaveBeenCalled();
    });
  });

  describe('buscarTodos', () => {
    const filters = { page: 1, limit: 10, name: 'Silva' };
    const mockEmployees: Employee[] = [
      { id: '1', name: 'Maria Silva', cpf: '111.111.111-11', hiredAt: new Date(), createdAt: new Date(), updatedAt: new Date() },
      { id: '2', name: 'Pedro Silva', cpf: '222.222.222-22', hiredAt: new Date(), createdAt: new Date(), updatedAt: new Date() },
    ];
    const paginationResult: PaginationResult<Employee> = {
      data: mockEmployees,
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    it('deve retornar uma lista paginada de colaboradores', async () => {
      mockEmployeeRepository.findAllEmployees.mockResolvedValue(paginationResult);

      const result = await service.findAll(filters);

      expect(result).toEqual(paginationResult);
      expect(mockEmployeeRepository.findAllEmployees).toHaveBeenCalledWith(filters);
    });

    it('deve retornar uma lista vazia se nenhum colaborador for encontrado', async () => {
      const emptyFilters = { page: 1, limit: 10, name: 'Não Existe' };
      const emptyPaginationResult: PaginationResult<Employee> = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockEmployeeRepository.findAllEmployees.mockResolvedValue(emptyPaginationResult);

      const result = await service.findAll(emptyFilters);

      expect(result).toEqual(emptyPaginationResult);
      expect(mockEmployeeRepository.findAllEmployees).toHaveBeenCalledWith(emptyFilters);
    });
  });

  describe('buscarUm', () => {
    const employeeId = 'mock-id-encontrado';
    const foundEmployee: Employee = {
      id: employeeId,
      name: 'Ana Paula',
      cpf: '333.333.333-33',
      hiredAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('deve retornar um colaborador pelo ID', async () => {
      mockEmployeeRepository.findEmployeeById.mockResolvedValue(foundEmployee);

      const result = await service.findOne(employeeId);

      expect(result).toEqual(foundEmployee);
      expect(mockEmployeeRepository.findEmployeeById).toHaveBeenCalledWith(employeeId);
    });

    it('deve lançar NotFoundException se o colaborador não for encontrado pelo ID', async () => {
      mockEmployeeRepository.findEmployeeById.mockResolvedValue(null);

      await expect(service.findOne(employeeId)).rejects.toThrow(NotFoundException);
      expect(mockEmployeeRepository.findEmployeeById).toHaveBeenCalledWith(employeeId);
    });
  });

  describe('atualizar', () => {
    const employeeId = 'mock-id-atualizar';
    const existingEmployee: Employee = {
      id: employeeId,
      name: 'Colaborador Antigo',
      cpf: '444.444.444-44',
      hiredAt: new Date('2022-01-01'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('deve atualizar um colaborador com sucesso', async () => {
      const updateDto = { name: 'Colaborador Novo' };
      const updatedEmployee: Employee = { ...existingEmployee, name: updateDto.name };

      mockEmployeeRepository.findEmployeeById.mockResolvedValue(existingEmployee);
      mockEmployeeRepository.findEmployeeByCpf.mockResolvedValue(null); // Nenhum outro CPF igual
      mockEmployeeRepository.updateEmployee.mockResolvedValue(updatedEmployee);

      const result = await service.update(employeeId, updateDto);

      expect(result).toEqual(updatedEmployee);
      expect(mockEmployeeRepository.findEmployeeById).toHaveBeenCalledWith(employeeId);
      expect(mockEmployeeRepository.findEmployeeByCpf).not.toHaveBeenCalled(); // CPF não foi alterado
      expect(mockEmployeeRepository.updateEmployee).toHaveBeenCalledWith(employeeId, updateDto);
    });

    it('deve atualizar um colaborador com sucesso e verificar novo CPF', async () => {
      const updateDto = { cpf: '555.555.555-55' };
      const updatedEmployee: Employee = { ...existingEmployee, cpf: updateDto.cpf };
      const existingEmployeeWithOldCpf: Employee = { ...existingEmployee }; // Mocks findEmployeeById

      mockEmployeeRepository.findEmployeeById.mockResolvedValue(existingEmployeeWithOldCpf);
      mockEmployeeRepository.findEmployeeByCpf.mockResolvedValue(null); // Novo CPF não existe
      mockEmployeeRepository.updateEmployee.mockResolvedValue(updatedEmployee);

      const result = await service.update(employeeId, updateDto);

      expect(result).toEqual(updatedEmployee);
      expect(mockEmployeeRepository.findEmployeeById).toHaveBeenCalledWith(employeeId);
      expect(mockEmployeeRepository.findEmployeeByCpf).toHaveBeenCalledWith(updateDto.cpf);
      expect(mockEmployeeRepository.updateEmployee).toHaveBeenCalledWith(employeeId, updateDto);
    });

    it('deve lançar NotFoundException se o colaborador a ser atualizado não for encontrado', async () => {
      const updateDto = { name: 'Inexistente' };

      mockEmployeeRepository.findEmployeeById.mockResolvedValue(null);

      await expect(service.update(employeeId, updateDto)).rejects.toThrow(NotFoundException);
      expect(mockEmployeeRepository.findEmployeeById).toHaveBeenCalledWith(employeeId);
      expect(mockEmployeeRepository.updateEmployee).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException se a atualização resultar em um CPF já existente', async () => {
      const updateDto = { cpf: '666.666.666-66' };
      const employeeWithConflictingCpf: Employee = {
        id: 'mock-id-conflito',
        name: 'Outro Colaborador',
        cpf: updateDto.cpf,
        hiredAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockEmployeeRepository.findEmployeeById.mockResolvedValue(existingEmployee);
      mockEmployeeRepository.findEmployeeByCpf.mockResolvedValue(employeeWithConflictingCpf); // Conflito de CPF

      await expect(service.update(employeeId, updateDto)).rejects.toThrow(ConflictException);
      expect(mockEmployeeRepository.findEmployeeById).toHaveBeenCalledWith(employeeId);
      expect(mockEmployeeRepository.findEmployeeByCpf).toHaveBeenCalledWith(updateDto.cpf);
      expect(mockEmployeeRepository.updateEmployee).not.toHaveBeenCalled();
    });
  });

  describe('remover', () => {
    const employeeId = 'mock-id-remover';
    const existingEmployee: Employee = {
      id: employeeId,
      name: 'Colaborador a Remover',
      cpf: '777.777.777-77',
      hiredAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('deve deletar um colaborador com sucesso', async () => {
      mockEmployeeRepository.findEmployeeById.mockResolvedValue(existingEmployee);
      mockEmployeeRepository.deleteEmployee.mockResolvedValue(undefined);

      await service.remove(employeeId);

      expect(mockEmployeeRepository.findEmployeeById).toHaveBeenCalledWith(employeeId);
      expect(mockEmployeeRepository.deleteEmployee).toHaveBeenCalledWith(employeeId);
    });

    it('deve lançar NotFoundException se o colaborador a ser deletado não for encontrado', async () => {
      mockEmployeeRepository.findEmployeeById.mockResolvedValue(null);

      await expect(service.remove(employeeId)).rejects.toThrow(NotFoundException);
      expect(mockEmployeeRepository.findEmployeeById).toHaveBeenCalledWith(employeeId);
      expect(mockEmployeeRepository.deleteEmployee).not.toHaveBeenCalled();
    });
  });
});