/**
 * Bangladesh mobile numbers: accepts "01712345678", "8801712345678" and "+8801712345678"
 * (spaces and dashes are ignored) and returns the single stored form "+8801712345678".
 */
const NORMALISED = /^\+8801[3-9]\d{8}$/;

export function normalisePhone(input: string): string | null {
  const digits = input.replace(/[\s-]/g, '');
  let candidate: string;
  if (digits.startsWith('+880')) candidate = digits;
  else if (digits.startsWith('880')) candidate = `+${digits}`;
  else if (digits.startsWith('0')) candidate = `+880${digits.slice(1)}`;
  else return null;
  return NORMALISED.test(candidate) ? candidate : null;
}

export function isNormalisedPhone(value: string): boolean {
  return NORMALISED.test(value);
}
