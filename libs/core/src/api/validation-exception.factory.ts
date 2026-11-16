import type { ValidationError } from 'class-validator';

import { AppError, ErrorCode } from '../errors/index.js';

type ValidationErrors = { [property: string]: string[] | { constraints: string[]; children: ValidationErrors } };

function formatErrors(errors: ValidationError[]): ValidationErrors {
  const formatted: ValidationErrors = {};
  for (const error of errors) {
    const constraints = Object.values(error.constraints ?? {});
    Object.defineProperty(formatted, error.property, {
      enumerable: true,
      configurable: true,
      writable: true,
      value: error.children?.length ? { constraints, children: formatErrors(error.children) } : constraints,
    });
  }
  return formatted;
}

export function validationExceptionFactory(errors: ValidationError[]): AppError {
  return new AppError(ErrorCode.VALIDATION, { error: formatErrors(errors) });
}
