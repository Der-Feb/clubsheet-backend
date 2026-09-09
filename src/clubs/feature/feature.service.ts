import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FeatureService {
    constructor(private readonly prisma: PrismaService) {}

    public async getFeatures() {
        return await this.prisma.feature.findMany();
    }

    // get a feature but on your team
    public async getFeature(clubId: string, featureId: string) {
        return await this.prisma.clubFeature.findUnique({
            where: {
                clubId_featureId: { clubId, featureId }
            },
        });
    }

    public async getClubFeatures(clubId: string) {
        return await this.prisma.clubFeature.findMany({
            where: { clubId },
        });
    }
}
