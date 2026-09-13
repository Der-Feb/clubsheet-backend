import { Field, Float, InputType } from '@nestjs/graphql';
import { IsPhoneNumberConstraint } from '@common/validators/is-phone-number.validator';
import {
  ENCoachPosition,
  ENCoachResponsibility,
  ENPlayerPosition,
  ENPreferredFoot,
} from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Validate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ENPlayerPosition as GqlENPlayerPosition } from '@generated/prisma-nestjs-graphql/prisma/en-player-position.enum';
import { ENPreferredFoot as GqlENPreferredFoot } from '@generated/prisma-nestjs-graphql/prisma/en-preferred-foot.enum';
import { ENCoachPosition as GqlENCoachPosition } from '@generated/prisma-nestjs-graphql/prisma/en-coach-position.enum';
import { ENCoachResponsibility as GqlENCoachResponsibility } from '@generated/prisma-nestjs-graphql/prisma/en-coach-responsibility.enum';

@InputType()
export class CreateProfileInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Validate(IsPhoneNumberConstraint)
  phoneNumber?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  profilePic?: string;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  sendEmailNotification?: boolean;
}

export { CreateProfileInput as CreateProfileDto };

@InputType()
export class CreatePlayerProfileInput {
  @Field(() => GqlENPlayerPosition)
  @IsEnum(ENPlayerPosition)
  position!: ENPlayerPosition;

  @Field(() => GqlENPreferredFoot, { nullable: true })
  @IsOptional()
  @IsEnum(ENPreferredFoot)
  preferredFoot?: ENPreferredFoot;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  heightCm?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  weightKg?: number;
}

export { CreatePlayerProfileInput as CreatePlayerProfileDto };

@InputType()
export class CreateCoachProfileInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  specialization?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  license?: string;
}

export { CreateCoachProfileInput as CreateCoachProfileDto };

@InputType()
export class CreateCoachAssignmentInput {
  @Field(() => [GqlENCoachResponsibility], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ENCoachResponsibility, { each: true })
  responsibilities?: ENCoachResponsibility[];

  @Field(() => GqlENCoachPosition)
  @IsEnum(ENCoachPosition)
  position!: ENCoachPosition;
}

export { CreateCoachAssignmentInput as CreateCoachAssignmentDto };

@InputType()
export class CreatePlayerAndProfileInput {
  @Field(() => CreatePlayerProfileInput)
  @ValidateNested()
  @Type(() => CreatePlayerProfileInput)
  playerProfile!: CreatePlayerProfileInput;

  @Field(() => CreateProfileInput)
  @ValidateNested()
  @Type(() => CreateProfileInput)
  profile!: CreateProfileInput;
}

export { CreatePlayerAndProfileInput as CreatePlayerAndProfileDto };

@InputType()
export class CreateCoachAndProfileInput {
  @Field(() => CreateCoachProfileInput)
  @ValidateNested()
  @Type(() => CreateCoachProfileInput)
  coachProfile!: CreateCoachProfileInput;

  @Field(() => CreateProfileInput)
  @ValidateNested()
  @Type(() => CreateProfileInput)
  profile!: CreateProfileInput;
}

export { CreateCoachAndProfileInput as CreateCoachAndProfileDto };
