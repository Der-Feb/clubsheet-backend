import { IsPhoneNumberConstraint } from '@common/validators/is-phone-number.validator';
import { IntersectionType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ENCoachPosition, ENCoachResponsibility, ENPlayerPosition, ENPreferredFoot } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsDecimal,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Validate,
} from 'class-validator';

export class CreateProfileDto {
  @ApiPropertyOptional({
    description: 'International phone number (e.g., +250788000000)',
    example: '+250788000000',
  })
  @IsOptional()
  @IsString()
  @Validate(IsPhoneNumberConstraint)
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'URL to profile picture',
    example: 'https://storage.clubsheet.com/profiles/avatar.jpg',
  })
  @IsOptional()
  @IsUrl()
  profilePic?: string;

  @ApiPropertyOptional({
    description: 'Receive email notifications',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  sendEmailNotification?: boolean;
}

export class CreatePlayerProfileDto {
  @IsEnum(() => ENPlayerPosition)
  position!: ENPlayerPosition;
  
  @IsOptional()
  @IsEnum(() => ENPreferredFoot)
  preferredFoot?: ENPreferredFoot;

  @IsOptional()
  @IsDecimal()
  heightCm?: number;
  
  @IsOptional()
  @IsDecimal()
  weightKg?: number;
}

export class CreateCoachProfileDto {
  @IsString()
  @IsOptional()
  specialization?: string;
  
  @IsString()
  @IsOptional()
  license?: string;
}

export class CreateCoachAssignmentDto {
  @IsOptional()
  @IsArray()
  @IsEnum(() => ENCoachResponsibility, { each: true })
  responsibilities?: ENCoachResponsibility[];
  
  @IsEnum(() => ENCoachPosition)
  position!: ENCoachPosition;

}

export class CreatePlayerAndProfileDto {
  @Validate(CreateProfileDto)
  playerProfile: CreatePlayerProfileDto;

  @Validate(CreateProfileDto)
  profile: CreateProfileDto;
}

export class CreateCoachAndProfileDto {
  @Validate(CreateProfileDto)
  coachProfile: CreateCoachProfileDto;

  @Validate(CreateProfileDto)
  profile: CreateProfileDto;
}
