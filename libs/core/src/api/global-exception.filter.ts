import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { APP_FILTER, HttpAdapterHost } from '@nestjs/core';
import type { Request } from 'express';

import { ApiResponseError, AppError } from '../errors/index';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const path = request.originalUrl.split('?')[0];
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const responseError = new ApiResponseError({
      timestamp: new Date().toISOString(),
      path,
      status,
      message: exception instanceof HttpException ? exception.message : 'Internal server error',
      ...(exception instanceof AppError && {
        code: exception.code,
        entity: exception.entity,
        ...(exception.description !== exception.message && { description: exception.description }),
        meta: exception.meta,
        error: exception.error,
      }),
    });
    if (status >= 500) {
      this.logger.error(`${request.method} ${path}`, exception instanceof Error ? exception.stack : undefined);
    }
    httpAdapter.reply(ctx.getResponse(), responseError, status);
  }
}

export const GlobalExceptionProvider = {
  provide: APP_FILTER,
  useClass: GlobalExceptionFilter,
};
