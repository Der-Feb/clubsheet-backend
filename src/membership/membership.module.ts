import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MembershipsResolver } from './membership.resolver';
import { MembershipService } from './membership.service';

@Module({
  imports: [
    AuthModule
  ],
  providers: [MembershipsResolver, MembershipService],
  controllers: []
})
export class MembershipModule {}
