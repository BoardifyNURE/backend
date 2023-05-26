import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { UserGuard } from '../auth/user.guard';
import { FindUserDto } from './dto/find-user.dto';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Get user by ID, email or username' })
  async getUserById(@Query() query: FindUserDto) {
    const user = await this.usersService.findOneSanitized(query);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }
}
