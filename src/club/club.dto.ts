import { IsString } from "class-validator";

export class CreateClubDto {
    @IsString()
    name!: string;
}