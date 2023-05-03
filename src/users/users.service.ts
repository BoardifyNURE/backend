import { Injectable } from '@nestjs/common';

import { db } from '../db';
import { User } from './entities/user.entity';
import { UserSanitizedDto } from './dto/user-sanitized.dto';
import { FindUserDto } from './dto/find-user.dto';

@Injectable()
export class UsersService {
  queryBuilder() {
    return db<User>('users');
  }

  private sanitize(user: User): UserSanitizedDto {
    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      username: user.username,
    };
  }

  async findOneSanitized(dto: FindUserDto): Promise<UserSanitizedDto> {
    const user = await this.findOne(dto);
    return user ? this.sanitize(user) : null;
  }

  async findOne(dto: FindUserDto): Promise<User> {
    return await this.queryBuilder().where(dto).select('*').first();
  }

  async create(user: Partial<User>): Promise<User> {
    const [newUser] = await this.queryBuilder().insert(user).returning('*');
    return newUser;
  }
}
