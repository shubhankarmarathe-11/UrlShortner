export const AUTH_REGEX = {
  // Name — letters only, spaces allowed, 2–50 chars
  name: /^[a-zA-Z\s]{2,50}$/,

  // Username — letters, numbers, underscore, dot, 3–20 chars, no spaces
  username: /^[a-zA-Z0-9._]{3,20}$/,

  // Email — standard email format
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // Password — min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  password:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/,

  // Phone — Indian mobile numbers (10 digits, optionally starts with +91 or 0)
  phone: /^(?:\+91|0)?[6-9]\d{9}$/,

  // OTP — 4 or 6 digit numeric
  otp: /^\d{4,6}$/,
};
