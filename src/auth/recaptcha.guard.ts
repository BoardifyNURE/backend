import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';

const reCaptchaClient = new RecaptchaEnterpriseServiceClient();

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
      const response = await reCaptchaClient.createAssessment({
        parent: reCaptchaClient.projectPath('gitlam'),
        assessment: {
          event: {
            token: reCaptchaToken,
            siteKey: '6LfIPj8mAAAAAHtAQd7PdX2NML5j0idnWIr_2dup',
          },
        },
      });

      console.log(response);

      return true;
    } catch (error) {
      throw error;
    }
  }
}
