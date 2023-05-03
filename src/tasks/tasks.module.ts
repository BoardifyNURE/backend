import { Module } from '@nestjs/common';

import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { ColumnsModule } from '../columns/columns.module';
import { BoardsModule } from '../boards/boards.module';

@Module({
  imports: [ColumnsModule, BoardsModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
