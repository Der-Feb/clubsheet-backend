import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterUserPersonDto } from './auth.dto';
import { Response } from 'express';
import { PassportJwtGuard, PassportLocalGuard } from '@common/guards/passport.guard';
import { CurrentUser } from '@common/decorators/current-user';
import { TPayload, TUserData } from './auth.types';
import { ENAuditCategory } from '@prisma/client';
import { AuditLogsService } from '@infrastructure/audit-logs/audit-logs.service';
import { UserTokenService } from '../user-token/user-token.service';
import { ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from '../user-token/user-token.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private auditLogsService: AuditLogsService,
        private userTokenService: UserTokenService
    ) {}

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

        await this.auditLogsService.createLog({
            category: ENAuditCategory.AUTH,
            action: 'authRegister',
            entityType: 'User, Person',
            createdBy: userData.user_id,
            metadata: { person_id: userData.person_id,  user_id: userData.person_id },
        });

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
        }, res);

        await this.auditLogsService.createLog({
            category: ENAuditCategory.AUTH,
            action: 'authLogin',
            entityType: 'User',
            createdBy: userData.user_id,
            metadata: { user_id: userData.user_id },
        });

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
        return await this.authService.getUserData(user_id, person_id);
    }

    @HttpCode(HttpStatus.OK)
    @Post('email/send-verify')
    @UseGuards(PassportJwtGuard)
    public async sendVerifyEmail(
        @CurrentUser() user: any
    ) {
        return await this.userTokenService.sendVerifyEmail(user.user_id);
    }

    @HttpCode(HttpStatus.OK)
    @Put('email/verify')
    @UseGuards(PassportJwtGuard)
    public async verifyEMail(
        @CurrentUser() user: any,
        @Body() data: VerifyEmailDto,
    ) {
        return await this.userTokenService.verifyEmail(user.user_id, data.token);
    }

    @Post('password/forgot')
    public async forgotPassword(
        @Body() data: ForgotPasswordDto
    ) {
        return await this.userTokenService.forgotPassword(data.email);
    }

    @Put('password/reset')
    public async resetPassword(
        @Body() data: ResetPasswordDto
    ) {
        return await this.userTokenService.resetPassword(data);
    }

}
