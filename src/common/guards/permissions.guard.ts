import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, IPermissionsMetadata } from '@common/decorators/require-permissions.decorator';

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

    // If no active membership but permissions are required, deny access
    if (!activeMembership) {
      throw new ForbiddenException('Active membership required to perform this action');
    }

    // Extract all hydrated permission codes directly from activeMembership
    const userPermissions = new Set<string>(
      activeMembership.permissions?.map((mp: any) => mp.permission?.code).filter(Boolean) || []
    );

    // Evaluate strict (ALL) vs non-strict (ANY)
    const hasPermission = strict
      ? requiredPermissions.every((code) => userPermissions.has(code))
      : requiredPermissions.some((code) => userPermissions.has(code));

    if (!hasPermission) {
      const missingPerms = requiredPermissions.filter((code) => !userPermissions.has(code)).join(', ');
      throw new ForbiddenException(`Missing required permissions: ${missingPerms}`);
    }

    return true;
  }

  private getRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest();
  }
}