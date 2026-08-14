import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { GraphqlModule } from './graphql/graphql.module';
import { AppResolver } from './app.resolver';
import { AuthModule } from './auth/auth.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { ClubModule } from './club/club.module';
import { UserTokenModule } from './user-token/user-token.module';
import { CommunicationModule } from './communication/communication.module';
import { MembershipModule } from './membership/membership.module';
import { InvitationController } from './invitation/invitation.controller';
import { InvitationModule } from './invitation/invitation.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks/tasks.service';
import { PermissionModule } from './permission/permission.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    GraphqlModule,
    ScheduleModule.forRoot(),
    AuthModule,
    AuditLogsModule,
    ClubModule,
    UserTokenModule,
    CommunicationModule,
    MembershipModule,
    InvitationModule,
    PermissionModule,
  ],
  providers: [AppResolver, TasksService],
  controllers: [InvitationController],
})
export class AppModule {}
