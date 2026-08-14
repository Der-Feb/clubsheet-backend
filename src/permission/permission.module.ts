import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionResolver } from './permission.resolver';

@Module({
  providers: [PermissionService, PermissionResolver]
})
export class PermissionModule {}
