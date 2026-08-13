// email-verified.guard.ts
import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  ForbiddenException, 
  UnauthorizedException 
} from "@nestjs/common";
import { AuthService } from "../../auth/auth.service";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);
    const user = request.user;

    
    if (!user || !user.user_id)
      throw new UnauthorizedException("User session not found.");
    
    const isVerified = await this.authService.userVerified(user.user_id);
    
    if (!isVerified)
      throw new ForbiddenException("Your Email address is not verified.");

    return true;
  }

      private getRequest(context: ExecutionContext) {
          if (context.getType().toString() === 'graphql') {
              const gqlContext = GqlExecutionContext.create(context);
              return gqlContext.getContext().req;
          }
          
          return context.switchToHttp().getRequest();
      }
}