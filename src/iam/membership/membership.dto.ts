import { IsCuid2 } from '@common/validators/is-cuid.validator';
import { ENMembershipType } from '@prisma/client';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class AcceptInvitationDto {
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(5, { message: 'Invalid token' })
  token: string;
}

export class InviteUserDto {
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail()
  @IsNotEmpty()
  invitee_email: string;

  @IsEnum(ENMembershipType)
  type: ENMembershipType;
}

export class CreateMembershipDto {
  @IsEnum(ENMembershipType)
  @IsNotEmpty()
  type!: ENMembershipType;

  @IsNotEmpty()
  @IsCuid2()
  personId!: string;
}

export class ClubDto {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() shortName: string | null;
  @Expose() logo: string | null;
  @Expose() country: string;
  @Expose() status: string;
  @Expose() createdById: string | null;
}

export class MyMembershipResponseDto {
  @Expose() id: string;
  @Expose() status: string;
  @Expose() joinedAt: Date;

  @Expose()
  @Type(() => ClubDto)
  club: ClubDto;

  // Transforms the complex Prisma roles relation into a simple array of role code strings
  @Expose()
  @Transform(({ obj }) => obj.roles?.map((r: any) => r.role?.code ?? r) || [])
  roles: string[];

  @Expose()
  permissions: string[];

  // Accept raw membership payload and effective permissions explicitly
  constructor(membership: any, effectivePermissions: string[]) {
    Object.assign(this, membership);
    this.permissions = effectivePermissions;
  }
}