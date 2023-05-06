import { BadRequestException, Injectable } from '@nestjs/common';
import { Knex } from 'knex';

import { db } from '../db';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class TodosService {
  constructor(private readonly tasksService: TasksService) {}

  queryBuilder() {
    return db<Todo>('todos');
  }

  async findTodosInTask(taskId: string, userId: string): Promise<Todo[]> {
    await this.tasksService.verifyUserTaskAccess(userId, taskId);
    return this.queryBuilder().where('task_id', taskId).orderBy('order');
  }

  private async shiftTodosOrder(
    taskId: string,
    startOrder: number,
    endOrder: number,
    increment: boolean,
    trx: Knex.Transaction,
  ) {
    const query = this.queryBuilder()
      .transacting(trx)
      .where('task_id', taskId)
      .andWhereBetween('order', [startOrder, endOrder]);

    if (increment) {
      await query.increment('order', 1);
    } else {
      await query.decrement('order', 1);
    }
  }

  private async handleOrderChange(
    todo: Todo,
    dto: CreateTodoDto | UpdateTodoDto,
    trx: Knex.Transaction,
  ) {
    const countTodosResponse = await this.queryBuilder()
      .where('task_id', todo.task_id)
      .count();
    const numberOfTodosInTask = Number(countTodosResponse[0].count);
    if (dto.order === undefined || dto.order > numberOfTodosInTask) {
      dto.order = numberOfTodosInTask;
    } else if (dto.order < 0) {
      throw new BadRequestException(
        'Todo order must be greater than or equal to 0',
      );
    }

    if (dto.order !== todo.order) {
      const start_order = dto.order;
      const end_order = todo.order || numberOfTodosInTask;

      if (start_order < end_order) {
        await this.shiftTodosOrder(
          todo.task_id,
          start_order,
          end_order,
          true,
          trx,
        );
      } else {
        await this.shiftTodosOrder(
          todo.task_id,
          end_order,
          start_order,
          false,
          trx,
        );
      }
    }
  }

  async create(dto: CreateTodoDto, userId: string): Promise<Todo> {
    await this.tasksService.verifyUserTaskAccess(userId, dto.task_id);

    const trx = await db.transaction();
    try {
      const todo = new Todo();
      todo.task_id = dto.task_id;

      await this.handleOrderChange(todo, dto, trx);

      const [newTodo] = await this.queryBuilder()
        .transacting(trx)
        .insert(dto)
        .returning('*');

      await trx.commit();

      return newTodo;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async update(
    todoId: string,
    dto: UpdateTodoDto,
    userId: string,
  ): Promise<Todo> {
    const todo = await this.queryBuilder().where('id', todoId).first();
    await this.tasksService.verifyUserTaskAccess(userId, todo.task_id);

    const trx = await db.transaction();
    try {
      if (dto.order !== undefined && dto.order !== todo.order) {
        await this.handleOrderChange(todo, dto, trx);
      }

      const [updatedTodo] = await this.queryBuilder()
        .transacting(trx)
        .where('id', todoId)
        .update(dto)
        .returning('*');

      await trx.commit();

      return updatedTodo;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async delete(todoId: string, userId: string): Promise<void> {
    await this.verifyUserTodoAccess(userId, todoId);

    const trx = await db.transaction();
    try {
      const todo = await this.queryBuilder().where('id', todoId).first();

      await this.queryBuilder()
        .transacting(trx)
        .where('task_id', todo.task_id)
        .andWhere('order', '>', todo.order)
        .decrement('order', 1);

      await this.queryBuilder().transacting(trx).where('id', todoId).delete();

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async verifyUserTodoAccess(userId: string, todoId: string): Promise<void> {
    const todo = await this.queryBuilder().where('id', todoId).first();
    if (!todo) {
      throw new BadRequestException(`Todo with ID "${todoId}" not found`);
    }

    await this.tasksService.verifyUserTaskAccess(userId, todo.task_id);
  }
}
