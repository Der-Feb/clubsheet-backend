import { IsCuid2 } from "@common/validators/is-cuid.validator";
import { ENMembershipType } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from "class-validator";

export class AcceptInvitationDto {
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(5, { message: "Invalid token"})
  token: string;
}

export class InviteUserDto {
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail()
  @IsNotEmpty()
  invitee_email: string; 

  @IsEnum(ENMembershipType)
  type: ENMembershipType
}

export class CreateMembershipDto {
  @IsEnum(ENMembershipType)
  @IsNotEmpty()
  type!: ENMembershipType;

  @IsNotEmpty()
  @IsCuid2()
  personId!: string;
}