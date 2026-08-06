import { Optional } from "@nestjs/common";
import { IsString } from "class-validator";

export class CreateClubDto {
    @IsString()
    name!: string;

    @Optional()
    @IsString()
    shortName?: string;

    @Optional()
    @IsString()
    logo?: string;

    @IsString()
    country!: string;
}