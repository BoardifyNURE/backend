import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RecaptchaGuard implements CanActivate {
  throwUnauthorized() {
    throw new UnauthorizedException();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const reCaptchaToken: string = request.headers.recaptcha;
    if (!reCaptchaToken) {
      this.throwUnauthorized();
    }

    try {
      const response = await axios.post(
        'https://recaptchaenterprise.googleapis.com/v1/projects/gitlam/assessments',
        {
          event: {
            token: reCaptchaToken,
            siteKey: '6LfIPj8mAAAAAHtAQd7PdX2NML5j0idnWIr_2dup',
          },
        },
        {
          params: {
            key: 'AIzaSyAgq0C2aFDK2JGR6OsZBdxxwMz9G03PE_A',
          },
        },
      );

      console.log(response.data);

      return true;
    } catch (error) {
      throw error;
    }
  }
}
