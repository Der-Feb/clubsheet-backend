// src/media/cloudinary/cloudinary.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private readonly cloudinaryConfig: any) {}

  async uploadLogoFromBase64(base64String: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64String,
        {
          folder: 'club-logos',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          background_removal: 'cloudinary_ai',
          transformation: [
            { width: 400, height: 400, crop: 'pad', background: 'transparent' },
            { quality: 'auto:good' },
            { fetch_format: 'png' },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!);
        },
      );
    });
  }
}