import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { config } from '../config';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string = request.headers.authorization;
    if (!authHeader) {
      return false;
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer.toLowerCase() !== 'bearer' || !token) {
      return false;
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: config.jwt.secret,
      });
      if (!payload) {
        return false;
      }

      const user = await this.usersService.findOneSanitized({
        email: payload.email,
      });
      if (!user) {
        return false;
      }

      request.user = user;
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
