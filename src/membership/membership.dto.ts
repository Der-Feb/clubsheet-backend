import { ENMembershipType } from "@prisma/client";
import { IsEnum } from "class-validator";

export class CreateMembershipDto {
    @IsEnum(ENMembershipType)
    type: ENMembershipType;

    
}