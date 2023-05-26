import { Module } from '@nestjs/common';

import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { BoardsUsersService } from './boards-users.service';

@Module({
  controllers: [BoardsController],
  providers: [BoardsService, BoardsUsersService],
  exports: [BoardsService, BoardsUsersService],
})
export class BoardsModule {}
