import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getRequestFromContext } from '@common/utils/request-context.util';

export const CurrentMembership = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = getRequestFromContext(ctx);
    return req.activeMembership;
  },
);

