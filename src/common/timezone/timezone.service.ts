import { BadRequestException, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { isValidIanaTimezone } from './is-valid-iana-timezone';

@Injectable()
export class TimezoneService {
  /**
   * Returns true if the string is a valid IANA timezone identifier.
   * Delegates to the shared isValidIanaTimezone utility.
   */
  isValidTimezone(tz: string | null | undefined): boolean {
    return isValidIanaTimezone(tz);
  }

  /**
   * Resolves the effective timezone from a priority chain.
   * Priority: clientTz → clubTz → 'UTC'
   * Accepts null/undefined at each step — isValidTimezone handles them.
   */
  resolve(clientTz?: string | null, clubTz?: string | null): string {
    if (this.isValidTimezone(clientTz)) return clientTz!;
    if (this.isValidTimezone(clubTz)) return clubTz!;
    return 'UTC';
  }

  /**
   * Returns the current moment as a UTC Date object.
   * Semantically equivalent to new Date() but centralised.
   */
  nowUtc(): Date {
    return new Date();
  }

  /**
   * Returns a Date offset by `offsetMs` milliseconds from now.
   * Positive values → future (token/invitation expiry).
   * Negative values → past (rate-limit lookback windows, 24h cleanup cutoff).
   * Offset is always absolute — no timezone shift is applied.
   */
  futureUtc(offsetMs: number): Date {
    return new Date(Date.now() + offsetMs);
  }

  /**
   * Parses a local datetime string in the given IANA timezone and
   * returns the equivalent UTC Date. Used for user-submitted scheduling
   * times (e.g. training startsAt / endsAt).
   *
   * If the input already carries an explicit UTC offset (ends with Z or
   * contains a +HH:MM / -HH:MM pattern), that offset is respected as-is
   * and the `timezone` argument is ignored.
   *
   * For unqualified local datetime strings (e.g. "2026-11-01T09:00:00"),
   * delegates to luxon: DateTime.fromISO(str, { zone: timezone }).toJSDate()
   *
   * Luxon handles DST edge cases correctly:
   *   - Fall-back ambiguity: picks the earlier (pre-transition) UTC instant
   *   - Spring-forward gap: advances to the first valid instant after the gap
   *
   * Throws BadRequestException if the string cannot be parsed.
   */
  toUtc(localDatetimeString: string, timezone: string): Date {
    // If string already carries an explicit offset, parse directly
    if (/Z|[+-]\d{2}:\d{2}$/.test(localDatetimeString)) {
      const d = new Date(localDatetimeString);
      if (isNaN(d.getTime())) {
        throw new BadRequestException(
          `Invalid datetime: ${localDatetimeString}`,
        );
      }
      return d;
    }

    // Unqualified local string — use luxon for DST-correct conversion
    const dt = DateTime.fromISO(localDatetimeString, { zone: timezone });
    if (!dt.isValid) {
      throw new BadRequestException(
        `Invalid datetime "${localDatetimeString}" for timezone "${timezone}"`,
      );
    }
    return dt.toJSDate();
  }
}
