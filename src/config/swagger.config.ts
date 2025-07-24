import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

const setupSwagger = (app: INestApplication) => {
    const swaggerConfig = new DocumentBuilder()
        .setTitle('API de Gerenciamento de Documentação de Colaboradores')
        .setDescription('API RESTful para gerenciar a documentação obrigatória de colaboradores e o status de envio.')
        .setVersion('1.0')
        .addTag('employee', 'Operações relacionadas a colaboradores')
        .addTag('document-type', 'Operações relacionadas a tipos de documentos')
        .addTag('employee-documents', 'Operações de vinculação e status de documentos de colaboradores')
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api-docs', app, document);

};

export { setupSwagger };