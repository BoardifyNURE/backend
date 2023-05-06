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

import { Todo } from './entities/todo.entity';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UserGuard } from '../auth/user.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UpdateTodoDto } from './dto/update-todo.dto';

@ApiTags('todos')
@ApiBearerAuth()
@Controller('todos')
export class TodosController {
  constructor(private readonly todoService: TodosService) {}

  @Get(':taskId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Find all todo for a given task' })
  @ApiParam({ name: 'taskId', type: String, required: true })
  @ApiResponse({ status: 200, type: [Todo] })
  findTodosInTask(
    @Param('taskId') taskId: string,
    @CurrentUser() user: User,
  ): Promise<Todo[]> {
    return this.todoService.findTodosInTask(taskId, user.id);
  }

  @Post()
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Create a new todo' })
  @ApiBody({ type: CreateTodoDto })
  @ApiResponse({ status: 201, type: Todo })
  create(
    @Body() createTodoDto: CreateTodoDto,
    @CurrentUser() user: User,
  ): Promise<Todo> {
    return this.todoService.create(createTodoDto, user.id);
  }

  @Put(':todoId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Update a todo' })
  @ApiParam({ name: 'todoId', type: String, required: true })
  @ApiBody({ type: UpdateTodoDto })
  @ApiResponse({ status: 200, type: Todo })
  update(
    @Param('todoId') todoId: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @CurrentUser() user: User,
  ): Promise<Todo> {
    return this.todoService.update(todoId, updateTodoDto, user.id);
  }

  @Delete(':todoId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Delete a todo' })
  @ApiParam({ name: 'todoId', type: String, required: true })
  @ApiResponse({ status: 204 })
  delete(
    @Param('todoId') todoId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.todoService.delete(todoId, user.id);
  }
}
