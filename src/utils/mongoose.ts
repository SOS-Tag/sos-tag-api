import { __dev__, __test__ } from '@constants/env';
import dbConnection from '@databases';
import { connect, ConnectOptions, disconnect, set } from 'mongoose';
import { logger } from './logger';

const clearConnection = async () => {
  try {
    await disconnect();
  } catch (error) {
    !__test__ && logger.error(`[mongoose:disconnect] ${error.message}.`);
    throw error;
  }

  !__test__ && logger.info('[mongoose:disconnect] The connection with the database has been closed successfully.');
};

const createConnection = async () => {
  set('debug', __dev__);

  try {
    await connect(dbConnection.url, dbConnection.options as ConnectOptions);
  } catch (error) {
    !__test__ && logger.error(`[mongoose:connect] ${error.message}.`);
    throw error;
  }

  !__test__ && logger.info('[mongoose:connect] The connection with the database has been established successfully.');
};

export { clearConnection, createConnection };
