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

import { BoardsService } from './boards.service';
import { Board } from './entities/board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UserGuard } from '../auth/user.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { DeleteBoardDto } from './dto/delete-board.dto';
import { AddUsersToBoardDto } from './dto/add-users-to-board.dto';

@ApiTags('boards')
@Controller('boards')
@ApiBearerAuth()
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get()
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Find all boards user has access to' })
  @ApiResponse({ status: 200, type: [Board] })
  findUserBoards(@CurrentUser() user: User): Promise<Board[]> {
    return this.boardsService.findUserBoards(user.id);
  }

  @Post()
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Create a new board' })
  @ApiBody({ type: CreateBoardDto })
  @ApiResponse({ status: 201, type: Board })
  create(
    @Body() createBoardDto: CreateBoardDto,
    @CurrentUser() user: User,
  ): Promise<Board> {
    return this.boardsService.create(createBoardDto, user.id);
  }

  @Put(':id')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Update a board' })
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiBody({ type: CreateBoardDto })
  @ApiResponse({ status: 200, type: Board })
  update(
    @Param('id') id: string,
    @Body() board: Partial<Board>,
  ): Promise<Board> {
    return this.boardsService.update(id, board);
  }

  @Delete()
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Delete a board' })
  @ApiBody({ type: DeleteBoardDto })
  @ApiResponse({ status: 204 })
  delete(
    @Body() dto: DeleteBoardDto,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.boardsService.delete(dto, user.id);
  }

  @Post('add-users-to-board')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Add users to a board' })
  @ApiBody({ type: AddUsersToBoardDto })
  @ApiResponse({ status: 204 })
  async addUsersToBoard(
    @Body() dto: AddUsersToBoardDto,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.boardsService.addUsersToBoard(dto, user.id);
  }
}
