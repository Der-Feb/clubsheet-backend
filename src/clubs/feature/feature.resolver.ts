import { UseGuards } from '@nestjs/common';
import { Resolver } from '@nestjs/graphql';
import { ActiveMembershipGuard } from '@common/guards/active-membership.guard';
import { EmailVerifiedGuard } from '@common/guards/email-verified.guard';
import { PassportJwtGuard } from '@common/guards/passport.guard';
import { FeatureService } from './feature.service';
import { ClubFeature } from '@generated/prisma-nestjs-graphql/club-feature/club-feature.model';

@Resolver(() => ClubFeature)
@UseGuards(PassportJwtGuard, EmailVerifiedGuard, ActiveMembershipGuard)
export class FeatureResolver {
    constructor(private readonly featureService: FeatureService) {}

    
}
