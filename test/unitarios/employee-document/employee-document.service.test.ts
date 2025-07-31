import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EmployeeDocumentsService } from '../../../src/modules/employee-documents/employee-documents.service';
import {
  IEmployeeDocumentRepository,
  EMPLOYEE_DOCUMENT_REPOSITORY,
} from '../../../src/modules/employee-documents/interfaces/employee-documents.repository.interface';
import {
  IEmployeeRepository,
  EMPLOYEE_REPOSITORY,
} from '../../../src/modules/employees/interfaces/employee.repository.interface';
import {
  IDocumentTypeRepository,
  DOCUMENT_TYPE_REPOSITORY,
} from '../../../src/modules/document-type/interfaces/document-type.repository.interface';
import {
  DocumentStatus,
  Employee,
  DocumentType,
  EmployeeDocument,
} from '@prisma/client';
import { PaginationResult } from '../../../src/common/types/pagination.types';
import {
  EmployeeDocumentWithDocumentType,
  EmployeeDocumentWithRelations,
} from '../../../src/common/types/EmployeeDocumentTypes'; // Ajuste o caminho se necessário

// Mocks de dados comuns para os testes
const mockEmployee: Employee = {
  id: 'employee-id-1',
  name: 'João Teste',
  cpf: '123.456.789-00',
  hiredAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockDocumentTypeCPF: DocumentType = {
  id: 'doc-type-id-cpf',
  name: 'CPF',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockDocumentTypeRG: DocumentType = {
  id: 'doc-type-id-rg',
  name: 'RG',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockEmployeeDocumentCPF_Pending: EmployeeDocumentWithDocumentType = {
  id: 'emp-doc-id-cpf-pending',
  employeeId: mockEmployee.id,
  documentTypeId: mockDocumentTypeCPF.id,
  status: DocumentStatus.PENDING,
  submittedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  documentType: mockDocumentTypeCPF,
};

const mockEmployeeDocumentRG_Pending: EmployeeDocumentWithDocumentType = {
  id: 'emp-doc-id-rg-pending',
  employeeId: mockEmployee.id,
  documentTypeId: mockDocumentTypeRG.id,
  status: DocumentStatus.PENDING,
  submittedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  documentType: mockDocumentTypeRG,
};

const mockEmployeeDocumentCPF_Submitted: EmployeeDocumentWithDocumentType = {
  ...mockEmployeeDocumentCPF_Pending,
  status: DocumentStatus.SUBMITTED,
  submittedAt: new Date(),
};

const mockEmployee2: Employee = {
  // <-- NOVO MOCK DE COLABORADOR
  id: 'employee-id-2',
  name: 'Maria Teste',
  cpf: '999.888.777-66',
  hiredAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockDocumentTypePIS: DocumentType = {
  // <-- NOVO MOCK DE TIPO DE DOCUMENTO
  id: 'doc-type-id-pis',
  name: 'PIS',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockEmployeeDocumentPIS_Pending_Emp2: EmployeeDocumentWithDocumentType = {
  // <-- NOVO MOCK DE DOCUMENTO
  id: 'emp-doc-id-pis-pending-emp2',
  employeeId: mockEmployee2.id,
  documentTypeId: mockDocumentTypePIS.id,
  status: DocumentStatus.PENDING,
  submittedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  documentType: mockDocumentTypePIS,
};

describe('EmployeeDocumentsService', () => {
  let service: EmployeeDocumentsService;
  let mockEmployeeDocumentRepository: jest.Mocked<IEmployeeDocumentRepository>;
  let mockEmployeeRepository: jest.Mocked<IEmployeeRepository>;
  let mockDocumentTypeRepository: jest.Mocked<IDocumentTypeRepository>;

  beforeEach(async () => {
    mockEmployeeDocumentRepository = {
      assignDocumentTypes: jest.fn(),
      unassignDocumentTypes: jest.fn(),
      submitDocument: jest.fn(),
      findEmployeeDocumentsByEmployeeId: jest.fn(),
      findPendingDocuments: jest.fn(),
      findByEmployeeIdAndDocumentTypeId: jest.fn(),
    } as jest.Mocked<IEmployeeDocumentRepository>;

    mockEmployeeRepository = {
      createEmployee: jest.fn(),
      findAllEmployees: jest.fn(),
      findEmployeeById: jest.fn(),
      findEmployeeByCpf: jest.fn(),
      updateEmployee: jest.fn(),
      deleteEmployee: jest.fn(),
    } as jest.Mocked<IEmployeeRepository>;

    mockDocumentTypeRepository = {
      createDocumentType: jest.fn(),
      findAllDocumentTypes: jest.fn(),
      findDocumentTypeById: jest.fn(),
      findDocumentTypeByName: jest.fn(),
      updateDocumentType: jest.fn(),
      deleteDocumentType: jest.fn(),
    } as jest.Mocked<IDocumentTypeRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeDocumentsService,
        {
          provide: EMPLOYEE_DOCUMENT_REPOSITORY,
          useValue: mockEmployeeDocumentRepository,
        },
        { provide: EMPLOYEE_REPOSITORY, useValue: mockEmployeeRepository },
        {
          provide: DOCUMENT_TYPE_REPOSITORY,
          useValue: mockDocumentTypeRepository,
        },
      ],
    }).compile();

    service = module.get<EmployeeDocumentsService>(EmployeeDocumentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('atribuirTiposDeDocumento', () => {
    it('deve atribuir novos tipos de documentos a um colaborador com sucesso', async () => {
      const assignDto = {
        employeeId: mockEmployee.id,
        documentTypeIds: [mockDocumentTypeCPF.id, mockDocumentTypeRG.id],
      };

      mockEmployeeRepository.findEmployeeById.mockResolvedValue(mockEmployee);
      mockDocumentTypeRepository.findAllDocumentTypes.mockResolvedValue({
        data: [mockDocumentTypeCPF, mockDocumentTypeRG],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      mockEmployeeDocumentRepository.findEmployeeDocumentsByEmployeeId.mockResolvedValue(
        [],
      );
      mockEmployeeDocumentRepository.assignDocumentTypes.mockResolvedValue([
        mockEmployeeDocumentCPF_Pending as EmployeeDocument,
        mockEmployeeDocumentRG_Pending as EmployeeDocument,
      ]);

      const result = await service.assignDocumentTypes(assignDto);

      expect(result.length).toBe(2);
      expect(result[0].documentTypeId).toBe(mockDocumentTypeCPF.id);
      expect(mockEmployeeRepository.findEmployeeById).toHaveBeenCalledWith(
        mockEmployee.id,
      );
      expect(
        mockDocumentTypeRepository.findAllDocumentTypes,
      ).toHaveBeenCalled();
      expect(
        mockEmployeeDocumentRepository.findEmployeeDocumentsByEmployeeId,
      ).toHaveBeenCalledWith(mockEmployee.id);
      expect(
        mockEmployeeDocumentRepository.assignDocumentTypes,
      ).toHaveBeenCalledWith(mockEmployee.id, [
        mockDocumentTypeCPF.id,
        mockDocumentTypeRG.id,
      ]);
    });

    it('deve lançar NotFoundException se o colaborador não for encontrado', async () => {
      const assignDto = {
        employeeId: 'non-existent-id',
        documentTypeIds: [mockDocumentTypeCPF.id],
      };

      mockEmployeeRepository.findEmployeeById.mockResolvedValue(null);

      await expect(service.assignDocumentTypes(assignDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockEmployeeRepository.findEmployeeById).toHaveBeenCalledWith(
        assignDto.employeeId,
      );
      expect(
        mockDocumentTypeRepository.findAllDocumentTypes,
      ).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se algum tipo de documento não existir', async () => {
      const assignDto = {
        employeeId: mockEmployee.id,
        documentTypeIds: [mockDocumentTypeCPF.id, 'non-existent-doc-type'],
      };

      mockEmployeeRepository.findEmployeeById.mockResolvedValue(mockEmployee);
      mockDocumentTypeRepository.findAllDocumentTypes.mockResolvedValue({
        // Apenas CPF existe
        data: [mockDocumentTypeCPF],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      await expect(service.assignDocumentTypes(assignDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(
        mockDocumentTypeRepository.findAllDocumentTypes,
      ).toHaveBeenCalled();
    });

    it('deve lançar ConflictException se um tipo de documento já estiver atribuído ao colaborador', async () => {
      const assignDto = {
        employeeId: mockEmployee.id,
        documentTypeIds: [mockDocumentTypeCPF.id, mockDocumentTypeRG.id],
      };

      mockEmployeeRepository.findEmployeeById.mockResolvedValue(mockEmployee);
      mockDocumentTypeRepository.findAllDocumentTypes.mockResolvedValue({
        data: [mockDocumentTypeCPF, mockDocumentTypeRG],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      // Um dos documentos já está atribuído (CPF)
      mockEmployeeDocumentRepository.findEmployeeDocumentsByEmployeeId.mockResolvedValue(
        [mockEmployeeDocumentCPF_Pending],
      );

      await expect(service.assignDocumentTypes(assignDto)).rejects.toThrow(
        ConflictException,
      );
      expect(
        mockEmployeeDocumentRepository.findEmployeeDocumentsByEmployeeId,
      ).toHaveBeenCalledWith(mockEmployee.id);
      expect(
        mockEmployeeDocumentRepository.assignDocumentTypes,
      ).not.toHaveBeenCalled(); // Não deve chamar o repositório para criar
    });
  });

  describe('desatribuirTiposDeDocumento', () => {
    it('deve desatribuir tipos de documentos de um colaborador com sucesso', async () => {
      const unassignDto = {
        employeeId: mockEmployee.id,
        documentTypeIds: [mockDocumentTypeCPF.id],
      };

      mockEmployeeRepository.findEmployeeById.mockResolvedValue(mockEmployee);
      mockEmployeeDocumentRepository.unassignDocumentTypes.mockResolvedValue(
        undefined,
      ); // delete retorna void

      await service.unassignDocumentTypes(unassignDto);

      expect(mockEmployeeRepository.findEmployeeById).toHaveBeenCalledWith(
        mockEmployee.id,
      );
      expect(
        mockEmployeeDocumentRepository.unassignDocumentTypes,
      ).toHaveBeenCalledWith(mockEmployee.id, unassignDto.documentTypeIds);
    });

    it('deve lançar NotFoundException se o colaborador para desatribuir não for encontrado', async () => {
      const unassignDto = {
        employeeId: 'non-existent-id',
        documentTypeIds: [mockDocumentTypeCPF.id],
      };

      mockEmployeeRepository.findEmployeeById.mockResolvedValue(null);

      await expect(service.unassignDocumentTypes(unassignDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockEmployeeRepository.findEmployeeById).toHaveBeenCalledWith(
        unassignDto.employeeId,
      );
      expect(
        mockEmployeeDocumentRepository.unassignDocumentTypes,
      ).not.toHaveBeenCalled();
    });
  });

  // --- Testes para submitDocument() ---
  describe('enviarDocumento', () => {
    const submitDto = {
      employeeId: mockEmployee.id,
      documentTypeId: mockDocumentTypeCPF.id,
    };
    const submittedDocument: EmployeeDocument = {
      ...mockEmployeeDocumentCPF_Submitted,
      //   documentType: mockDocumentTypeCPF,
      //   employee: mockEmployee // Adicionando employee para corresponder a EmployeeDocumentWithEmployeeAndDocumentType, se aplicável
    };

    it('deve registrar o envio de um documento com sucesso', async () => {
      mockEmployeeRepository.findEmployeeById.mockResolvedValue(mockEmployee);
      mockDocumentTypeRepository.findDocumentTypeById.mockResolvedValue(
        mockDocumentTypeCPF,
      );
      mockEmployeeDocumentRepository.findByEmployeeIdAndDocumentTypeId.mockResolvedValue(
        mockEmployeeDocumentCPF_Pending,
      ); // Documento pendente
      mockEmployeeDocumentRepository.submitDocument.mockResolvedValue(
        submittedDocument,
      );

      const result = await service.submitDocument(submitDto);

      expect(result.status).toBe(DocumentStatus.SUBMITTED);
      expect(mockEmployeeRepository.findEmployeeById).toHaveBeenCalledWith(
        submitDto.employeeId,
      );
      expect(
        mockDocumentTypeRepository.findDocumentTypeById,
      ).toHaveBeenCalledWith(submitDto.documentTypeId);
      expect(
        mockEmployeeDocumentRepository.findByEmployeeIdAndDocumentTypeId,
      ).toHaveBeenCalledWith(submitDto.employeeId, submitDto.documentTypeId);
      expect(
        mockEmployeeDocumentRepository.submitDocument,
      ).toHaveBeenCalledWith(
        submitDto.employeeId,
        submitDto.documentTypeId,
        submitDto,
      );
    });

    it('deve lançar NotFoundException se o colaborador não for encontrado ao enviar documento', async () => {
      mockEmployeeRepository.findEmployeeById.mockResolvedValue(null);

      await expect(service.submitDocument(submitDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockEmployeeRepository.findEmployeeById).toHaveBeenCalledWith(
        submitDto.employeeId,
      );
      expect(
        mockDocumentTypeRepository.findDocumentTypeById,
      ).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se o tipo de documento não for encontrado ao enviar documento', async () => {
      mockEmployeeRepository.findEmployeeById.mockResolvedValue(mockEmployee);
      mockDocumentTypeRepository.findDocumentTypeById.mockResolvedValue(null);

      await expect(service.submitDocument(submitDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(
        mockDocumentTypeRepository.findDocumentTypeById,
      ).toHaveBeenCalledWith(submitDto.documentTypeId);
      expect(
        mockEmployeeDocumentRepository.findByEmployeeIdAndDocumentTypeId,
      ).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se a vinculação do documento não for encontrada (não atribuído)', async () => {
      mockEmployeeRepository.findEmployeeById.mockResolvedValue(mockEmployee);
      mockDocumentTypeRepository.findDocumentTypeById.mockResolvedValue(
        mockDocumentTypeCPF,
      );
      mockEmployeeDocumentRepository.findByEmployeeIdAndDocumentTypeId.mockResolvedValue(
        null,
      ); // Não vinculado

      await expect(service.submitDocument(submitDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(
        mockEmployeeDocumentRepository.findByEmployeeIdAndDocumentTypeId,
      ).toHaveBeenCalledWith(submitDto.employeeId, submitDto.documentTypeId);
      expect(
        mockEmployeeDocumentRepository.submitDocument,
      ).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException se o documento já estiver ENVIADO', async () => {
      mockEmployeeRepository.findEmployeeById.mockResolvedValue(mockEmployee);
      mockDocumentTypeRepository.findDocumentTypeById.mockResolvedValue(
        mockDocumentTypeCPF,
      );
      mockEmployeeDocumentRepository.findByEmployeeIdAndDocumentTypeId.mockResolvedValue(
        mockEmployeeDocumentCPF_Submitted,
      ); // Já enviado

      await expect(service.submitDocument(submitDto)).rejects.toThrow(
        ConflictException,
      );
      expect(
        mockEmployeeDocumentRepository.findByEmployeeIdAndDocumentTypeId,
      ).toHaveBeenCalledWith(submitDto.employeeId, submitDto.documentTypeId);
      expect(
        mockEmployeeDocumentRepository.submitDocument,
      ).not.toHaveBeenCalled();
    });
  });

  // --- Testes para getEmployeeDocumentStatus() ---
  describe('obterStatusDocumentacaoColaborador', () => {
    it('deve retornar o status de documentação de um colaborador', async () => {
      const employeeId = mockEmployee.id;
      const docsWithRelations: EmployeeDocumentWithDocumentType[] = [
        mockEmployeeDocumentCPF_Pending,
        mockEmployeeDocumentRG_Pending,
      ];

      mockEmployeeRepository.findEmployeeById.mockResolvedValue(mockEmployee);
      mockEmployeeDocumentRepository.findEmployeeDocumentsByEmployeeId.mockResolvedValue(
        docsWithRelations,
      );

      const result = await service.getEmployeeDocumentStatus(employeeId);

      expect(result).toBeDefined();
      expect(result.employeeId).toBe(employeeId);
      expect(result.documents.length).toBe(2);
      expect(result.documents[0].status).toBe(DocumentStatus.PENDING);
      expect(result.documents[0].documentTypeName).toBe(
        mockDocumentTypeCPF.name,
      );
      expect(mockEmployeeRepository.findEmployeeById).toHaveBeenCalledWith(
        employeeId,
      );
      expect(
        mockEmployeeDocumentRepository.findEmployeeDocumentsByEmployeeId,
      ).toHaveBeenCalledWith(employeeId);
    });

    it('deve lançar NotFoundException se o colaborador não for encontrado', async () => {
      const employeeId = 'non-existent-employee-id';
      mockEmployeeRepository.findEmployeeById.mockResolvedValue(null);

      await expect(
        service.getEmployeeDocumentStatus(employeeId),
      ).rejects.toThrow(NotFoundException);
      expect(mockEmployeeRepository.findEmployeeById).toHaveBeenCalledWith(
        employeeId,
      );
      expect(
        mockEmployeeDocumentRepository.findEmployeeDocumentsByEmployeeId,
      ).not.toHaveBeenCalled();
    });
  });

  // --- Testes para listPendingDocuments() ---
  describe('listarDocumentosPendentes', () => {
    it('deve retornar uma lista paginada de documentos pendentes agrupados por colaborador', async () => {
      // Nome do teste atualizado
      const filters = { page: 1, limit: 1 }; // Limite 1 para testar paginação de colaboradores

      // ATENÇÃO: Adicione documentos de outro colaborador
      const pendingDocsWithRelations: EmployeeDocumentWithRelations[] = [
        {
          // Documento do mockEmployee
          ...mockEmployeeDocumentCPF_Pending,
          employee: mockEmployee,
          documentType: mockDocumentTypeCPF,
          id: 'id-pending-emp1-doc1',
        } as EmployeeDocumentWithRelations, // Cast explícito
        {
          // Outro documento do mockEmployee
          ...mockEmployeeDocumentRG_Pending,
          employee: mockEmployee,
          documentType: mockDocumentTypeRG,
          id: 'id-pending-emp1-doc2',
        } as EmployeeDocumentWithRelations,
        {
          // Documento do mockEmployee2 (importante para ter 2 grupos)
          ...mockEmployeeDocumentPIS_Pending_Emp2,
          employee: mockEmployee2,
          documentType: mockDocumentTypePIS,
          id: 'id-pending-emp2-doc1',
        } as EmployeeDocumentWithRelations,
      ];

      // Total de documentos pendentes (3)
      const totalPendingDocuments = pendingDocsWithRelations.length;

      const paginationResult: PaginationResult<EmployeeDocumentWithRelations> =
        {
          data: pendingDocsWithRelations,
          total: totalPendingDocuments,
          page: 1,
          limit: 10,
          totalPages: 1, // Estes são os dados antes do agrupamento
        };

      mockEmployeeDocumentRepository.findPendingDocuments.mockResolvedValue(
        paginationResult,
      );

      const result = await service.listPendingDocuments(filters);

      expect(result).toBeDefined();
      expect(result.data.length).toBe(1); // Espera 1 COLABORADOR na primeira página (limit=1)
      expect(result.totalEmployees).toBe(2); // Agora, 2 colaboradores agrupados (João e Maria)
      expect(result.totalPendingDocuments).toBe(totalPendingDocuments); // Total de documentos pendentes (3)
      expect(result.page).toBe(1);
      expect(result.limit).toBe(1);
      expect(result.totalPages).toBe(2); // 2 colaboradores / 1 limite por página = 2 páginas

      expect(result.data[0].employeeId).toBe(mockEmployee.id);
      expect(result.data[0].documents.length).toBe(2); // 2 documentos para João
      expect(
        result.data[0].documents.every(
          (d) => d.status === DocumentStatus.PENDING,
        ),
      ).toBeTruthy();

      // Testa a segunda página
      const filtersPage2 = { page: 2, limit: 1 };
      const resPage2 = await service.listPendingDocuments(filtersPage2); // Chama o serviço novamente para simular a 2a página

      expect(resPage2.data.length).toBe(1);
      expect(resPage2.totalEmployees).toBe(2);
      expect(resPage2.totalPendingDocuments).toBe(totalPendingDocuments);
      expect(resPage2.page).toBe(2);
      expect(resPage2.limit).toBe(1);
      expect(resPage2.totalPages).toBe(2);
      expect(resPage2.data[0].employeeId).toBe(mockEmployee2.id); // Deve ser o segundo colaborador
      expect(resPage2.data[0].documents.length).toBe(1); // 1 documento para Maria
    });

    // ... (restante do seu describe, ajustando as expectativas para totalEmployees e totalPendingDocuments)
    it('deve retornar uma lista vazia se não houver documentos pendentes', async () => {
      const filters = { page: 1, limit: 10 };
      const emptyPaginationResult: PaginationResult<EmployeeDocumentWithRelations> =
        {
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        };

      mockEmployeeDocumentRepository.findPendingDocuments.mockResolvedValue(
        emptyPaginationResult,
      );

      const result = await service.listPendingDocuments(filters);

      expect(result).toEqual({
        // Deve comparar com o novo formato de retorno agrupado
        data: [],
        totalEmployees: 0,
        totalPendingDocuments: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
      expect(
        mockEmployeeDocumentRepository.findPendingDocuments,
      ).toHaveBeenCalledWith(filters);
    });
  });
});
