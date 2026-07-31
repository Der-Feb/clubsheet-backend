import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterUserDto, RegisterUserPersonDto } from './auth.dto';
import * as argon2 from 'argon2';
import { Prisma, User } from '@prisma/client';
import { parsePrismaError } from '../common/error-handler/error-handler';
import { JwtService } from '@nestjs/jwt';
import { TPayload } from './auth.types';
import { Response } from 'express';

export type TUserWithPerson = Prisma.UserGetPayload<{
  include: { person: true };
}>;

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService
    ) {}

    private async ensurePersonAccountExists(email: string) {
        if (await this.prisma.user.findUnique({ where: { email } })) 
            return true;
        return false;
    }

    public returnSanitizedUserData(user: TUserWithPerson) {
        return {           
            user_id: user.id,
            person_id: user.person.id,
            name: `${user.person.firstName} ${user.person.lastName}`,
            email: user.email,
            dob: user.person.dob,
            gender: user.person.gender,
            nationality: user.person.nationality
        }
    }

    /**
     * A completely new user is going to register, we creae person - user records
     * 
     * @param registerDto 
     * @returns 
     */
    public async registerUserPerson(registerDto: RegisterUserPersonDto) {
        if (await this.ensurePersonAccountExists(registerDto.email)) {
            throw new ConflictException('Person with that email account already exists');
        }

        const hashedPassword = await argon2.hash(registerDto.password);

        try {
            const newUser = await this.prisma.$transaction(async(tx) => {
                return await tx.user.create({
                    data: {
                        email: registerDto.email,
                        passwordHash: hashedPassword,
                        person: {
                            create: {
                                firstName: registerDto.firstName,
                                lastName: registerDto.lastName,
                                dob: registerDto.dob,
                                nationality: registerDto.nationality,
                                gender: registerDto.gender,
                            },
                        },
                    }, include: { person: true }
                });
            });

            return this.returnSanitizedUserData(newUser);
        } catch (error) {
            if(error instanceof Prisma.PrismaClientKnownRequestError)
                throw new BadRequestException(parsePrismaError(error));

            throw new BadRequestException("Unkown Error");
        }
    }

    public async validateCredentials(loginDto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
            include: { person: true },
        });

        if (!user) throw new UnauthorizedException('Invalid email or password');

        const validPassword = await argon2.verify(
            user.passwordHash, loginDto.password,
        );

        if (!validPassword) throw new UnauthorizedException('Invalid email or password');

        return this.returnSanitizedUserData(user);
    }

    private async updateLastLogin(user: User) {
        return await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });
    }

    private async generateAccessToken(payload: TPayload) {
        return await this.jwtService.signAsync(payload);
    }

    public async assignCookie(payload: TPayload, res: Response) {
        const accessToken = this.generateAccessToken(payload);

        res.cookie("accessToken", accessToken, {
            httpOnly: true, // Prevents client-side JS from reading the cookie (protects against XSS)
            secure: process.env.NODE_ENV === 'production', // Send over HTTPS only in production
            sameSite: 'strict', // Protects against CSRF attacks
            maxAge: 24 * 60 * 60 * 1000,
        });
    }
}
