process.env['NODE_CONFIG_DIR'] = __dirname + '/../../configs';

import server from '@/app';
import { quitRedis } from '@/redis';
import { LoginInput, RegisterInput } from '@dtos/auth.dto';
import User from '@models/user.model';
import { closeConnection } from '@utils/mongoose';
import { LOGIN } from '@__tests__/utils/graphql/auth.graphql';
import { hash } from 'bcryptjs';
import { DocumentNode, graphql } from 'graphql';
import { t } from 'i18next';
import { connection } from 'mongoose';

const clearCollections = async () => {
  const collections = connection.collections;

  await Promise.all(
    Object.values(collections).map(async collection => {
      await collection.deleteMany({});
    }),
  );
};

const getGqlString = (doc: DocumentNode) => {
  return doc.loc && doc.loc.source.body;
};

const graphqlTestCall = async (query: DocumentNode, variables?: any, token?: string) => {
  return graphql(
    server.schema,
    getGqlString(query),
    undefined,
    {
      req: {
        headers: {
          authorization: `Bearer ${token}`,
        },
        t,
      },
    },
    variables,
  );
};

const logTestUserIn = async (loginInput: LoginInput) => {
  const response = await graphqlTestCall(LOGIN, { loginInput });
  return response.data.login.response.accessToken;
};

const registerTestUser = async (initialUser: Omit<RegisterInput, 'password'>, password: string, confirmed = true) => {
  const user = {
    ...initialUser,
    password: await hash(password, 12),
    confirmed,
  };
  const newUser = new User(user);
  await newUser.save();

  return newUser;
};

const teardown = async function () {
  await quitRedis();
  await clearCollections();
  await closeConnection();
};

export { clearCollections, getGqlString, graphqlTestCall, logTestUserIn, registerTestUser, teardown };
