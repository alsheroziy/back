export class BaseError extends Error {
  status: number;
  errors: any[];
  name: string;
  statusCode: number;

  constructor(
    status: number,
    message: string,
    errors: any[] = [],
    name?: string,
    statusCode?: number,
  ) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = name || 'BaseError';
    this.statusCode = statusCode || status;
    Object.setPrototypeOf(this, BaseError.prototype);
  }

  static BadRequest(message: string, errors: any[] = []): BaseError {
    return new BaseError(400, message, errors, 'BadRequestError', 400);
  }

  static Unauthorized(): BaseError {
    return new BaseError(401, 'Unauthorized', [], 'UnauthorizedError', 401);
  }
}
