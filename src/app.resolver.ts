import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  @Query(() => String)
  healthCheck(): string {
    return 'OK';
  }
}