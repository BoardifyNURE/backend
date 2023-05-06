import { Module } from '@nestjs/common';

import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [TasksModule],
  controllers: [TodosController],
  providers: [TodosService],
  exports: [TodosService],
})
export class TodosModule {}
