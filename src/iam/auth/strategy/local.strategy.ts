import { Injectable, BadRequestException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
import { LoginDto } from "../auth.dto";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy){
    constructor(private authService: AuthService) {
        super({
            usernameField: "email"
        });
    }

    public async validate(email: string, password: string) {
        // Create DTO from incoming data
        const loginDto = plainToClass(LoginDto, { email, password });
        
        // Validate DTO before using it
        const errors = await validate(loginDto);
        if (errors.length > 0) {
            const errorMessages = errors.map(err => 
                Object.values(err.constraints || {}).join(', ')
            ).join('; ');
            throw new BadRequestException(`Validation failed: ${errorMessages}`);
        }

        // Now validate credentials
        return await this.authService.validateCredentials(loginDto);
    }
}