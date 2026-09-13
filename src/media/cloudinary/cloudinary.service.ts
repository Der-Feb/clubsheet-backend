import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from 'cloudinary';
import { extractPublicId } from 'cloudinary-build-url';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private readonly cloudinaryConfig: any) {}

  private readonly logger = new Logger(CloudinaryService.name);

  async uploadLogoFromBase64(
    base64String: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64String,
        {
          folder: 'club-logos',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          background_removal: 'cloudinary_ai',
          transformation: [
            { width: 400, height: 400, crop: 'pad', background: 'transparent' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!);
        },
      );
    });
  }

  public async deleteFile(fileUrlOrId: string) {
    if (!fileUrlOrId) return false;

    const publicId = fileUrlOrId.includes('cloudinary.com')
      ? extractPublicId(fileUrlOrId)
      : fileUrlOrId;

    const result: { result: string } =
      await cloudinary.uploader.destroy(publicId);

    if (result.result == 'ok') {
      this.logger.log(`Successfully deleted Cloudinary asset: ${publicId}`);
      return true;
    }

    this.logger.warn(
      `Cloudinary deletion status for ${publicId}: ${result.result}`,
    );
    return false;
  }
}
