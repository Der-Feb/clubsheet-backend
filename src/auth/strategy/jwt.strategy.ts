import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config"; // 1. Import ConfigService
import { TPayload } from "../auth.types";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        const jwtSecret = configService.get<string>('JWT_SECRET') ?? "";

        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request) => { return request?.cookies?.accessToken || null; }
            ]),
            ignoreExpiration: false,
            secretOrKey: jwtSecret, 
        });
    }

    public async validate(payload: TPayload) {
        return { 
            user_id: payload.sub, 
            person_id: payload.person_id 
        };
    }
}