import { Optional } from "@nestjs/common";
import { ENMembershipType } from "@prisma/client";
import { ArrayMinSize, IsArray, IsEnum, IsISO31661Alpha2, IsNotEmpty, IsOptional, IsString } from "class-validator";
import countries from 'i18n-iso-countries';
import { Transform } from "class-transformer";

countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

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
    @Transform(({ value }) => {
        if (typeof value !== 'string') return value;

        const cleaned = value.trim().toLowerCase();
        const countryCode = countries.getAlpha2Code(cleaned, 'en');

        if (countryCode) return countryCode.toUpperCase();

        return cleaned.toUpperCase();
    })
    @IsISO31661Alpha2({ message: 'Invalid Country' })
    country!: string;

    @IsArray()
    @ArrayMinSize(1, { message: "At least one membership type must be selected" })
    @IsEnum(ENMembershipType, { each: true, message: "Each membership type must be of valid value" })
    membershipTypes!: ENMembershipType[];
}

export class UpdateClubDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  shortName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  logo?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;

    const cleaned = value.trim().toLowerCase();
    const countryCode = countries.getAlpha2Code(cleaned, 'en');

    if (countryCode) return countryCode.toUpperCase();

    return cleaned.toUpperCase();
  })
  @IsISO31661Alpha2({ message: 'Invalid Country' })
  country?: string;
}