import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { getRequestFromContext } from '@common/utils/request-context.util';

@Injectable()
export class PassportLocalGuard extends AuthGuard('local') {}

@Injectable()
export class PassportJwtGuard extends AuthGuard('jwt') {
  override getRequest(context: ExecutionContext) {
    return getRequestFromContext(context);
  }
}
