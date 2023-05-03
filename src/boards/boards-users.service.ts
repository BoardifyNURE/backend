import { Injectable } from '@nestjs/common';

import { db } from '../db';
import { BoardUser } from './entities/board-user.entity';
import { CreateBoardUserDto } from './dto/create-board-user.dto';
import { Knex } from 'knex';

@Injectable()
export class BoardsUsersService {
  queryBuilder() {
    return db<BoardUser>('boards_users');
  }

  async create(
    dto: CreateBoardUserDto,
    trx?: Knex.Transaction,
  ): Promise<BoardUser> {
    const query = this.queryBuilder();
    if (trx) {
      query.transacting(trx);
    }
    const [newBoardUser] = await query.insert(dto).returning('*');
    return newBoardUser;
  }
}
