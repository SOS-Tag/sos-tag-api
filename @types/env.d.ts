declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    DB_PASSWORD: string;
    SMTP_SERVICE: string;
    GOOGLE_OAUTH_CLIENT_USER: string;
    GOOGLE_OAUTH_CLIENT_ID: string;
    GOOGLE_OAUTH_CLIENT_SECRET: string;
    GOOGLE_OAUTH_CLIENT_REFRESH_TOKEN: string;
    FIREBASE_PROJECT_ID: string;
    FIREBASE_PRIVATE_KEY_ID: string;
    FIREBASE_PRIVATE_KEY: string;
    FIREBASE_CLIENT_EMAIL: string;
    FIREBASE_CLIENT_ID: string;
    FIREBASE_AUTH_URI: string;
    FIREBASE_TOKEN_URI: string;
    FIREBASE_AUTH_CERT_URL: string;
    FIREBASE_CLIENT_CERT_URL: string;
  }
}
