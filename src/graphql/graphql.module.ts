import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/graphql/schema.graphql'),
      playground: process.env.ENV === 'dev' || process.env.NODE_ENV !== 'production',
      context: ({ req, res }) => ({ req, res, request: req }),
    }),
  ],
})
export class GraphqlModule {}

