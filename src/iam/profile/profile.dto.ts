import { ENPlayerPosition, ENPreferredFoot } from "@prisma/client";
import { IsBoolean, IsEnum, IsNumber, IsString } from "class-validator";

export class CreateProfileDto {
  @IsString()
  profilePic?: string;

  @IsBoolean()
  sendEmailNotification?: boolean;
}

export class CreatePlayerProfile extends CreateProfileDto {
  @IsEnum(() => ENPreferredFoot)
  preferredFoot!: ENPreferredFoot;

  @IsEnum(() => ENPlayerPosition)
  position!: ENPlayerPosition;

  @IsNumber()
  heightCm!: number;

  @IsNumber()
  weightKg!: number;
}
