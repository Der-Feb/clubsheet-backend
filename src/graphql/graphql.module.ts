import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

// Side-effect import — registers all Prisma enums with the GraphQL schema
import '../common/enums/graphql-enums';

@Module({
    imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: true,
            sortSchema: true,
            playground: true
        }),
    ]
})
export class GraphqlModule {}