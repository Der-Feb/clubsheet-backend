/** Returns true if value is a valid IANA timezone identifier. */
export function isValidIanaTimezone(tz: string | null | undefined): boolean {
  if (!tz || typeof tz !== 'string') return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
