import { BadRequestException, Injectable } from '@nestjs/common';

import { db } from '../db';
import { Board } from './entities/board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { BoardsUsersService } from './boards-users.service';
import { AddUsersToBoardDto } from './dto/add-users-to-board.dto';
import { UsersService } from '../users/users.service';
import { DeleteBoardDto } from './dto/delete-board.dto';

@Injectable()
export class BoardsService {
  constructor(
    private readonly boardsUsersService: BoardsUsersService,
    private readonly usersService: UsersService,
  ) {}

  queryBuilder() {
    return db<Board>('boards');
  }

  async findUserBoards(userId: string): Promise<Board[]> {
    return await this.queryBuilder()
      .innerJoin('boards_users', 'boards_users.board_id', '=', 'boards.id')
      .where('boards_users.user_id', userId)
      .select('boards.*');
  }

  async create(dto: CreateBoardDto, userId: string): Promise<Board> {
    const trx = await db.transaction();
    try {
      const [newBoard] = await this.queryBuilder()
        .transacting(trx)
        .insert(dto)
        .returning('*');
      await this.boardsUsersService.create(
        {
          board_id: newBoard.id,
          user_id: userId,
        },
        trx,
      );
      await trx.commit();
      return newBoard;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async addUsersToBoard(dto: AddUsersToBoardDto, userWhoAddsId: string) {
    await this.verifyUserBoardAccess(userWhoAddsId, dto.board_id);

    if (!dto.users_identifications.length) {
      throw new BadRequestException('Users identifications list is empty');
    }

    const trx = await db.transaction();
    try {
      for (const index in dto.users_identifications) {
        const userIdentification = dto.users_identifications[index];

        if (
          !userIdentification.user_id &&
          !userIdentification.email &&
          !userIdentification.username
        ) {
          throw new BadRequestException(
            `Item #${index} in users identifications list (${JSON.stringify(
              userIdentification,
            )}) doesn't have any of required fields (user_id, email or username)`,
          );
        }

        const userToAdd = await this.usersService.findOne(userIdentification);
        if (!userToAdd) {
          throw new BadRequestException(
            `Item #${index} in users identifications list (${JSON.stringify(
              userIdentification,
            )}) doesn't relate to any user in the DB`,
          );
        }

        await this.boardsUsersService.create(
          { user_id: userToAdd.id, board_id: dto.board_id },
          trx,
        );
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async update(id: string, board: Partial<Board>): Promise<Board> {
    const [updatedBoard] = await this.queryBuilder()
      .where('id', id)
      .update(board)
      .returning('*');
    return updatedBoard;
  }

  async delete(boardId: string, userId: string): Promise<void> {
    await this.verifyUserBoardAccess(userId, boardId);
    await this.queryBuilder().where('id', boardId).delete();
  }

  async verifyUserBoardAccess(userId: string, boardId: string) {
    const board = await this.queryBuilder().where('id', boardId).first();
    if (!board) {
      throw new BadRequestException(`Board with ID "${boardId}" not found`);
    }

    const boardUser = await this.boardsUsersService
      .queryBuilder()
      .where({ user_id: userId, board_id: boardId })
      .first();
    if (!boardUser) {
      throw new BadRequestException("You don't have access to this board");
    }
  }
}
