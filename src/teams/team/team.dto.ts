import { IsNotEmpty, IsString, Length } from "class-validator";

export class CreateTeamDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  team!: string;
}