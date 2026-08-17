import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class CommunicationService {
    constructor(private readonly mailerService: MailerService) {}

    public async sendEmail(to: string, subject: string, body: string, htmlBody?: string) {
        try {
            await this.mailerService.sendMail({
                to,
                subject,
                text: body,
                html: htmlBody,
            });
        } catch (error) {
            console.error(error); // for debugging
            throw new InternalServerErrorException("Failed to send email");
        }
    }
}
