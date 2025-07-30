import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { EmployeeRepository } from './employee.repository';
import { EMPLOYEE_REPOSITORY } from './interfaces/employee.repository.interface';

@Module({
  controllers: [EmployeeController],
  providers: [
    EmployeeService,
    {
      provide: EMPLOYEE_REPOSITORY,
      useClass: EmployeeRepository,
    },
  ],
  exports: [EmployeeService, EMPLOYEE_REPOSITORY],
})
export class EmployeeModule {}
