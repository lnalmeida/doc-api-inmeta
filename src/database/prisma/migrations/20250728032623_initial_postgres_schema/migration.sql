-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'SUBMITTED');

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "hired_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_documents" (
    "id" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL,
    "employeeId" TEXT NOT NULL,
    "documentTypeId" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_cpf_key" ON "employees"("cpf");

-- CreateIndex
CREATE INDEX "employees_name_idx" ON "employees"("name");

-- CreateIndex
CREATE INDEX "employees_hired_at_idx" ON "employees"("hired_at");

-- CreateIndex
CREATE UNIQUE INDEX "document_types_name_key" ON "document_types"("name");

-- CreateIndex
CREATE INDEX "document_types_name_idx" ON "document_types"("name");

-- CreateIndex
CREATE INDEX "employee_documents_status_idx" ON "employee_documents"("status");

-- CreateIndex
CREATE INDEX "employee_documents_employeeId_idx" ON "employee_documents"("employeeId");

-- CreateIndex
CREATE INDEX "employee_documents_documentTypeId_idx" ON "employee_documents"("documentTypeId");

-- CreateIndex
CREATE INDEX "employee_documents_employeeId_status_idx" ON "employee_documents"("employeeId", "status");

-- CreateIndex
CREATE INDEX "employee_documents_documentTypeId_status_idx" ON "employee_documents"("documentTypeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "employee_documents_employeeId_documentTypeId_key" ON "employee_documents"("employeeId", "documentTypeId");

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "document_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
