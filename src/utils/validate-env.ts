import { cleanEnv, port, str, url } from 'envalid';

const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),
    DB_PASSWORD: str(),
    ACCESS_TOKEN_SECRET: str(),
    REFRESH_TOKEN_SECRET: str(),
    SMTP_SERVICE: str(),
    GOOGLE_CLIENT_USER: str(),
    GOOGLE_CLIENT_ID: str(),
    GOOGLE_CLIENT_SECRET: str(),
    GOOGLE_CLIENT_REFRESH_TOKEN: str(),
    GOOGLE_OAUTH_CLIENT_SECRET: str(),
    GOOGLE_OAUTH_CLIENT_ID: str(),
    GOOGLE_OAUTH_REDIRECT_URL: url(),
    WEB_APP_GOOGLE_AUTH_URL: url(),
  });
};

export default validateEnv;
