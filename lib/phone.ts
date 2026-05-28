export function phoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidUsPhone(value: string) {
  return phoneDigits(value).length === 10;
}

export function formatUsPhone(value: string) {
  const digits = phoneDigits(value);

  if (digits.length !== 10) {
    return value.trim();
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}
