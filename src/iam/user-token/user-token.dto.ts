import { IntersectionType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsEmail, MinLength } from "class-validator";

export class ForgotPasswordDto {
    @Transform(({ value }) => value?.trim().toLowerCase())
    @IsEmail()
    email!: string
}

export class SendVerifyEmailDto extends ForgotPasswordDto {}

export class VerifyEmailDto extends SendVerifyEmailDto {
    @Transform(({ value }) => value?.trim())
    @IsString()
    @IsNotEmpty()
    @MinLength(10, { message: "Invalid token" })
    token!: string
}

export class ResetPasswordDto extends IntersectionType(
    VerifyEmailDto,
) {
    @Transform(({ value }) => value?.trim().toLowerCase())
    @IsString()
    @MinLength(5, { message: "Password must at least contain 5 characters" })
    newPassword!: string
}