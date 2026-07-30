import { ENGender } from '@prisma/client';
import { IntersectionType } from '@nestjs/mapped-types';
import { IsEmail, IsString, MinLength, IsDate, MaxDate, IsEnum, IsISO31661Alpha2 } from 'class-validator';
import { Transform } from 'class-transformer';
import nationalities from 'i18n-nationality';
import countries from 'i18n-iso-countries';

nationalities.registerLocale(require('i18n-nationality/langs/en.json'));
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

export class RegisteringPersonDto {
    @Transform(({ value }) => value?.trim().toLowerCase())
    @IsString()
    firstName: string;

    @Transform(({ value }) => value?.trim().toLowerCase())
    @IsString()
    lastName: string;

    @IsDate()
    @MaxDate(() => new Date(), { message: 'Date of birth cannot be in the future' })
    dob: Date;

    @IsString()
    @Transform(({ value }) => value?.trim().toLowerCase())
    @Transform(({ value }) => {
        if (typeof value !== 'string') return value;

        const nationalityCode = nationalities.getAlpha2Code(value, 'en');
        const countryCode = countries.getAlpha2Code(value, 'en');

        if (nationalityCode) return nationalityCode.toUpperCase();
        if (countryCode) return countryCode.toUpperCase();

        return value.toUpperCase();
    })
    @IsISO31661Alpha2({ message: "Invalid Nationality" })
    nationality: string;

    @IsEnum(ENGender, { message: 'Gender must be Male or Female' })
    gender: ENGender;
}

export class RegisterUserDto {
    @Transform(({ value }) => value?.trim().toLowerCase())
    @IsEmail()
    email: string;
    
    @Transform(({ value }) => value?.trim().toLowerCase())
    @IsString()
    @MinLength(5)
    password: string;
}

export class RegisterUserPersonDto extends IntersectionType(
    RegisteringPersonDto, 
    RegisterUserDto,
) {}

export class LoginDto extends RegisterUserDto {}
