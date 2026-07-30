import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
    @Query(() => String)
    public hello() {
        return "ClubSheet API running";
    }
}
