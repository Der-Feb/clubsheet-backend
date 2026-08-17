import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TeamModule } from './team/team.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'feature',
        children: [TeamModule],
      },
    ]),
    TeamModule,
  ],
})
export class FeatureModule {}
