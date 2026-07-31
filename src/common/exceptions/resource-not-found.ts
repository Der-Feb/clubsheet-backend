import { HttpException, HttpStatus } from "@nestjs/common";

export class ResourceNotFoundException extends HttpException {
    public resource: string = "Resource";

    constructor(message: string, resource?: string, ) {
        super(message, HttpStatus.BAD_REQUEST);
        this.resource = resource ? resource : "Resource";
    }
}