import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { isCuid } from "@paralleldrive/cuid2";

@Injectable()
export class ParseCuidPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (value.length < 1 || typeof value !== 'string' || !isCuid(value))
      throw new BadRequestException('Invalid CUID2 format');

    return value;
  }
}