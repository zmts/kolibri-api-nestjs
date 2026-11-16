import { Injectable } from '@nestjs/common';
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import type { Response } from 'express';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';

import { ApiResponse } from './api-response.js';
import type { IPaginationResponse } from './types.js';

interface IApiResponse {
  status: number;
  data?: unknown;
  list?: unknown[];
  pagination?: IPaginationResponse;
  meta?: unknown;
}

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor<unknown, IApiResponse | undefined> {
  intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<IApiResponse | undefined> {
    return next.handle().pipe(map(payload => this.transform(context.switchToHttp().getResponse<Response>(), payload)));
  }

  private transform(response: Response, payload: unknown): IApiResponse | undefined {
    if (payload == null) return undefined;
    if (!(payload instanceof ApiResponse)) {
      throw new Error('Expected an ApiResponse instance');
    }
    const apiResponse = payload;
    for (const cookie of apiResponse.cookies) {
      response.cookie(cookie.name, cookie.value, cookie.options);
    }
    for (const [key, value] of Object.entries(apiResponse.headers)) {
      response.header(key, value);
    }
    if (apiResponse.status !== undefined) response.status(apiResponse.status);
    return {
      status: apiResponse.status ?? response.statusCode,
      data: apiResponse.data,
      list: apiResponse.list,
      pagination: apiResponse.pagination,
      meta: apiResponse.meta,
    };
  }
}
