import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './iam/auth/auth.module';
import { AuditLogsModule } from './infrastructure/audit-logs/audit-logs.module';
import { ClubModule } from './clubs/club/club.module';
import { UserTokenModule } from './iam/user-token/user-token.module';
import { CommunicationModule } from './infrastructure/communication/communication.module';
import { MembershipModule } from './iam/membership/membership.module';
import { InvitationModule } from './iam/invitation/invitation.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks/tasks.service';
import { PermissionModule } from './iam/permission/permission.module';
import { RoleModule } from './iam/role/role.module';
import { ProfileModule } from './iam/profile/profile.module';
import { TeamModule } from './teams/team/team.module';
import { PlayerModule } from './players/player/player.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    // IAM modules
    AuthModule,
    UserTokenModule,
    MembershipModule,
    InvitationModule,
    PermissionModule,
    RoleModule,
    ProfileModule,
    // Business domain modules
    ClubModule,
    PlayerModule,
    TeamModule,
    // Infrastructure modules
    AuditLogsModule,
    CommunicationModule,
  ],
  providers: [TasksService],
})
export class AppModule {}
