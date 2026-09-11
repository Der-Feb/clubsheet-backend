import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isValidIanaTimezone } from '../timezone/is-valid-iana-timezone';

@ValidatorConstraint({ name: 'isValidTimezone', async: false })
export class IsValidTimezoneConstraint implements ValidatorConstraintInterface {
  public validate(value: any, _args: ValidationArguments): boolean {
    return isValidIanaTimezone(value);
  }

  public defaultMessage(args?: ValidationArguments): string {
    return `${args?.property} must be a valid IANA timezone identifier (e.g. "Europe/London", "Africa/Nairobi")`;
  }
}

export function IsValidTimezone(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      validator: IsValidTimezoneConstraint,
    });
  };
}
