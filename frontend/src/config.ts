// API URL configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Authentication configuration
export const AUTH_TOKEN_KEY = 'auth_token';
export const AUTH_USER_KEY = 'auth_user';
export const AUTH_REFRESH_TOKEN_KEY = 'auth_refresh_token';

// Feature flags
export const FEATURES = {
  ENABLE_AI_SUGGESTIONS: process.env.REACT_APP_ENABLE_AI_SUGGESTIONS === 'true',
  ENABLE_ADVANCED_ANALYTICS: process.env.REACT_APP_ENABLE_ADVANCED_ANALYTICS === 'true',
  ENABLE_RBAC: process.env.REACT_APP_ENABLE_RBAC === 'true' || true, // Enabled by default
  ENABLE_COMPLIANCE: process.env.REACT_APP_ENABLE_COMPLIANCE === 'true' || true, // Enabled by default
};

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_SIZES = [5, 10, 25, 50, 100];

// Date format settings
export const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd';
export const DEFAULT_DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

// Theme settings
export const THEME = {
  PRIMARY_COLOR: process.env.REACT_APP_PRIMARY_COLOR || '#1976d2',
  SECONDARY_COLOR: process.env.REACT_APP_SECONDARY_COLOR || '#dc004e',
  DARK_MODE: process.env.REACT_APP_DARK_MODE === 'true',
}; 