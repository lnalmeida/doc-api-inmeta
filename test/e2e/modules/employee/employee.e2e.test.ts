import * as request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common"
import { AppModule } from "src/app.module";
import { PrismaService } from "src/database/prisma.service";


describe('EmployeeController (e2e)', () =>{
    let app: INestApplication;
    let prismaService: PrismaService;

    const employee1Data = { name: 'Ana Souza', cpf: '520.142.890-85', hiredAt: '2023-01-01T00:00:00.000Z' };
    const employee2Data = { name: 'Bruno Silva', cpf: '10458411027', hiredAt: '2023-01-02T00:00:00.000Z' };
    const employee3Data = { name: 'Carlos Alves', cpf: '184.982.530-04', hiredAt: '2023-01-03T00:00:00.000Z' };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        prismaService = moduleFixture.get<PrismaService>(PrismaService);

        app.useGlobalPipes(new (await import('@nestjs/common')).ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }));
        app.useGlobalFilters(new (await import('../../../../src/common/filters/global-http-exception.filter')).AllExceptionsFilter());

        await app.init();
    });

    beforeEach(async () => {
        await prismaService.employeeDocument.deleteMany({}); 
        await prismaService.employee.deleteMany({});        
        await prismaService.documentType.deleteMany({});     
    });

    afterAll(async () => {
        await prismaService.employeeDocument.deleteMany({});
        await prismaService.employee.deleteMany({});
        await prismaService.documentType.deleteMany({});
        await app.close();
    });

    it('/employee (POST) - deve criar um novo registro de colaborador com sucesso', async () => {
        const cleanedCpf = employee1Data.cpf.replace(/\D/g, '');
        const createDto = { ...employee1Data, cpf: cleanedCpf };
        return request(app.getHttpServer())
            .post('/employee')
            .send(createDto)
            .expect(201) 
            .expect((res) => {
                expect(res.body.id).toBeDefined();
                expect(res.body.name).toBe(createDto.name);
                expect(res.body.cpf).toBe(createDto.cpf);
                expect(res.body.hiredAt).toBe(createDto.hiredAt);
            });
    });

    it('/employee (POST) - não deve criar colaborador com cpf duplicado', async () => {
        const cleanedCpf = employee1Data.cpf.replace(/\D/g, '');
        const createDto = { ...employee1Data, cpf: cleanedCpf };
        await request(app.getHttpServer()).post('/employee').send(createDto).expect(201);

        return request(app.getHttpServer())
            .post('/employee')
            .send(createDto)
            .expect(409) 
            .expect((res) => {
                expect(res.statusCode).toBe(409);
                expect(res.body.path).toBe('/employee');
                expect(res.body.message).toMatchObject({
                  error: 'Conflict',
                  message: 'Um colaborador com o CPF "52014289085" já existe.',
                  statusCode: 409,
                });
            });
    });

    it('/employee?name=[name]&page=[page]&limit=[limit] (GET) - deve listar colaboradores com paginação e filtro', async () => {

        await request(app.getHttpServer()).post('/employee').send(employee1Data);
        await request(app.getHttpServer()).post('/employee').send(employee2Data);
        await request(app.getHttpServer()).post('/employee').send(employee3Data);


        const res1 = await request(app.getHttpServer())
            .get('/employee?page=1&limit=2')
            .expect(200);

        expect(res1.body.data.length).toBe(2);
        expect(res1.body.total).toBe(3); 
        expect(res1.body.page).toBe(1);
        expect(res1.body.limit).toBe(2);


        const res2 = await request(app.getHttpServer())
          .get('/employee?name=Bruno&page=1&limit=2')
          .expect(200);

        expect(res2.body.data.length).toBe(1);
        expect(res2.body.data[0].name).toBe('Bruno Silva');
        expect(res2.body.total).toBe(1);
    });

    it('/employee/:id (GET) - deve retornar 404 se o colaborador não existir', async () => {
        return request(app.getHttpServer())
            .get('/employee/999999')
            .expect(404)
            .expect((res) => {
                expect(res.body.message).toMatchObject({
                  error: 'Not Found',
                  message: 'Colaborador com ID \"999999\" não encontrado.',
                  statusCode: 404,
                });
            });
    });



})