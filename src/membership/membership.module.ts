import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MembershipService } from './membership.service';

@Module({
  imports: [
    AuthModule
  ],
  providers: [MembershipService],
  controllers: []
})
export class MembershipModule {}
