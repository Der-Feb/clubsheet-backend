import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class PassportLocalGuard extends AuthGuard("local"){}

@Injectable()
export class PassportJwtGuard extends AuthGuard("jwt"){};