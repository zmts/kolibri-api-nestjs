import { HttpException } from '@nestjs/common';

export enum ErrorCode {
  SERVER = 'SERVER',
  BAD_REQUEST = 'BAD_REQUEST',
  VALIDATION = 'VALIDATION',
  UNAUTHORIZED = 'UNAUTHORIZED',
  ACCESS = 'ACCESS',
  NOT_FOUND = 'NOT_FOUND',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
  CONFLICT = 'DUPLICATE_CONFLICT',
}

interface IErrorDetails {
  status: number;
  description: string;
}

const errorList: Record<ErrorCode, IErrorDetails> = {
  [ErrorCode.SERVER]: { status: 500, description: 'Server error occurred' },
  [ErrorCode.BAD_REQUEST]: { status: 400, description: 'Bad request' },
  [ErrorCode.VALIDATION]: { status: 400, description: 'Validation error, invalid request' },
  [ErrorCode.UNAUTHORIZED]: { status: 401, description: 'Authentication required' },
  [ErrorCode.ACCESS]: { status: 403, description: 'Access denied' },
  [ErrorCode.NOT_FOUND]: { status: 404, description: 'Empty response, not found' },
  [ErrorCode.UNPROCESSABLE_ENTITY]: { status: 422, description: 'Unprocessable entity' },
  [ErrorCode.CONFLICT]: {
    status: 409,
    description: 'Duplicate conflict. Resource already exists. Try to use another one',
  },
};

interface IAppErrorOptions {
  message?: string;
  error?: any;
  meta?: any;
  layer?: string;
  origin?: Error | AppError;
  entity?: string;
}

export class AppError extends HttpException {
  public readonly error: any;
  public readonly description: string;
  public readonly code: string;
  public readonly layer?: string;
  public readonly meta?: any;
  public readonly entity?: string;

  constructor(
    public readonly errorCode: ErrorCode,
    options: IAppErrorOptions = {},
  ) {
    const errorConfig = errorList[errorCode];

    super(options.message || errorConfig.description, errorConfig.status || 500);

    this.error = options.error;
    this.description = errorConfig.description;
    this.code = `${errorCode}_ERROR`;
    this.layer = options.layer;
    this.meta = options.meta;
    this.entity = options.entity;
  }
}
