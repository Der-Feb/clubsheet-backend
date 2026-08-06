import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembershipService {
    constructor(private readonly prisma: PrismaService) {}

    public async createMembership(userId: string, ) {

    }
}
