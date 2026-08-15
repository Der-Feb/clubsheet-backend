import { ENPermissionScope } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class GrantPermissionDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  permissionCode!: string;

  @IsNotEmpty()
  @IsEnum(ENPermissionScope)
  scope!: ENPermissionScope;
}

export class RevokePermissionDto extends GrantPermissionDto {}