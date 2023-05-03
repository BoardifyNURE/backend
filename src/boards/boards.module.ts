import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { BoardsUsersService } from './boards-users.service';

@Module({
  controllers: [BoardsController],
  providers: [BoardsService, BoardsUsersService, JwtService],
  exports: [BoardsService],
})
export class BoardsModule {}
