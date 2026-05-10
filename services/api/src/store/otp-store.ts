interface OtpEntry {
  otp: string;
  expiresAt: number;
}

const OTP_TTL_MS = 5 * 60 * 1000;
const otpStore = new Map<string, OtpEntry>();

export function createOtp(mobile: string) {
  const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
  const expiresAt = Date.now() + OTP_TTL_MS;
  otpStore.set(mobile, { otp, expiresAt });
  return { otp, expiresAt };
}

export function verifyOtp(mobile: string, otp: string): boolean {
  const data = otpStore.get(mobile);
  if (!data) return false;
  if (Date.now() > data.expiresAt) {
    otpStore.delete(mobile);
    return false;
  }
  const valid = data.otp === otp;
  if (valid) otpStore.delete(mobile);
  return valid;
}
