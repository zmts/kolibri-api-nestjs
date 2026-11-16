import type { HttpStatus } from '@nestjs/common';

import type { Cookie } from './cookie';

export interface IResponseOptions {
  status?: HttpStatus;
  headers?: Record<string, string>;
  cookies?: Cookie[];
  pagination?: IPaginationResponse;
  meta?: unknown;
}

export interface IPaginationResponse {
  limit: number;
  total: number;
}
