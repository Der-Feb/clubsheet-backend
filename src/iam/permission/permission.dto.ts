import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class GrantPermissionDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  permissionCode!: string;
}

export class RevokePermissionDto extends GrantPermissionDto {}