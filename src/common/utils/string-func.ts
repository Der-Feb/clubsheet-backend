
export function maskEmail(email) {
  // Finds the last '@' symbol and masks everything before it except the first 2 characters
  return email.replace(/^(.{2}).*@([^@]+)$/, "$1***@$2");
}