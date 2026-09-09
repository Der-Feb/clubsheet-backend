import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsCuid2 } from '@common/validators/is-cuid.validator';
import { ENMembershipStatus, ENMembershipType } from '@prisma/client';
import { Expose, Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { Club } from '@generated/prisma-nestjs-graphql/club/club.model';
import { ENMembershipStatus as GqlENMembershipStatus } from '@generated/prisma-nestjs-graphql/prisma/en-membership-status.enum';
import { ENMembershipType as GqlENMembershipType } from '@generated/prisma-nestjs-graphql/prisma/en-membership-type.enum';

@InputType()
export class AcceptInvitationInput {
  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(5, { message: 'Invalid token' })
  token!: string;
}

export { AcceptInvitationInput as AcceptInvitationDto };

@InputType()
export class InviteUserInput {
  @Field(() => String)
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail()
  @IsNotEmpty()
  invitee_email!: string;

  @Field(() => GqlENMembershipType)
  @IsEnum(ENMembershipType)
  type!: ENMembershipType;
}

export { InviteUserInput as InviteUserDto };

@InputType()
export class CreateMembershipInput {
  @Field(() => GqlENMembershipType)
  @IsEnum(ENMembershipType)
  @IsNotEmpty()
  type!: ENMembershipType;

  @Field(() => String)
  @IsNotEmpty()
  @IsCuid2()
  personId!: string;
}

export { CreateMembershipInput as CreateMembershipDto };

@ObjectType()
export class InvitationResponse {
  @Field(() => Boolean)
  success!: boolean;

  @Field(() => String)
  message!: string;
}

@ObjectType()
export class MyMembershipOutput {
  @Field(() => String)
  @Expose()
  id!: string;

  @Field(() => GqlENMembershipStatus)
  @Expose()
  status!: ENMembershipStatus;

  @Field(() => Date)
  @Expose()
  joinedAt!: Date;

  @Field(() => Club, { nullable: true })
  @Expose()
  club?: Club;

  @Field(() => [String])
  @Expose()
  @Transform(({ obj }) => obj.roles?.map((r: any) => r.role?.code ?? r) || [])
  roles!: string[];

  @Field(() => [String])
  @Expose()
  permissions!: string[];

  constructor(membership: any, effectivePermissions: string[]) {
    Object.assign(this, membership);
    this.roles = membership.roles?.map((r: any) => r.role?.code ?? r) || [];
    this.permissions = effectivePermissions;
  }
}

export { MyMembershipOutput as MyMembershipResponseDto };