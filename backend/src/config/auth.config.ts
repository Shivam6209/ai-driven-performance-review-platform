import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  passwordReset: {
    tokenExpiresIn: parseInt(process.env.PASSWORD_RESET_EXPIRES_IN || '3600', 10), // 1 hour
  },
  verification: {
    tokenExpiresIn: parseInt(process.env.VERIFICATION_TOKEN_EXPIRES_IN || '86400', 10), // 24 hours
  },
})); 