import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Length } from 'class-validator';

@InputType()
export class CreateTeamInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  name!: string;
}

export { CreateTeamInput as CreateTeamDto };

@InputType()
export class UpdateTeamInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  name!: string;
}

export { UpdateTeamInput as UpdateTeamDto };
