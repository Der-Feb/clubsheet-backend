import { ENAuditCategory } from "@prisma/client";
import { IsEnum, IsObject, IsOptional, IsString } from "class-validator";


export class CreateAuditLogDto {
    @IsEnum(ENAuditCategory, { message: "" })
    category!: ENAuditCategory;

    @IsString()
    action!: string;

    @IsString()
    entityType!: string;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}