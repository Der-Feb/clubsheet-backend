import { Module } from '@nestjs/common';
import { AthleteService } from './athlete.service';
import { AthleteResolver } from './athlete.resolver';
import { AuthModule } from '@iam/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [AthleteService, AthleteResolver],
  exports: [AthleteService],
})
export class AthleteModule {}
