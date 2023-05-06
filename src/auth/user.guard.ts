import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { config } from '../config';
import { UsersService } from '../users/users.service';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  throwUnauthorized() {
    throw new UnauthorizedException();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string = request.headers.authorization;
    if (!authHeader) {
      this.throwUnauthorized();
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer.toLowerCase() !== 'bearer' || !token) {
      this.throwUnauthorized();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: config.jwt.secret,
      });
      if (!payload) {
        this.throwUnauthorized();
      }

      const user = await this.usersService.findOneSanitized({
        email: payload.email,
      });
      if (!user) {
        this.throwUnauthorized();
      }

      request.user = user;
      return true;
    } catch (error) {
      throw error;
    }
  }
}
