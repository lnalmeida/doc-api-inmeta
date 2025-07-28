import { TestingModule, Test } from "@nestjs/testing";
import { DocumentStatus } from "@prisma/client";
import { PaginationGroupedPendingDocumentResult } from "src/common/types/pagination.types";
import { IDocumentTypeRepository, DOCUMENT_TYPE_REPOSITORY } from "src/modules/document-type/interfaces/document-type.repository.interface";
import { AssignDocumentTypesDto } from "src/modules/employee-documents/dtos/assign-document-types.dto";
import { EmployeeDocumentStatusDto } from "src/modules/employee-documents/dtos/employee-document-status.dto";
import { ListPendingDocumentsDto } from "src/modules/employee-documents/dtos/list-pending-documents.dto";
import { SubmitDocumentDto } from "src/modules/employee-documents/dtos/submit-document.dto";
import { EmployeeDocumentsController } from "src/modules/employee-documents/employee-documents.controller";
import { EmployeeDocumentsService } from "src/modules/employee-documents/employee-documents.service";
import { IEmployeeDocumentRepository, EMPLOYEE_DOCUMENT_REPOSITORY } from "src/modules/employee-documents/interfaces/employee-documents.repository.interface";
import { IEmployeeRepository, EMPLOYEE_REPOSITORY } from "src/modules/employees/interfaces/employee.repository.interface";

// Mocks de dados simplificados para este nível de teste
const mockEmployeeId = 'employee-id-test-1';
const mockDocTypeId1 = 'doc-type-id-test-1';
const mockDocTypeId2 = 'doc-type-id-test-2';
const mockEmployeeName = 'João Teste';
const mockDocumentTypeName1 = 'CPF Teste';
const mockDocumentTypeName2 = 'RG Teste';

describe('EmployeeDocumentsController (Integration)', () => {
  let controller: EmployeeDocumentsController;
  let service: EmployeeDocumentsService;

  let mockEmployeeDocumentRepository: jest.Mocked<IEmployeeDocumentRepository>;
  let mockEmployeeRepository: jest.Mocked<IEmployeeRepository>;
  let mockDocumentTypeRepository: jest.Mocked<IDocumentTypeRepository>;

  beforeEach(async () => {
    // Configura os mocks dos repositórios
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
      controllers: [EmployeeDocumentsController],
      providers: [
        EmployeeDocumentsService,
        { provide: EMPLOYEE_DOCUMENT_REPOSITORY, useValue: mockEmployeeDocumentRepository },
        { provide: EMPLOYEE_REPOSITORY, useValue: mockEmployeeRepository },
        { provide: DOCUMENT_TYPE_REPOSITORY, useValue: mockDocumentTypeRepository },
      ],
    }).compile();

    controller = module.get<EmployeeDocumentsController>(EmployeeDocumentsController);
    service = module.get<EmployeeDocumentsService>(EmployeeDocumentsService); // Obtém o serviço para mockar se necessário
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('POST /assign', () => {
    it('deve chamar o serviço para atribuir documentos e retornar sucesso', async () => {
      const assignDto: AssignDocumentTypesDto = { employeeId: mockEmployeeId, documentTypeIds: [mockDocTypeId1] };
      const serviceResult = [{ 
        id: 'mock-id', employeeId: mockEmployeeId, documentTypeId: mockDocTypeId1, status: DocumentStatus.PENDING, submittedAt: null, 
        createdAt: new Date(), updatedAt: new Date()
      }];

      // Mocka o método do serviço que o controller chama
      jest.spyOn(service, 'assignDocumentTypes').mockResolvedValue(serviceResult);

      const result = await controller.assignDocumentTypes(assignDto);

      expect(result).toEqual({ message: 'Tipos de documentos vinculados com sucesso.', assignedDocumentsCount: 1 });
      expect(service.assignDocumentTypes).toHaveBeenCalledWith(assignDto); // Verifica se o serviço foi chamado
    });

    // Testes de erro (controller verifica DTOs, serviço lança exceções que são tratadas pelo filtro global)
    // Para erros específicos de serviço, a lógica é testada nos testes unitários do serviço.
    // Aqui, apenas validamos que o controller delega.
  });

  describe('DELETE /unassign', () => {
    it('deve chamar o serviço para desvincular documentos e retornar 204', async () => {
      const unassignDto: AssignDocumentTypesDto = { employeeId: mockEmployeeId, documentTypeIds: [mockDocTypeId1] }; // Reutiliza AssignDto, mas é UnassignDto
      
      // Mocka o método do serviço
      jest.spyOn(service, 'unassignDocumentTypes').mockResolvedValue(undefined); // Não retorna nada

      const result = await controller.unassignDocumentTypes(unassignDto);

      expect(result).toBeUndefined(); // DELETE 204 retorna undefined/void
      expect(service.unassignDocumentTypes).toHaveBeenCalledWith(unassignDto);
    });
  });

  describe('PATCH /submit', () => {
    it('deve chamar o serviço para enviar um documento e retornar o documento atualizado', async () => {
      const submitDto: SubmitDocumentDto = { employeeId: mockEmployeeId, documentTypeId: mockDocTypeId1 };
      const submittedDocument = { 
        id: 'mock-id-submitted', employeeId: mockEmployeeId, documentTypeId: mockDocTypeId1, status: DocumentStatus.SUBMITTED, submittedAt: new Date(),
        createdAt: new Date(), updatedAt: new Date()
      };

      jest.spyOn(service, 'submitDocument').mockResolvedValue(submittedDocument);

      const result = await controller.submitDocument(submitDto);

      expect(result).toEqual(submittedDocument);
      expect(service.submitDocument).toHaveBeenCalledWith(submitDto);
    });
  });

  describe('GET /status/:employeeId', () => {
    it('deve chamar o serviço para obter status de documentação e retornar o resultado', async () => {
      const employeeId = mockEmployeeId;
      const serviceResult: EmployeeDocumentStatusDto = {
        employeeId: employeeId,
        employeeName: mockEmployeeName,
        documents: [
          { documentTypeId: mockDocTypeId1, documentTypeName: mockDocumentTypeName1, status: DocumentStatus.PENDING, submittedAt: null }
        ],
      };

      jest.spyOn(service, 'getEmployeeDocumentStatus').mockResolvedValue(serviceResult);

      const result = await controller.getEmployeeDocumentStatus(employeeId);

      expect(result).toEqual(serviceResult);
      expect(service.getEmployeeDocumentStatus).toHaveBeenCalledWith(employeeId);
    });
  });

  describe('GET /pending', () => {
    it('deve chamar o serviço para listar documentos pendentes e retornar o resultado paginado e agrupado', async () => {
      const filters: ListPendingDocumentsDto = { page: 1, limit: 10 };
      const serviceResult: PaginationGroupedPendingDocumentResult<EmployeeDocumentStatusDto> = {
        data: [{
          employeeId: mockEmployeeId,
          employeeName: mockEmployeeName,
          documents: [
            { documentTypeId: mockDocTypeId1, documentTypeName: mockDocumentTypeName1, status: DocumentStatus.PENDING, submittedAt: null }
          ],
        }],
        totalEmployees: 1,
        totalPendingDocuments: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      jest.spyOn(service, 'listPendingDocuments').mockResolvedValue(serviceResult);

      const result = await controller.listPendingDocuments(filters);

      expect(result).toEqual(serviceResult);
      expect(service.listPendingDocuments).toHaveBeenCalledWith(filters);
    });
  });
});