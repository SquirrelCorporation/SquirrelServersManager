import { Response } from 'express';
import { IApiResponse, IErrorResponse, ISuccessResponse } from '../interfaces/api-response.interface';

export class ApiResponse implements IApiResponse {
  public success: boolean;
  public statusCode: number;
  public message?: string;
  public data?: any;

  constructor(success: boolean, statusCode: number, message?: string, data?: any) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  public send(res: Response): void {
    res.status(this.statusCode).json(this);
  }
}

export class SuccessResponse extends ApiResponse implements ISuccessResponse {
  constructor(data: any, message?: string, statusCode = 200) {
    super(true, statusCode, message, data);
  }
}

export class ErrorResponse extends ApiResponse implements IErrorResponse {
  public error: {
    code: string;
    message: string;
    details?: any;
  };

  constructor(code: string, message: string, statusCode = 400, details?: any) {
    super(false, statusCode, message);
    this.error = {
      code,
      message,
      details,
    };
  }
}