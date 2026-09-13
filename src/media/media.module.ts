import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { CloudinaryUploadInterceptor } from './cloudinary/cloudinary.interceptor';
import { CloudinaryProvider } from './cloudinary/cloudinary.provider';

@Module({
  providers: [
    CloudinaryService,
    CloudinaryUploadInterceptor,
    CloudinaryProvider,
  ],
  exports: [CloudinaryService, CloudinaryUploadInterceptor, CloudinaryProvider],
})
export class MediaModule {}
