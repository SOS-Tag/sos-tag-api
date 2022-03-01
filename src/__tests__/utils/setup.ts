process.env['NODE_CONFIG_DIR'] = __dirname + '/../../configs';

import { RegisterInput } from '@dtos/auth.dto';
import User from '@models/user.model';
import { clearConnection } from '@utils/mongoose';
import { hash } from 'bcryptjs';
import { DocumentNode, graphql } from 'graphql';
import { t } from 'i18next';
import { connection } from 'mongoose';
import server from '../../app';

const clearCollections = async () => {
  const collections = connection.collections;

  await Promise.all(
    Object.values(collections).map(async collection => {
      await collection.deleteMany({});
    }),
  );
};

const createTestUser = async (initialUser: Omit<RegisterInput, 'password'> & { confirmed: boolean }, password: string) => {
  const user = {
    ...initialUser,
    password: await hash(password, 12),
  };
  const newUser = new User(user);
  await newUser.save();

  return newUser;
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

const teardown = async function () {
  await clearCollections();
  await clearConnection();
};

export { clearCollections, createTestUser, getGqlString, graphqlTestCall, teardown };
