import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getRequestFromContext } from '@common/utils/request-context.util';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = getRequestFromContext(ctx);
    return request.user;
  },
);

export const CurrentMembership = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = getRequestFromContext(ctx);
    return request.activeMembership;
  },
);

