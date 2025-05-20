import { Response } from 'express';

export interface IApiResponse {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: any;
  send(res: Response): void;
}

export interface ISuccessResponse extends IApiResponse {
  data?: any;
}

export interface IErrorResponse extends IApiResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}