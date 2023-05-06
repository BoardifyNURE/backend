import { BadRequestException, Injectable } from '@nestjs/common';

import { db } from '../db';
import { Column } from './entities/column.entity';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { DeleteColumnDto } from './dto/delete-column.dto';
import { BoardsService } from '../boards/boards.service';

@Injectable()
export class ColumnsService {
  constructor(private boardsService: BoardsService) {}

  queryBuilder() {
    return db<Column>('columns');
  }

  async findAll(boardId: string, userId: string): Promise<Column[]> {
    await this.boardsService.verifyUserBoardAccess(userId, boardId);
    return await this.queryBuilder()
      .where('board_id', boardId)
      .orderBy('order');
  }

  async create(dto: CreateColumnDto, userId: string): Promise<Column> {
    await this.boardsService.verifyUserBoardAccess(userId, dto.board_id);

    const trx = await db.transaction();
    try {
      const countColumnsResponse = await this.queryBuilder()
        .where('board_id', dto.board_id)
        .count();
      const numberOfColumnsInBoard = Number(countColumnsResponse[0].count);
      if (!dto.order || dto.order > numberOfColumnsInBoard) {
        dto.order = numberOfColumnsInBoard;
      } else if (dto.order < 0) {
        throw new BadRequestException(
          'Column order must be greater than or equal to 0',
        );
      } else {
        await this.queryBuilder()
          .transacting(trx)
          .where('board_id', dto.board_id)
          .andWhere('order', '>=', dto.order)
          .increment('order', 1);
      }

      const [newColumn] = await this.queryBuilder()
        .transacting(trx)
        .insert(dto)
        .returning('*');

      await trx.commit();

      return newColumn;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async update(
    dto: UpdateColumnDto,
    columnId: string,
    userId: string,
  ): Promise<Column> {
    await this.verifyUserColumnAccess(userId, columnId);

    const trx = await db.transaction();
    try {
      if (dto.order) {
        const column = await this.queryBuilder().where('id', columnId).first();
        const countColumnsResponse = await this.queryBuilder()
          .where('board_id', column.board_id)
          .count();
        const numberOfColumnsInBoard = Number(countColumnsResponse[0].count);
        if (dto.order > numberOfColumnsInBoard) {
          dto.order = numberOfColumnsInBoard - 1;
        } else if (dto.order < 0) {
          throw new BadRequestException(
            'Column order must be greater than or equal to 0',
          );
        }

        if (dto.order !== column.order) {
          const query = this.queryBuilder()
            .transacting(trx)
            .where('board_id', column.board_id);

          if (dto.order < column.order) {
            query
              .andWhereBetween('order', [dto.order, column.order])
              .increment('order', 1);
          } else {
            query
              .andWhereBetween('order', [column.order, dto.order])
              .decrement('order', 1);
          }

          await query;
        }
      }

      const [updatedColumn] = await this.queryBuilder()
        .transacting(trx)
        .where('id', columnId)
        .update(dto)
        .returning('*');

      await trx.commit();

      return updatedColumn;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async delete(dto: DeleteColumnDto, userId: string): Promise<void> {
    await this.verifyUserColumnAccess(userId, dto.column_id);

    const trx = await db.transaction();
    try {
      const column = await this.queryBuilder()
        .where('id', dto.column_id)
        .first();

      await this.queryBuilder()
        .transacting(trx)
        .where('board_id', column.board_id)
        .andWhere('order', '>', column.order)
        .decrement('order', 1);

      await this.queryBuilder()
        .transacting(trx)
        .where('id', column.id)
        .delete();

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async verifyUserColumnAccess(userId: string, columnId: string) {
    const column = await this.queryBuilder().where('id', columnId).first();
    if (!column) {
      throw new BadRequestException(`Column with ID "${columnId}" not found`);
    }

    await this.boardsService.verifyUserBoardAccess(userId, column.board_id);
  }
}
