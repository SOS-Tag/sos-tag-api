process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

import 'reflect-metadata';

import { NodeEnvironment, __prod__ } from '@constants/env';
import Context from '@interfaces/context.interface';
import AuthResolver from '@resolvers/auth.resolver';
import QRCodeResolver from '@resolvers/qrcode.resolver';
import SheetResolver from '@resolvers/sheet.resolver';
import UserResolver from '@resolvers/user.resolver';
import { logger, stream } from '@utils/logger';
import { createConnection } from '@utils/mongoose';
import { googleOauthHandler } from '@utils/oauth';
import { refreshToken } from '@utils/token';
import { ApolloServer, ExpressContext } from 'apollo-server-express';
import compression from 'compression';
import config from 'config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv-safe/config';
import express, { Application } from 'express';
import { GraphQLError, GraphQLSchema } from 'graphql';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { buildSchema } from 'type-graphql';
import { Container } from 'typedi';
import { generateExtendedApolloError } from '@utils/apollo-error';

class Server {
  public express: Application;
  public apollo: ApolloServer<ExpressContext>;
  public port: string | number;
  public env: string;
  public schema: GraphQLSchema;

  constructor() {
    this.express = express();

    this.port = process.env.PORT || 8080;
    this.env = process.env.NODE_ENV || NodeEnvironment.development;

    this.initialize();
  }

  private async initialize() {
    this.express.set('proxy', 1);

    await this.connectToDatabase();
    await this.buildGraphQLSchema();
    this.initializeMiddlewares();
    this.initializeRoutes();
    await this.initializeApolloServer();
  }

  private async buildGraphQLSchema() {
    this.schema = await buildSchema({
      resolvers: [AuthResolver, QRCodeResolver, SheetResolver, UserResolver],
      emitSchemaFile: true,
      nullableByDefault: true,
      container: Container,
    });
  }

  private async connectToDatabase() {
    await createConnection();
  }

  public get() {
    return this.express;
  }

  private async initializeApolloServer() {
    this.apollo = new ApolloServer({
      schema: this.schema,
      context: ({ req, res }) => ({ req, res } as Context),
      formatError: (error: GraphQLError) => {
        return generateExtendedApolloError(error);
      },
    });

    await this.apollo.start();

    this.apollo.applyMiddleware({ app: this.express, cors: false });
  }

  private initializeMiddlewares() {
    __prod__ && this.express.use(morgan(config.get('log.format'), { stream }));
    this.express.use(cors({ origin: config.get('cors.origin'), credentials: config.get('cors.credentials') }));
    this.express.use(cookieParser());
    this.express.use(hpp());
    this.express.use(helmet({ contentSecurityPolicy: __prod__ ? undefined : false }));
    this.express.use(compression());
  }

  private initializeRoutes() {
    this.express.get('/', (_, res) => res.send(`SOS-Tag API (alpha version)`));
    this.express.post('/refresh_token', (req, res) => refreshToken(req, res));
    this.express.get('/oauth/google', (req, res) => googleOauthHandler(req, res));
  }

  public listen() {
    return this.express.listen(typeof this.port === 'string' ? parseInt(this.port) : this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} ========`);
      logger.info(`  App listening on port ${this.port}  `);
      logger.info(`=================================`);
    });
  }
}

export default Server;
