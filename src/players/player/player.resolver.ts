import { Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PlayerService } from './player.service';
import { Player } from '@generated/prisma-nestjs-graphql/player/player.model';
import { PassportJwtGuard } from '@common/guards/passport.guard';
import { EmailVerifiedGuard } from '@common/guards/email-verified.guard';
import { ActiveMembershipGuard } from '@common/guards/active-membership.guard';
import { PermissionsGuard } from '@common/guards/permissions.guard';

@Resolver(() => Player)
@UseGuards(
  PassportJwtGuard,
  EmailVerifiedGuard,
  ActiveMembershipGuard,
  PermissionsGuard,
)
export class PlayerResolver {
  constructor(private readonly playerService: PlayerService) {}
}
