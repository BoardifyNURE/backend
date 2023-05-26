import { BadRequestException, Injectable } from '@nestjs/common';
import { Knex } from 'knex';

import { db } from '../db';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ColumnsService } from '../columns/columns.service';
import { BoardsService } from '../boards/boards.service';
import { UsersService } from '../users/users.service';
import { BoardsUsersService } from '../boards/boards-users.service';
import { TaskStatus } from './enums/task-status.enum';

@Injectable()
export class TasksService {
  constructor(
    private boardsService: BoardsService,
    private boardsUsersService: BoardsUsersService,
    private columnsService: ColumnsService,
    private usersService: UsersService,
  ) {}

  queryBuilder() {
    return db<Task>('tasks');
  }

  async findTasksInColumn(columnId: string, userId: string): Promise<Task[]> {
    await this.columnsService.verifyUserColumnAccess(userId, columnId);

    return await this.queryBuilder()
      .where('column_id', columnId)
      .orderBy('order');
  }

  async findTasksInBoard(boardId: string, userId: string): Promise<Task[]> {
    await this.boardsService.verifyUserBoardAccess(userId, boardId);

    const boardColumns = await this.columnsService
      .queryBuilder()
      .where('board_id', boardId);
    return await this.queryBuilder()
      .whereIn(
        'column_id',
        boardColumns.map((column) => column.id),
      )
      .orderBy([{ column: 'column_id' }, { column: 'order' }]);
  }

  private async shiftTasksOrder(
    columnId: string,
    startOrder: number,
    endOrder: number,
    increment: boolean,
    trx: Knex.Transaction,
  ) {
    const query = this.queryBuilder()
      .transacting(trx)
      .where('column_id', columnId)
      .andWhereBetween('order', [startOrder, endOrder]);

    if (increment) {
      await query.increment('order', 1);
    } else {
      await query.decrement('order', 1);
    }
  }

  private async handleOrderChange(
    task: Task,
    dto: CreateTaskDto | UpdateTaskDto,
    trx: Knex.Transaction,
  ) {
    const countTasksResponse = await this.queryBuilder()
      .where('column_id', dto.column_id || task.column_id)
      .count();
    const numberOfTasksInColumn = Number(countTasksResponse[0].count);
    if (dto.order === undefined || dto.order > numberOfTasksInColumn) {
      dto.order = numberOfTasksInColumn;
    } else if (dto.order < 0) {
      throw new BadRequestException(
        'Task order must be greater than or equal to 0',
      );
    }

    if (dto.order !== task.order) {
      const start_order = dto.order;
      const end_order = task.order || numberOfTasksInColumn;

      if (start_order < end_order) {
        await this.shiftTasksOrder(
          task.column_id,
          start_order,
          end_order,
          true,
          trx,
        );
      } else {
        await this.shiftTasksOrder(
          task.column_id,
          end_order,
          start_order,
          false,
          trx,
        );
      }
    }
  }

  private readonly taskStatusMapping = {
    [TaskStatus.ToDo]: [
      TaskStatus.InProgress,
      TaskStatus.Done,
      TaskStatus.Cancelled,
    ],
    [TaskStatus.InProgress]: [
      TaskStatus.ReadyForTesting,
      TaskStatus.Done,
      TaskStatus.Cancelled,
    ],
    [TaskStatus.ReadyForTesting]: [
      TaskStatus.TestingFailed,
      TaskStatus.TestingSucceded,
      TaskStatus.Done,
      TaskStatus.Cancelled,
    ],
    [TaskStatus.TestingFailed]: [
      TaskStatus.Fixing,
      TaskStatus.Done,
      TaskStatus.Cancelled,
    ],
    [TaskStatus.Fixing]: [
      TaskStatus.ReadyForTesting,
      TaskStatus.Done,
      TaskStatus.Cancelled,
    ],
    [TaskStatus.TestingSucceded]: [TaskStatus.Done, TaskStatus.Cancelled],
    [TaskStatus.Done]: [TaskStatus.ToDo],
    [TaskStatus.Cancelled]: [TaskStatus.ToDo],
  };
  async getAvailableNewStatusesForTask(taskId: string) {
    const task = await this.queryBuilder().where('id', taskId).first();
    if (!task) {
      throw new BadRequestException(`Task with ID "${taskId}" not found`);
    }

    return this.taskStatusMapping[task.status];
  }

  async create(dto: CreateTaskDto, userId: string): Promise<Task> {
    await this.columnsService.verifyUserColumnAccess(userId, dto.column_id);

    const trx = await db.transaction();
    try {
      if (dto.assignee_id) {
        const user = await this.usersService.findOne({ id: dto.assignee_id });
        if (!user) {
          throw new BadRequestException(
            `User with ID "${dto.assignee_id}" not found`,
          );
        }

        const column = await this.columnsService
          .queryBuilder()
          .where('id', dto.column_id)
          .first();

        await this.boardsUsersService.create(
          {
            board_id: column.board_id,
            user_id: dto.assignee_id,
          },
          trx,
        );
      }

      const task = new Task();
      task.column_id = dto.column_id;

      await this.handleOrderChange(task, dto, trx);

      const [newTask] = await this.queryBuilder()
        .transacting(trx)
        .insert(dto)
        .returning('*');

      await trx.commit();

      return newTask;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async update(
    taskId: string,
    dto: UpdateTaskDto,
    userId: string,
  ): Promise<Task> {
    const task = await this.queryBuilder().where('id', taskId).first();
    await this.columnsService.verifyUserColumnAccess(userId, task.column_id);

    const trx = await db.transaction();
    try {
      if (dto.column_id && dto.column_id !== task.column_id) {
        const newTaskColumn = await this.columnsService
          .queryBuilder()
          .where('id', dto.column_id)
          .first();
        if (!newTaskColumn) {
          throw new BadRequestException(
            `Column with ID "${dto.column_id}" not found`,
          );
        }

        const currentTaskColumn = await this.columnsService
          .queryBuilder()
          .where('id', task.column_id)
          .first();
        if (currentTaskColumn.board_id !== newTaskColumn.board_id) {
          throw new BadRequestException(
            "You can't move a task to a column in a different board",
          );
        }

        await this.handleOrderChange(task, dto, trx);

        await this.queryBuilder()
          .transacting(trx)
          .where('column_id', task.column_id)
          .andWhere('order', '>', task.order)
          .decrement('order', 1);

        const countTasksResponse = await this.queryBuilder()
          .where('column_id', dto.column_id)
          .count();
        const numberOfTasksInColumn = Number(countTasksResponse[0].count);
        if (dto.order === undefined || dto.order > numberOfTasksInColumn) {
          dto.order = numberOfTasksInColumn;
        } else if (dto.order < 0) {
          throw new BadRequestException(
            'Task order must be greater than or equal to 0',
          );
        }

        await this.shiftTasksOrder(dto.column_id, dto.order, 100, true, trx);
      } else if (dto.order !== undefined && dto.order !== task.order) {
        await this.handleOrderChange(task, dto, trx);
      }

      if (
        dto.status &&
        dto.status !== task.status &&
        !this.taskStatusMapping[task.status].includes(dto.status)
      ) {
        throw new BadRequestException(
          `You can't change status of this task to "${dto.status}"`,
        );
      }

      if (dto.assignee_id) {
        const user = await this.usersService.findOne({ id: dto.assignee_id });
        if (!user) {
          throw new BadRequestException(
            `User with ID "${dto.assignee_id}" not found`,
          );
        }

        const column = await this.columnsService
          .queryBuilder()
          .where('id', task.column_id)
          .first();

        await this.boardsUsersService.create(
          {
            board_id: column.board_id,
            user_id: dto.assignee_id,
          },
          trx,
        );
      }

      const [updatedTask] = await this.queryBuilder()
        .transacting(trx)
        .where('id', taskId)
        .update(dto)
        .returning('*');

      await trx.commit();

      return updatedTask;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async delete(taskId: string, userId: string): Promise<void> {
    await this.verifyUserTaskAccess(userId, taskId);

    const trx = await db.transaction();
    try {
      const task = await this.queryBuilder().where('id', taskId).first();

      await this.queryBuilder()
        .transacting(trx)
        .where('column_id', task.column_id)
        .andWhere('order', '>', task.order)
        .decrement('order', 1);

      await this.queryBuilder().transacting(trx).where('id', task.id).delete();

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async verifyUserTaskAccess(userId: string, taskId: string): Promise<void> {
    const task = await this.queryBuilder().where('id', taskId).first();
    if (!task) {
      throw new BadRequestException(`Task with ID "${taskId}" not found`);
    }

    await this.columnsService.verifyUserColumnAccess(userId, task.column_id);
  }
}
