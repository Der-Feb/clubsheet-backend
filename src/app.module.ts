import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { GraphqlModule } from './graphql/graphql.module';
import { AppResolver } from './app.resolver';
import { AuthModule } from './auth/auth.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    GraphqlModule,
    AuthModule,
    AuditLogsModule
  ],
  providers: [AppResolver],
})
export class AppModule {}
