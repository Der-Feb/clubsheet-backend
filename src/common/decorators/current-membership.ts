import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentMembership = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    let req: any;
    
    if (ctx.getType().toString() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(ctx);
      req = gqlContext.getContext().req;
    } else {
      req = ctx.switchToHttp().getRequest();
    }

    return req.activeMembership;
  },
);