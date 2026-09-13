import { SetMetadata } from '@nestjs/common';
import { ENFeature } from '@prisma/client';

export const REQUIRED_FEATURE_KEY = 'REQUIRED_FEATURE_KEY';

export const RequireFeature = (...features: ENFeature[]) =>
  SetMetadata(REQUIRED_FEATURE_KEY, features);
