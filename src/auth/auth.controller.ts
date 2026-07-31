import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterUserPersonDto } from './auth.dto';
import { Response } from 'express';
import { PassportJwtGuard, PassportLocalGuard } from '../common/guards/passport.guard';
import { CurrentUser } from '../common/decorators/current-user';
import { TPayload, TUserData } from './auth.types';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.CREATED)
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
            message: 'Registered successfully',
            user: userData
        };
    }

    @HttpCode(HttpStatus.OK)
    @Post("/signin")
    @UseGuards(PassportLocalGuard)
    public async login(
        @Body() loginDto: LoginDto,
        @CurrentUser() userData: TUserData,
        @Res({ passthrough: true }) res: Response
    ) {
        await this.authService.assignCookie({
            sub: userData.user_id,
            person_id: userData.person_id
        }, res);;

        return {
            message: "Logged in Successfully",
            user: userData
        }
    }

    @HttpCode(HttpStatus.OK)
    @Post("/signout")
    public async signout(@Res({ passthrough: true }) res: Response) {
        res.cookie('accessToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0), // Setting expiration date to Jan 1, 1970 (tells browser to delete it instantly)
        });

        return {
            message: "Signed out successfully"
        }
    }

    @HttpCode(HttpStatus.OK)
    @Get("/me")
    @UseGuards(PassportJwtGuard)
    public async getMe(
        @CurrentUser() user: any
    ) {
        const { user_id, person_id } = user;
        return this.authService.getUserData(user_id, person_id);
    }
}
