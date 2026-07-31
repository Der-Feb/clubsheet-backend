import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterUserPersonDto } from './auth.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("/signup")
    public async register(
        @Body() registerDto: RegisterUserPersonDto, 
        @Res({ passthrough: true }) res: Response
    ) {
        const userData = await this.authService.registerUserPerson(registerDto);

        await this.authService.assignCookie({ 
            sub: userData.user_id, 
            person_id: userData.person_id
        }, res);

        return {
            message: 'Login successful',
            user: userData
        };
    }

    @Post("/signin")
    public async login(
        @Body() loginDto: LoginDto, 
        @Res({ passthrough: true }) res: Response
    ) {
        const userData = await this.authService.validateCredentials(loginDto);

        await this.authService.assignCookie({
            sub: userData.user_id,
            person_id: userData.person_id
        }, res);;

        return {
            message: "",
            user: userData
        }
    }

    @Post("/signout")
    public async signout(@Res({ passthrough: true }) res: Response) {
        res.cookie('accessToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0), // Set expiration date to Jan 1, 1970 (tells browser to delete it instantly)
        });

        return {
            message: "Signed out successfully"
        }
    }
}
