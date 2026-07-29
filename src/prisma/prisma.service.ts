import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaClient } from "../../generated/prisma/client";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor(private configService: ConfigService) {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        const pool = new Pool({ connectionString: databaseUrl });
        const adapter = new PrismaPg(pool);

        super({ adapter });
    }

    private getDatabaseUrl(): string {
        return this.configService.get<string>('DATABASE_URL') ?? ""; 
    }

    public async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log("Database connected successfully on " + this.getDatabaseUrl());
        } catch (error) {
            this.logger.error("Failed to connect to the database", error);
            throw error;
        }
    }

    public async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log("Database connection closed.");
    }
}