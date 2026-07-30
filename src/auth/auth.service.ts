import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterUserDto, RegisterUserPersonDto } from './auth.dto';
import * as argon2 from 'argon2';
import { Prisma } from '@prisma/client';
import { parsePrismaError } from '../common/error-handler/error-handler';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService) {}

    public async ensurePersonAccountExists(email: string) {
        if (await this.prisma.user.findUnique({ where: { email } })) 
            return true;
        return false;
    }

    public async ensurePersonExists(person_id: string) {
        if (await this.prisma.person.findUnique({ where: { id: person_id } })) 
            return true;
        return false;
    }

    public async register(person_id: string, registerDto: RegisterUserDto) {
        if (await this.ensurePersonAccountExists(registerDto.email)) {
            throw new ConflictException('Person with that email account already exists');
        }
        if (!await this.ensurePersonExists(person_id)) {
            throw new BadRequestException('Person with that id does not exist');
        }

        const hashedPassword = await argon2.hash(registerDto.password);
        try {
            await this.prisma.$transaction(async(tx) => {
                return await tx.user.create({
                    data: {
                        personId: person_id,
                        email: registerDto.email,
                        passwordHash: hashedPassword,
                    }
                });
            });
        } catch (error) {
            if(error instanceof Prisma.PrismaClientKnownRequestError)
                throw new BadRequestException(parsePrismaError(error));

            throw new BadRequestException("Unkown Error");
        }
        
        return { message: "Registration successful" };
    }

    public async registerUserPerson(registerDto: RegisterUserPersonDto) {
        if (await this.ensurePersonAccountExists(registerDto.email)) {
            throw new ConflictException('Person with that email account already exists');
        }

        const hashedPassword = await argon2.hash(registerDto.password);
        try {
            await this.prisma.$transaction(async(tx) => {
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
        } catch (error) {
            if(error instanceof Prisma.PrismaClientKnownRequestError)
                throw new BadRequestException(parsePrismaError(error));

            throw new BadRequestException("Unkown Error");
        }
        
        return { message: "Registration successful" };
    }

    public async login(loginDto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
            include: { person: true },
        });

        if (!user) throw new UnauthorizedException('Invalid email or password');

        const validPassword = await argon2.verify(
            user.passwordHash, loginDto.password,
        );

        if (!validPassword) throw new UnauthorizedException('Invalid email or password');

        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        return { message: 'Login successful' };
    }
}
