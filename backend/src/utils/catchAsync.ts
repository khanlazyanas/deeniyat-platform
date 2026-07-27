import { Request, Response, NextFunction } from 'express';

// Yeh function kisi bhi async route ko wrap karega aur error aane par crash hone se bachayega
const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default catchAsync;