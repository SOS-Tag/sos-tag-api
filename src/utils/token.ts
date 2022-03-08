import redis from '@/redis';
import { confirmUserPrefix, forgotPasswordPrefix } from '@constants/redis-prefixes';
import { oneDay } from '@constants/time';
import { ContextPayload } from '@interfaces/context.interface';
import tokenConfig from '@interfaces/token.interface';
import userModel, { IUser } from '@models/user.model';
import config from 'config';
import 'dotenv/config';
import { Request, Response } from 'express';
import { sign, verify } from 'jsonwebtoken';
import { nanoid } from 'nanoid';

const { duration: accessTokenDuration }: tokenConfig = config.get('accessToken');
const { duration: refreshTokenDuration }: tokenConfig = config.get('refreshToken');

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

const createAccessToken = (user: IUser) => {
  return sign(
    {
      userId: user.id,
      roles: user.roles,
    },
    accessTokenSecret,
    {
      expiresIn: `${accessTokenDuration}m`,
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
      expiresIn: `${refreshTokenDuration}d`,
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

const setConfirmationToken = async (userId: string, token = nanoid()) => {
  await redis.set(confirmUserPrefix + token, userId, 'ex', oneDay);
  return token;
};

const setForgotPasswordToken = async (userId: string, token = nanoid()) => {
  await redis.set(forgotPasswordPrefix + token, userId, 'ex', oneDay);
  return token;
};

export { createAccessToken, createRefreshToken, refreshToken, sendRefreshToken, setConfirmationToken, setForgotPasswordToken };
