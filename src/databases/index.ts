import dbConfig from '@interfaces/db.interface';
import config from 'config';
import { __test__ } from '../constants/env';
if (!__test__) require('dotenv-safe/config');

const { user, database }: dbConfig = config.get('dbConfig');
const password = process.env.DB_PASSWORD;

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const dbConnection = {
  url: `mongodb+srv://${user}:${password}@cluster0.y7t9g.mongodb.net/${database}?retryWrites=true&w=majority`,
  options: mongooseOptions,
};

export default dbConnection;
