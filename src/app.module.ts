import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './core/iam/auth/auth.module';
import { AuditLogsModule } from './infrastructure/audit-logs/audit-logs.module';
import { ClubModule } from './core/club/club/club.module';
import { UserTokenModule } from './core/iam/user-token/user-token.module';
import { CommunicationModule } from './infrastructure/communication/communication.module';
import { MembershipModule } from './core/iam/membership/membership.module';
import { InvitationModule } from './core/iam/invitation/invitation.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './features/scheduling/task/tasks.service';
import { PermissionModule } from './core/iam/permission/permission.module';
import { RoleModule } from './core/iam/role/role.module';
import { ProfileModule } from './core/club/profile/profile.module';
import { TeamModule } from './features/team/team/team.module';
import { PlayerModule } from './core/player/player/player.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    // Core IAM modules
    AuthModule,
    UserTokenModule,
    MembershipModule,
    InvitationModule,
    PermissionModule,
    RoleModule,
    // Core business modules
    ClubModule,
    ProfileModule,
    PlayerModule,
    // Feature modules
    TeamModule,
    // Infrastructure modules
    AuditLogsModule,
    CommunicationModule,
  ],
  providers: [TasksService],
})
export class AppModule {}
