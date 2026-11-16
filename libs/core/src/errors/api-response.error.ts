export interface ApiResponseErrorOptions<E = unknown> {
  timestamp: string;
  path: string;
  status: number;
  message: string;
  code?: string;
  entity?: string;
  description?: string;
  meta?: unknown;
  error?: E;
}

export class ApiResponseError<E = unknown> {
  readonly timestamp: string;
  readonly path: string;
  readonly status: number;
  readonly message: string;
  readonly code?: string;
  readonly entity?: string;
  readonly description?: string;
  readonly meta?: unknown;
  readonly error?: E;

  constructor(options: ApiResponseErrorOptions<E>) {
    this.timestamp = options.timestamp;
    this.path = options.path;
    this.status = options.status;
    this.message = options.message;
    this.code = options.code;
    this.entity = options.entity;
    this.description = options.description;
    this.meta = options.meta;
    this.error = options.error;
  }
}
