import { Module } from '@nestjs/common';
import { AuthModule } from '@iam/auth/auth.module';
import { MembershipService } from './membership.service';
import { MembershipResolver } from './membership.resolver';

@Module({
  imports: [AuthModule],
  providers: [MembershipService, MembershipResolver],
  exports: [MembershipService],
})
export class MembershipModule {}
