import { Module } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { MembershipController } from './membership.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule
  ],
  providers: [MembershipService],
  controllers: [MembershipController]
})
export class MembershipModule {}
