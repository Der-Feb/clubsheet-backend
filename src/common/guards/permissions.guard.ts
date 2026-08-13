import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, IPermissionsMetadata } from '../decorators/require-permissions.decorator';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const metadata = this.reflector.getAllAndOverride<IPermissionsMetadata>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!metadata || !metadata.permissions || metadata.permissions.length === 0) {
      return true;
    }

    const { strict, permissions: requiredPermissions } = metadata;
    const req = this.getRequest(context);
    const activeMembership = req.activeMembership;

    if (!activeMembership) {
      throw new ForbiddenException('Active membership context missing');
    }

    // Extract all hydrated permission codes directly from activeMembership
    const userPermissions = new Set<string>(
      activeMembership.permissions?.map((mp: any) => mp.permission?.code).filter(Boolean)
    );

    // Evaluate strict (ALL) vs non-strict (ANY)
    const hasPermission = strict
      ? requiredPermissions.every((code) => userPermissions.has(code))
      : requiredPermissions.some((code) => userPermissions.has(code));

    if (!hasPermission) {
      throw new ForbiddenException('You do not have sufficient permissions to perform this action');
    }

    return true;
  }

  private getRequest(context: ExecutionContext) {
      if (context.getType().toString() === 'graphql') {
          const gqlContext = GqlExecutionContext.create(context);
          return gqlContext.getContext().req;
      }

      return context.switchToHttp().getRequest();
  }
}