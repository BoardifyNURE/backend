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

import { ColumnsService } from './columns.service';
import { Column } from './entities/column.entity';
import { CreateColumnDto } from './dto/create-column.dto';
import { UserGuard } from '../auth/user.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UpdateColumnDto } from './dto/update-column.dto';
import { DeleteColumnDto } from './dto/delete-column.dto';

@ApiTags('columns')
@Controller('columns')
@ApiBearerAuth()
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Get(':boardId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Find all columns for a given board' })
  @ApiParam({ name: 'boardId', type: String, required: true })
  @ApiResponse({ status: 200, type: [Column] })
  findAll(
    @Param('boardId') boardId: string,
    @CurrentUser() user: User,
  ): Promise<Column[]> {
    return this.columnsService.findAll(boardId, user.id);
  }

  @Post()
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Create a new column' })
  @ApiBody({ type: CreateColumnDto })
  @ApiResponse({ status: 201, type: Column })
  create(
    @Body() createColumnDto: CreateColumnDto,
    @CurrentUser() user: User,
  ): Promise<Column> {
    return this.columnsService.create(createColumnDto, user.id);
  }

  @Put(':columnId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Update a column' })
  @ApiParam({ name: 'columnId', type: String, required: true })
  @ApiBody({ type: UpdateColumnDto })
  @ApiResponse({ status: 200, type: Column })
  update(
    @Param('columnId') columnId: string,
    @Body() updateColumnDto: UpdateColumnDto,
    @CurrentUser() user: User,
  ): Promise<Column> {
    return this.columnsService.update(updateColumnDto, columnId, user.id);
  }

  @Delete(':columnId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Delete a column' })
  @ApiBody({ type: DeleteColumnDto })
  @ApiResponse({ status: 204 })
  delete(
    @Param('columnId') columnId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.columnsService.delete(columnId, user.id);
  }
}
