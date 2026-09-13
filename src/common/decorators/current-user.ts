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

export const ClientTimezone = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = getRequestFromContext(ctx);
    // ActiveMembershipGuard already resolved it — return directly
    if (request.timezone !== undefined) return request.timezone;
    // Unguarded route — read header directly (no club context available)
    const raw = request?.headers?.['x-timezone'] as string | undefined;
    return raw?.trim() || null;
  },
);