import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UserGuard } from '../auth/user.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UpdateTaskDto } from './dto/update-task.dto';

@ApiBearerAuth()
@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('board/:boardId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Find all tasks in a given board' })
  @ApiParam({ name: 'boardId', type: String, required: true })
  @ApiResponse({ status: 200, type: [Task] })
  findTasksInBoard(
    @Param('boardId') boardId: string,
    @CurrentUser() user: User,
  ): Promise<Task[]> {
    return this.tasksService.findTasksInBoard(boardId, user.id);
  }

  @Get('column/:columnId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Find all tasks in a given column' })
  @ApiParam({ name: 'columnId', type: String, required: true })
  @ApiResponse({ status: 200, type: [Task] })
  findTasksInColumn(
    @Param('columnId') columnId: string,
    @CurrentUser() user: User,
  ): Promise<Task[]> {
    return this.tasksService.findTasksInColumn(columnId, user.id);
  }

  @Get(':taskId/available-statuses')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Get available new statuses for a task' })
  @ApiParam({ name: 'taskId', type: String, required: true })
  @ApiResponse({ status: 200, type: [String] })
  async getAvailableNewStatusesForTask(
    @Param('taskId') taskId: string,
  ): Promise<string[]> {
    return this.tasksService.getAvailableNewStatusesForTask(taskId);
  }

  @Post()
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, type: Task })
  create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.create(createTaskDto, user.id);
  }

  @Put(':taskId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'taskId', type: String, required: true })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, type: Task })
  update(
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.update(taskId, updateTaskDto, user.id);
  }

  @Delete(':taskId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 204 })
  delete(
    @Param('taskId') taskId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.tasksService.delete(taskId, user.id);
  }
}
