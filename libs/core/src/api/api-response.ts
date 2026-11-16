import type { HttpStatus } from '@nestjs/common';

import type { IResponseOptions } from './types.js';

export class ApiResponse<T = unknown> {
  readonly data?: T;
  readonly list?: T[];
  readonly status?: HttpStatus;
  readonly cookies: NonNullable<IResponseOptions['cookies']>;
  readonly headers: NonNullable<IResponseOptions['headers']>;
  readonly pagination?: IResponseOptions['pagination'];
  readonly meta?: IResponseOptions['meta'];

  constructor(payload: { data?: T; list?: T[] }, options: IResponseOptions = {}) {
    this.data = payload.data;
    this.list = payload.list;
    this.status = options.status;
    this.cookies = options.cookies ?? [];
    this.headers = options.headers ?? {};
    this.pagination = options.pagination;
    this.meta = options.meta;
  }
}
