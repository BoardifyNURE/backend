import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { UserGuard } from './user.guard';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import {
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { CurrentUser } from './current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { RecaptchaGuard } from './recaptcha.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/login')
  @UseGuards(RecaptchaGuard)
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 200, description: 'User authenticated successfully' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/signup')
  @ApiOperation({ summary: 'Sign up' })
  @ApiResponse({ status: 201, description: 'User signed up successfully' })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
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
