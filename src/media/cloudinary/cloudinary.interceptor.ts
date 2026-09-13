// src/common/interceptors/cloudinary-upload.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class CloudinaryUploadInterceptor implements NestInterceptor {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const isGraphql = context.getType<string>() === 'graphql';
    const request = this.getRequest(context);

    // Target the input object where logo lives
    const inputPayload = isGraphql
      ? context.getArgByIndex(1)?.input
      : request.body?.input || request.body;

    if (inputPayload && inputPayload.logo) {
      // Check if the logo string is a Base64 data URI
      if (inputPayload.logo.startsWith('data:image/')) {
        try {
          const uploadResult =
            await this.cloudinaryService.uploadLogoFromBase64(
              inputPayload.logo,
            );
          // Overwrite the base64 string with the clean Cloudinary URL
          inputPayload.logo = uploadResult.secure_url;
        } catch (error) {
          console.log(error);
          throw new BadRequestException(
            'Cloudinary base64 image upload failed',
          );
        }
      }
      // If it's already a regular URL, it passes through untouched as a clean URL
    }

    return next.handle();
  }

  private getRequest(context: ExecutionContext) {
    if (context.getType<string>() === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req;
    }
    return context.switchToHttp().getRequest();
  }
}
