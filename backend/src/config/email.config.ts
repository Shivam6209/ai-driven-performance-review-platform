import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  provider: process.env.EMAIL_PROVIDER || 'smtp',
  from: process.env.EMAIL_FROM || 'noreply@example.com',
  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },
  mailjet: {
    apiKey: process.env.MAILJET_API_KEY || '',
    apiSecret: process.env.MAILJET_API_SECRET || '',
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
  },
  templates: {
    welcomeEmail: process.env.EMAIL_TEMPLATE_WELCOME || 'welcome',
    passwordReset: process.env.EMAIL_TEMPLATE_PASSWORD_RESET || 'password-reset',
    emailVerification: process.env.EMAIL_TEMPLATE_EMAIL_VERIFICATION || 'email-verification',
    reviewNotification: process.env.EMAIL_TEMPLATE_REVIEW_NOTIFICATION || 'review-notification',
    feedbackReceived: process.env.EMAIL_TEMPLATE_FEEDBACK_RECEIVED || 'feedback-received',
  },
})); 