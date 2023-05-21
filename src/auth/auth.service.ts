import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const emailExists = await this.usersService.findOne({
      email: registerDto.email,
    });
    if (emailExists) {
      throw new BadRequestException('Email already exists');
    }

    const usernameExists = await this.usersService.findOne({
      username: registerDto.username,
    });
    if (usernameExists) {
      throw new BadRequestException('Username already exists');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(registerDto.password, salt);
    await this.usersService.create({
      first_name: registerDto.firstName,
      last_name: registerDto.lastName,
      email: registerDto.email,
      username: registerDto.username,
      password_hash: passwordHash,
    });

    return await this.usersService.findOneSanitized({
      email: registerDto.email,
    });
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOne({
      email: loginDto.email,
    });
    if (!user) {
      throw new BadRequestException('Wrong email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Wrong email or password');
    }

    const payload = { email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    return { accessToken };
  }
}
