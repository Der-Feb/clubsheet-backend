import { IntersectionType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class ForgotPasswordDto {
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail()
  email!: string;
}

export class SendVerifyEmailDto extends ForgotPasswordDto {}

export class VerifyEmailDto extends SendVerifyEmailDto {
  /**
   * The 6-character OTP from the email.
   * Transform uppercases the value so mobile keyboards that auto-lowercase
   * don't cause confusing validation rejections.
   */
  @Transform(({ value }) => value?.trim().toUpperCase())
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP must be exactly 6 characters' })
  @Matches(/^[0-9A-F]{6}$/, { message: 'OTP must be 6 hex characters' })
  token!: string;
}

export class ResetPasswordDto extends IntersectionType(VerifyEmailDto) {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(5, { message: 'Password must at least contain 5 characters' })
  newPassword!: string;
}
