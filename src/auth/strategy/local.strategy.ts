import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy){
    constructor(private authService: AuthService) {
        super({
            usernameField: "email"
        });
    }

    public async validate(username: string, password: string) {
        return await this.authService.validateCredentials({ email: username, password });
    }
}