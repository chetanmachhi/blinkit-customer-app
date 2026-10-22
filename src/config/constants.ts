export const APP_CONFIG = {
  APP_NAME: "InstantMart",
  APP_VERSION: "1.0.0",
  OTP_LENGTH: 6,
  OTP_RESEND_SECONDS: 30,
  SEARCH_DEBOUNCE_MS: 400,
  POLLING_INTERVAL_MS: 10000,
  DEFAULT_LATITUDE: 12.9716,
  DEFAULT_LONGITUDE: 77.5946,
  DEFAULT_CITY: "Bengaluru",
  MAX_RECENT_SEARCHES: 8,
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "@auth_access_token",
  REFRESH_TOKEN: "@auth_refresh_token",
  USER: "@auth_user",
  ACTIVE_STORE: "@active_store",
  COORDINATES: "@user_coordinates",
  SELECTED_ADDRESS: "@selected_address",
  RECENT_SEARCHES: "@recent_searches",
};
