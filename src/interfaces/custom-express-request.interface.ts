import { Request } from 'express';

interface CustomExpressRequest extends Request {
  isAuthenticated: Boolean;
  userId: String;
}

export default CustomExpressRequest;
