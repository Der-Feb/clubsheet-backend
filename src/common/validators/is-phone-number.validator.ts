import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { PhoneNumberUtil } from "google-libphonenumber";

const PhoneUtil = PhoneNumberUtil.getInstance();

@ValidatorConstraint({ name: "isPhoneNumber", async: false })
export class IsPhoneNumberConstraint implements ValidatorConstraintInterface {
  public validate(phoneNumber: any, validationArguments?: ValidationArguments): boolean {
    if (typeof phoneNumber !== 'string' || phoneNumber.length < 1) return false;

    try {
      const parsedPhoneNumber = PhoneUtil.parseAndKeepRawInput(phoneNumber);
      return PhoneUtil.isValidNumber(parsedPhoneNumber);
    } catch (error) {
      return false;
    }
  }

  public defaultMessage(args: ValidationArguments): string {
    return "Phone number must be a valid international phone number starting with + (e.g., +250788000000)";
  }
}