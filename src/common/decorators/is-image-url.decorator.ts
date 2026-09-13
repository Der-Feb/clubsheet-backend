import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  isURL,
} from 'class-validator';

export function IsImageUrl(
  allowedExtensions: string[] = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'svg',
    'avif',
  ],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isImageUrl',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          // 1. Leverage class-validator's built-in isURL helper
          const isValidUrl = isURL(value, {
            protocols: ['http', 'https'],
            require_protocol: true,
          });

          if (!isValidUrl) return false;

          // 2. Build dynamic regex based on allowed extensions
          const extensionsPattern = allowedExtensions.join('|');
          const imageRegex = new RegExp(
            `\\.(${extensionsPattern})($|\\?)`,
            'i',
          );

          return imageRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid HTTP/HTTPS URL pointing to an image file (${allowedExtensions.join(', ')})`;
        },
      },
    });
  };
}
