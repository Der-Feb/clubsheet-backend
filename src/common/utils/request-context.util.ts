import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

export function getRequestFromContext(context: ExecutionContext): Request {
  const gqlCtx = GqlExecutionContext.create(context);
  const gqlReq = gqlCtx.getContext()?.req || gqlCtx.getContext()?.request;
  if (gqlReq) {
    return gqlReq;
  }
  return context.switchToHttp().getRequest<Request>();
}
