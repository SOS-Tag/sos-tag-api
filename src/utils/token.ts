import { ContextPayload } from '@interfaces/context.interface';
import tokenConfig from '@interfaces/token.interface';
import userModel, { IUser } from '@models/user.model';
import config from 'config';
import 'dotenv/config';
import { Request, Response } from 'express';
import { sign, verify } from 'jsonwebtoken';

const { duration: accessTokenDuration }: tokenConfig = config.get('accessToken');
const { duration: refreshTokenDuration }: tokenConfig = config.get('refreshToken');

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

const createAccessToken = (user: IUser) => {
  return sign(
    {
      userId: user.id,
    },
    accessTokenSecret,
    {
      expiresIn: `${accessTokenDuration}m`, // What access token duration do we want? Do we want differences between dev, prod and test mode?
    },
  );
};

const createRefreshToken = (user: IUser) => {
  return sign(
    {
      userId: user.id,
      tokenVersion: user.tokenVersion,
    },
    refreshTokenSecret,
    {
      expiresIn: `${refreshTokenDuration}d`, // What refresh token duration do we want? Do we want differences between dev, prod and test mode?
    },
  );
};

const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.jid;
  if (!token) {
    return res.send({ ok: false, accessToken: '' });
  }

  let payload: ContextPayload = null;
  try {
    payload = verify(token, refreshTokenSecret);
  } catch (err) {
    return res.send({ ok: false, accessToken: '' });
  }

  // Refresh token is valid and we can send back an access token
  const user: IUser = await userModel.findOne({ _id: payload.userId });

  if (!user) {
    return res.send({ ok: false, accessToken: '' });
  }

  if (user.tokenVersion !== payload.tokenVersion) {
    return res.send({ ok: false, accessToken: '' });
  }

  sendRefreshToken(res, createRefreshToken(user));
  return res.send({ ok: true, accessToken: createAccessToken(user) });
};

const sendRefreshToken = (res: Response, token: string) => {
  res.cookie('jid', token, {
    httpOnly: true,
    path: '/refresh_token',
  });
};

export { createAccessToken, createRefreshToken, refreshToken, sendRefreshToken };
