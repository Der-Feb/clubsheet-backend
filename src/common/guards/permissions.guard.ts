import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, IPermissionsMetadata } from '../decorators/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const metadata = this.reflector.getAllAndOverride<IPermissionsMetadata>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Allow access if no permissions are configured for this route
    if (!metadata || !metadata.permissions || metadata.permissions.length === 0) {
      return true;
    }

    const { strict, permissions: requiredPermissions } = metadata;
    const request = context.switchToHttp().getRequest();
    const activeMembership = request.activeMembership;

    if (!activeMembership) {
      throw new ForbiddenException('No active club membership found for this request');
    }

    // Flatten user permissions from both assigned Roles and direct Membership permissions
    const userPermissions = new Set<string>();

    activeMembership.roles?.forEach((mr: any) => {
      mr.role?.permissions?.forEach((rp: any) => {
        if (rp.permission?.code) {
          userPermissions.add(rp.permission.code);
        }
      });
    });

    activeMembership.permissions?.forEach((mp: any) => {
      if (mp.permission?.code) {
        userPermissions.add(mp.permission.code);
      }
    });

    // Evaluate strict (every) vs non-strict (some)
    const hasPermission = strict
      ? requiredPermissions.every((perm) => userPermissions.has(perm))
      : requiredPermissions.some((perm) => userPermissions.has(perm));

    if (!hasPermission) {
      throw new ForbiddenException('You do not have sufficient permissions to perform this action');
    }

    return true;
  }
}