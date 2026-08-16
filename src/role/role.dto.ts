import { IntersectionType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsString, Length } from "class-validator";

export class UpdateRoleDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 10)
  name: string;
  
  @IsNotEmpty()
  @IsString()
  @Length(3, 100)
  description: string;
}

export class AssignRoleDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 10)
  roleCode: string;
}

export class CreateRoleDto extends IntersectionType (
  UpdateRoleDto,
  AssignRoleDto,
) {}