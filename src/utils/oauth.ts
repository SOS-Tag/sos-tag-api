import { GoogleTokens, GoogleUser } from '@interfaces/oauth.interface';
import axios from 'axios';
import { Request, Response } from 'express';
import qs from 'qs';
import { logger } from './logger';

const getGoogleOAuthTokens = async ({ code }: { code: string }): Promise<GoogleTokens> => {
  const url = 'https://oauth2.googleapis.com/token';

  const values = {
    code,
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID as string,
    client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET as string,
    redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL as string,
    grant_type: 'authorization_code',
  };

  try {
    const res = await axios.post<GoogleTokens>(url, qs.stringify(values), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return res.data;
  } catch (error) {
    logger.error(`[util:oauth:getGoogleOAuthTokens] ${error.message}`);
    throw error;
  }
};

const getGoogleUser = async ({ tokenId, token }): Promise<GoogleUser> => {
  try {
    const res = await axios.get<GoogleUser>(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`, {
      headers: {
        Authorization: `Bearer ${tokenId}`,
      },
    });
    return res.data;
  } catch (error: any) {
    logger.error(`[util:oauth:getGoogleUser] ${error.message}`);
    throw error;
  }
};

const googleOauthHandler = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  try {
    const { id_token, access_token } = await getGoogleOAuthTokens({ code });

    const googleOauthRedirectRoute = `${process.env.WEB_APP_GOOGLE_AUTH_URL}?tokenId=${id_token}&accessToken=${access_token}`;

    // Redirect to the frontend with the token id and the access token as parameters.
    // They will be used as mutation parameters to handle the login with Google using GraphQL.
    res.redirect(googleOauthRedirectRoute);
  } catch (error) {
    logger.error(`[util:oauth:googleOauthHandler] ${error.message}`);
    throw error;
  }
};

export { getGoogleOAuthTokens, getGoogleUser, googleOauthHandler };
