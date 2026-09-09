import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Length } from 'class-validator';

@InputType()
export class UpdateRoleInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @Length(3, 10)
  name!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @Length(3, 100)
  description!: string;
}

export { UpdateRoleInput as UpdateRoleDto };

@InputType()
export class AssignRoleInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @Length(3, 10)
  roleCode!: string;
}

export { AssignRoleInput as AssignRoleDto };

@InputType()
export class CreateRoleInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @Length(3, 10)
  roleCode!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @Length(3, 10)
  name!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @Length(3, 100)
  description!: string;
}

export { CreateRoleInput as CreateRoleDto };
