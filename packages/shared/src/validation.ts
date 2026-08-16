const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
const URL_REGEX = /^https?:\/\/.+/;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

export function isValidPhone(value: string): boolean {
  return PHONE_REGEX.test(value);
}

export function isValidUrl(value: string): boolean {
  return URL_REGEX.test(value);
}

export function isWithinLength(value: string, max: number): boolean {
  return value.length <= max;
}

export function isNonEmpty(value: string): boolean {
  return value.length > 0;
}

export function asDate(value: string): Date | null {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}
