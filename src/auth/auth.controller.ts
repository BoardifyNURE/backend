import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { UserGuard } from './user.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { CurrentUser } from './current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/login')
  @ApiOperation({ summary: 'Authenticate user' })
  @ApiResponse({ status: 200, description: 'User authenticated successfully' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/register')
  @ApiOperation({ summary: 'Register user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('/user')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Get current user' })
  @ApiBearerAuth()
  async testGuard(@CurrentUser() user: User) {
    return await this.usersService.findOneSanitized({
      id: user.id,
    });
  }
}
