import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";

@Injectable()
export class MemberShipStrategy extends PassportStrategy(Strategy, "membership") {
    constructor() {
        super({
            usernameField: ""
        });
    }

    // TODO: impliment a way to validate if the user have active membership
    public async validate() {}
}