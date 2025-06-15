export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
// WebSocket removed - using Firebase for real-time functionality

export const config = {
  apiUrl: API_URL,
  enableAI: process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES === 'true',
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Performance Review Platform',
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Company',
  dateFormat: process.env.NEXT_PUBLIC_DATE_FORMAT || 'YYYY-MM-DD',
  datetimeFormat: process.env.NEXT_PUBLIC_DATETIME_FORMAT || 'YYYY-MM-DD HH:mm:ss',
  defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en',
  supportedLocales: process.env.NEXT_PUBLIC_SUPPORTED_LOCALES?.split(',') || ['en'],
  defaultTheme: process.env.NEXT_PUBLIC_DEFAULT_THEME || 'light',
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  },
}; 