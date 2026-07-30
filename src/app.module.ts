import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { GraphqlModule } from './graphql/graphql.module';
import { AppResolver } from './app.resolver';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true, }),
    GraphqlModule,
  ],
  providers: [AppResolver],
})
export class AppModule {}
