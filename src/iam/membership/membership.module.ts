import { Module } from '@nestjs/common';
import { AuthModule } from '@iam/auth/auth.module';
import { MembershipService } from './membership.service';
import { MembershipController } from './membership.controller';

@Module({
  imports: [
    AuthModule
  ],
  providers: [MembershipService],
  controllers: [MembershipController]
})
export class MembershipModule {}
