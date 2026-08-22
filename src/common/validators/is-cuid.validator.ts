import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { isCuid } from '@paralleldrive/cuid2';

@ValidatorConstraint({ name: "isCuid", async: false })
export class IsCuid2Constraint implements ValidatorConstraintInterface {
  public validate(value: any, args: ValidationArguments) {
    if (typeof value !== "string" || !isCuid(value)) return false;

    return true;
  }

  public defaultMessage(args?: ValidationArguments): string {
    return `${args?.property} is not a valid CUID`;
  }
}

export function IsCuid2(options?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      validator: IsCuid2Constraint,
    });
  };
}