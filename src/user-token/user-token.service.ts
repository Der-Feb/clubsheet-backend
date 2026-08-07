import { BadRequestException, Injectable } from '@nestjs/common';
import { CommunicationService } from '../communication/communication.service';
import { generateNanoid } from 'id-tools';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { ENAuditCategory, ENUserTokenStatus, ENUserTokenType } from '@prisma/client';
import { ResourceNotFoundException } from '../common/exceptions/resource-not-found';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { maskEmail } from '../common/utils/string-func';

@Injectable()
export class UserTokenService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly communicationService: CommunicationService,
        private readonly auditLogsService: AuditLogsService,
) {}

    private fiveMinutes = 1000 * 60 * 5;

    public async userExists(userId: string) {
        if (!userId) throw new BadRequestException('User ID is required');
        
        return await this.prisma.user.findUnique({
            where: { id: userId },
            include: { person: true },
        });
    }

    public verifyEmailHtmlBody(name: string, token: string) {
        return `
        <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verify Your Email</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f7f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f7f5; padding: 40px 10px;">
                    <tr>
                        <td align="center">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
                                <!-- Top Accent Border -->
                                <tr>
                                    <td height="6" style="background-color: #10b981;"></td>
                                </tr>
                                <!-- Main Content Layout -->
                                <tr>
                                    <td style="padding: 40px 32px; text-align: center;">
                                        <!-- Header Title -->
                                        <h1 style="margin: 0 0 16px 0; color: #065f46; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">ClubSheet</h1>
                                        
                                        <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6; text-align: left;">
                                            Hello, <strong>${name}</strong>! 
                                        </p>
                                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 15px; line-height: 1.6; text-align: left;">
                                            Thank you for joining ClubSheet. Please use the verification code below to complete your registration and secure your account:
                                        </p>

                                        <!-- The OTP Display Block -->
                                        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 18px; margin: 24px 0; text-align: center;">
                                            <span style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #16a34a; margin-bottom: 6px;">Your Verification Code</span>
                                            <code style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; color: #047857; letter-spacing: 4px; display: inline-block;">${token}</code>
                                        </div>

                                        <p style="margin: 24px 0 0 0; color: #9ca3af; font-size: 13px; line-height: 1.5; text-align: left;">
                                            ⚠️ This verification code is single-use and will automatically expire in <strong>5 minutes</strong>. If you did not request this email, you can safely ignore it.
                                        </p>
                                    </td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td style="background-color: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #f3f4f6;">
                                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">&copy; ${new Date().getFullYear()} ClubSheet. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;
    }

    private resetPasswordHtmlBody(firstName: string, token: string): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f7f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f7f5; padding: 40px 10px;">
                <tr>
                    <td align="center">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
                            <!-- Top Accent Border (Amber/Orange for account security actions) -->
                            <tr>
                                <td height="6" style="background-color: #059669;"></td>
                            </tr>
                            <!-- Main Content Layout -->
                            <tr>
                                <td style="padding: 40px 32px; text-align: center;">
                                    <!-- Header Title -->
                                    <h1 style="margin: 0 0 16px 0; color: #065f46; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">ClubSheet</h1>
                                    
                                    <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6; text-align: left;">
                                        Hello, <strong>${firstName}</strong>! 
                                    </p>
                                    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 15px; line-height: 1.6; text-align: left;">
                                        We received a request to reset the password for your ClubSheet account. Please use the verification code below to proceed with setting up a new password:
                                    </p>

                                    <!-- The OTP Display Block -->
                                    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 18px; margin: 24px 0; text-align: center;">
                                        <span style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #16a34a; margin-bottom: 6px;">Your Reset Code</span>
                                        <code style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; color: #047857; letter-spacing: 4px; display: inline-block;">${token}</code>
                                    </div>

                                    <p style="margin: 24px 0 0 0; color: #9ca3af; font-size: 13px; line-height: 1.5; text-align: left;">
                                        ⚠️ This single-use code will automatically expire in <strong>5 minutes</strong>. If you did not make this request, your password will remain completely secure; you can safely delete or ignore this email.
                                    </p>
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #f3f4f6;">
                                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">&copy; ${new Date().getFullYear()} ClubSheet. All rights reserved.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;
    }

    /**
     * Generate token, keep the hash, the user assigned to it, the type, the expiration time, and send token to user
     * @param to 
     * @param verifyToken 
     */
    public async sendVerifyEmail(userId: string) {
        const user = await this.userExists(userId);
        if(!user) throw new ResourceNotFoundException("User not found", "User");
        if(user.isEmailVerified) throw new BadRequestException("User email is already verified");
        
        // rate limiter of tokens the user can send
        const tokenCountInWindow = await this.prisma.userToken.findMany({
            where: {
                userId,
                type: ENUserTokenType.EMAIL_VERIFICATION,
                createdAt: { gte: new Date(Date.now() - this.fiveMinutes) },
            }
        });
        // If they hit the limit, lock them out early
        if (tokenCountInWindow.length >= 3) {
            throw new BadRequestException(
                "You have requested too many verification codes. Please check your inbox or wait 5 minutes before trying again."
            );
        }
        
        const generatedToken = generateNanoid(5, 'abcdefghijklmnopqrstuvwxyz0123456789');
        const hashedToken = await argon2.hash(generatedToken);
        let disruptedTokensCount = 0;

        // transaction based token creation and email sending
        await this.prisma.$transaction(async (tx) => {   
            // loop in others of the user and mark them as disrupted
            const deleteResult = await tx.userToken.deleteMany({
                where: {
                    userId,
                    type: ENUserTokenType.EMAIL_VERIFICATION,
                },
            });

            disruptedTokensCount = deleteResult.count;

            await tx.userToken.create({
                data: {
                    hash: hashedToken,
                    type: ENUserTokenType.EMAIL_VERIFICATION,
                    expiresAt: new Date(Date.now() + this.fiveMinutes), // expires in 5 minutes
                    userId: userId,
                }
            });

            // when send email fail, we the exception, we roll back
            await this.communicationService.sendEmail(
                user.email,
                "Email Verification",
                `Hello, ${user.person.firstName}!`,
                this.verifyEmailHtmlBody(user.person.firstName, generatedToken),
            );
        });

        await this.auditLogsService.createLog({
            category: ENAuditCategory.AUTH,
            action: "sendVerifyEmail",
            entityType: "UserToken",
            metadata: { userId },
            description: `Verification email dispatched successfully. Disrupted ${disruptedTokensCount} outstanding active user tokens.`,
            createdBy: user.id
        });

        return {
            success: true,
            message: "Verification email sent successfully",
            details: `Check your email ${maskEmail(user.email)}, the token expires in 5 minutes`
        }
    }
    
    public async verifyEmail(userId: string, token: string) {
        const user = await this.userExists(userId);
        if(!user) throw new ResourceNotFoundException("User not found", "User");
        if(user.isEmailVerified) throw new BadRequestException("User email is already verified");

        const now = new Date();

        // find the user token record, which is pending, not expired, and matches the token
        const tokenRecords = await this.prisma.userToken.findMany({
            where: {
                userId,
                type: ENUserTokenType.EMAIL_VERIFICATION,
                status: ENUserTokenStatus.PENDING,
                expiresAt: { gte: now },
            }
        });

        let tokenApproved = false;
        for(const tokenRecord of tokenRecords) {
            if (await argon2.verify(tokenRecord.hash, token)) {
                tokenApproved = true;
                break;
            }
        }

        if(!tokenApproved) 
            throw new BadRequestException("Token is invalid or is expired");

        let usedTokens = 0;
        await this.prisma.$transaction(async(tx) => {
            // verify the user and delete all the token related to user
            const usedTokensResult = await tx.userToken.deleteMany({
                where: { 
                    userId: user.id,
                    type: ENUserTokenType.EMAIL_VERIFICATION,
                }
            });
            usedTokens = usedTokensResult.count;
    
            // update the user to be verified
            await tx.user.update({
                where: { id: userId },
                data: { isEmailVerified: true }
            });
        });

        // save the audit log, 
        await this.auditLogsService.createLog({
            category: ENAuditCategory.AUTH,
            action: "verifyEmail",
            entityType: "User, UserToken",
            metadata: { userId },
            description: `User email verified successfully after using ${usedTokens} user tokens`,
            createdBy: user.id
        });

        return {
            success: true,
            message: "Email verification successful",
        }
    }
    
    public async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { person: true },
        });
        
        if (!user) throw new ResourceNotFoundException("User not found with this email", "User");

        const tokenCountInWindow = await this.prisma.userToken.findMany({
            where: {
                userId: user.id,
                type: ENUserTokenType.CHANGE_PASSWORD,
                createdAt: { gte: new Date(Date.now() - this.fiveMinutes) },
            }
        });

        if (tokenCountInWindow.length >= 3) {
            throw new BadRequestException(
                "You have requested too many password reset codes. Please check your inbox or wait 5 minutes before trying again."
            );
        }
        
        const generatedToken = generateNanoid(5, 'abcdefghijklmnopqrstuvwxyz0123456789');
        const hashedToken = await argon2.hash(generatedToken);
        let disruptedCount = 0;

        // 3. Atomic Transaction
        await this.prisma.$transaction(async (tx) => {   
            // Hard-delete previous outstanding reset tokens to disrupt them completely
            const deleteResult = await tx.userToken.deleteMany({
                where: {
                    userId: user.id,
                    type: ENUserTokenType.CHANGE_PASSWORD,
                }
            });
            disruptedCount = deleteResult.count;

            // Save the active token
            await tx.userToken.create({
                data: {
                    hash: hashedToken,
                    type: ENUserTokenType.CHANGE_PASSWORD,
                    expiresAt: new Date(Date.now() + this.fiveMinutes),
                    userId: user.id,
                }
            });

            // Send email with green theme or text format; rolling back entirely if it fails
            await this.communicationService.sendEmail(
                user.email,
                "Reset Your Password",
                `Hello, ${user.person.firstName}!`,
                this.resetPasswordHtmlBody(user.person.firstName, generatedToken),
            );
        });

        // 4. Save the Audit Log for request tracking
        await this.auditLogsService.createLog({
            category: ENAuditCategory.AUTH,
            action: "forgotPasswordRequest",
            entityType: "UserToken",
            metadata: { userId: user.id },
            description: `Password reset requested. Disrupted ${disruptedCount} historical active reset tokens.`,
            createdBy: user.id
        });

        return {
            success: true,
            message: "Password reset verification code sent successfully",
            details: `Check your email ${maskEmail(user.email)}, the token expires in 5 minutes`
        };
    }

    public async resetPassword(dto: { email: string; token: string; newPassword: string }) {
        const { email, token, newPassword } = dto;

        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new ResourceNotFoundException("User not found", "User");

        const now = new Date();

        const tokenRecords = await this.prisma.userToken.findMany({
            where: {
                userId: user.id,
                type: ENUserTokenType.CHANGE_PASSWORD,
                status: ENUserTokenStatus.PENDING,
                expiresAt: { gte: now },
            }
        });

        let tokenApproved = false;
        for (const tokenRecord of tokenRecords) {
            if (tokenRecord.expiresAt.getTime() < now.getTime()) continue;

            if (await argon2.verify(tokenRecord.hash, token)) {
                tokenApproved = true;
                break;
            }
        }

        if (!tokenApproved) {
            throw new BadRequestException("Token is invalid or has expired");
        }

        const hashedNewPassword = await argon2.hash(newPassword);
        let clearedTokensCount = 0;

        await this.prisma.$transaction(async (tx) => {
            const deleteResult = await tx.userToken.deleteMany({
                where: { 
                    userId: user.id,
                    type: ENUserTokenType.CHANGE_PASSWORD,
                }
            });
            clearedTokensCount = deleteResult.count;

            await tx.user.update({
                where: { id: user.id },
                data: { passwordHash: hashedNewPassword }
            });
        });

        // 3. Fire the Audit Log tracking
        await this.auditLogsService.createLog({
            category: ENAuditCategory.AUTH,
            action: "resetPasswordComplete",
            entityType: "User, UserToken",
            metadata: { userId: user.id },
            description: `User password reset completed successfully. Purged ${clearedTokensCount} associated tokens from data layer.`,
            createdBy: user.id
        });

        return {
            success: true,
            message: "Password updated successfully. You can now log in with your new credentials.",
        };
    }
}
