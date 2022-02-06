import { ExpressContext } from 'apollo-server-express';
import { Request, Response } from 'express';

interface ContextPayload {
  userId: string;
}

interface Context extends ExpressContext {
  req: Request;
  res: Response;
  payload?: ContextPayload;
}

export { ContextPayload };
export default Context;
