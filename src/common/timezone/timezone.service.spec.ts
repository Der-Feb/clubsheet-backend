import { BadRequestException } from '@nestjs/common';
import { isValidIanaTimezone } from './is-valid-iana-timezone';
import { TimezoneService } from './timezone.service';

describe('isValidIanaTimezone', () => {
  it('returns true for valid IANA timezone strings', () => {
    expect(isValidIanaTimezone('Africa/Nairobi')).toBe(true);
    expect(isValidIanaTimezone('UTC')).toBe(true);
    expect(isValidIanaTimezone('America/New_York')).toBe(true);
    expect(isValidIanaTimezone('Europe/London')).toBe(true);
  });

  it('returns false for invalid timezone strings', () => {
    expect(isValidIanaTimezone('GMT+5')).toBe(false);
    expect(isValidIanaTimezone('not-a-tz')).toBe(false);
    expect(isValidIanaTimezone('Foo/Bar')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidIanaTimezone('')).toBe(false);
  });

  it('returns false for null', () => {
    expect(isValidIanaTimezone(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isValidIanaTimezone(undefined)).toBe(false);
  });
});

describe('TimezoneService', () => {
  let service: TimezoneService;

  beforeEach(() => {
    service = new TimezoneService();
  });

  describe('resolve', () => {
    it('returns clientTz when both are valid', () => {
      expect(service.resolve('Africa/Nairobi', 'Europe/London')).toBe(
        'Africa/Nairobi',
      );
    });

    it('returns clubTz when clientTz is invalid', () => {
      expect(service.resolve('GMT+5', 'Europe/London')).toBe('Europe/London');
    });

    it('returns clubTz when clientTz is null', () => {
      expect(service.resolve(null, 'Europe/London')).toBe('Europe/London');
    });

    it('returns clubTz when clientTz is undefined', () => {
      expect(service.resolve(undefined, 'Africa/Nairobi')).toBe(
        'Africa/Nairobi',
      );
    });

    it('returns UTC when both are invalid', () => {
      expect(service.resolve('not-a-tz', 'GMT+5')).toBe('UTC');
    });

    it('returns UTC when both are null', () => {
      expect(service.resolve(null, null)).toBe('UTC');
    });

    it('returns UTC when both are undefined', () => {
      expect(service.resolve(undefined, undefined)).toBe('UTC');
    });

    it('returns UTC when called with no arguments', () => {
      expect(service.resolve()).toBe('UTC');
    });
  });

  describe('toUtc', () => {
    it('converts an unqualified ISO string in UTC+3 to correct UTC instant', () => {
      // Africa/Nairobi is UTC+3 year-round (no DST)
      // "2026-06-15T09:00:00" in UTC+3 should be "2026-06-15T06:00:00Z"
      const result = service.toUtc('2026-06-15T09:00:00', 'Africa/Nairobi');
      expect(result.toISOString()).toBe('2026-06-15T06:00:00.000Z');
    });

    it('passes through a string with explicit Z suffix', () => {
      const result = service.toUtc('2026-06-15T09:00:00Z', 'Africa/Nairobi');
      expect(result.toISOString()).toBe('2026-06-15T09:00:00.000Z');
    });

    it('passes through a string with explicit +03:00 offset', () => {
      const result = service.toUtc(
        '2026-06-15T09:00:00+03:00',
        'Africa/Nairobi',
      );
      expect(result.toISOString()).toBe('2026-06-15T06:00:00.000Z');
    });

    it('passes through a string with explicit -05:00 offset', () => {
      const result = service.toUtc(
        '2026-06-15T09:00:00-05:00',
        'America/New_York',
      );
      expect(result.toISOString()).toBe('2026-06-15T14:00:00.000Z');
    });

    it('throws BadRequestException for an unparseable string', () => {
      expect(() => service.toUtc('not-a-datetime', 'UTC')).toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException for an unparseable string with explicit offset', () => {
      expect(() => service.toUtc('not-a-date+03:00', 'UTC')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('futureUtc', () => {
    it('returns a date in the future for a positive offset', () => {
      const before = Date.now();
      const offset = 5 * 60 * 1000; // 5 minutes
      const result = service.futureUtc(offset);
      const after = Date.now();

      expect(result.getTime()).toBeGreaterThanOrEqual(before + offset);
      expect(result.getTime()).toBeLessThanOrEqual(after + offset);
    });

    it('returns a date in the past for a negative offset', () => {
      const before = Date.now();
      const offset = -5 * 60 * 1000; // -5 minutes
      const result = service.futureUtc(offset);
      const after = Date.now();

      expect(result.getTime()).toBeGreaterThanOrEqual(before + offset);
      expect(result.getTime()).toBeLessThanOrEqual(after + offset);
    });

    it('returns approximately now for a zero offset', () => {
      const before = Date.now();
      const result = service.futureUtc(0);
      const after = Date.now();

      expect(result.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.getTime()).toBeLessThanOrEqual(after);
    });
  });

  describe('nowUtc', () => {
    it('returns a Date close to the current time', () => {
      const before = Date.now();
      const result = service.nowUtc();
      const after = Date.now();

      expect(result.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.getTime()).toBeLessThanOrEqual(after);
    });
  });
});
