import { NextFunction, Request, Response } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export default (execution: AsyncFunction) => (req: Request, res: Response, next: NextFunction) => {
  execution(req, res, next).catch(next);
};
