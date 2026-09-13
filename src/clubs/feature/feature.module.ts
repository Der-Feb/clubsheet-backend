import { Module } from '@nestjs/common';
import { FeatureResolver } from './feature.resolver';
import { FeatureService } from './feature.service';

@Module({
  providers: [FeatureResolver, FeatureService],
})
export class FeatureModule {}
