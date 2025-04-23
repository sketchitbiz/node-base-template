import { ResponseMessage } from "./ResponseMessage";

interface BaseErrorParams {
  message?: ResponseMessage;
  statusCode?: number;
  customMessage?: string;
}

/**
 * @class BaseError
 * @abstract
 */
export abstract class BaseError extends Error {
  statusCode: number;

  message: ResponseMessage;

  customMessage: string;

  constructor(params: BaseErrorParams) {
    super(params.message);
    this.statusCode = params.statusCode ?? 500;
    this.message = params.message ?? ResponseMessage.FAIL;
    this.customMessage = params.customMessage ?? '';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends BaseError {
  constructor(params: Omit<BaseErrorParams, 'statusCode'>) {
    super({ message: params.message ?? ResponseMessage.NO_DATA, statusCode: 404, customMessage: params.customMessage });
    this.name = 'NotFoundError';
  }
}

export class ValidationError<T> extends BaseError {
  data: T | null;
  constructor(params: Omit<BaseErrorParams, 'statusCode'> & { data: T | null }) {
    super({ message: params.message ?? ResponseMessage.FAIL, statusCode: 400, customMessage: params.customMessage });
    this.name = 'ValidationError';
    this.data = params.data;
  }
}

export class ConflictError extends BaseError {
  constructor(params: Omit<BaseErrorParams, 'statusCode'>) {
    super({ message: params.message ?? ResponseMessage.CONFLICT, statusCode: 409, customMessage: params.customMessage });
    this.name = 'ConflictError';
  }
}

export class GeneralError extends BaseError {
  constructor(params: BaseErrorParams) {
    super({ message: params.message ?? ResponseMessage.FAIL, statusCode: params.statusCode ?? 500, customMessage: params.customMessage });
    this.name = 'GeneralError';
  }
}

export class BadRequestError extends BaseError {
  constructor(params: Omit<BaseErrorParams, 'statusCode'>) {
    super({ message: params.message ?? ResponseMessage.BAD_REQUEST, statusCode: 400, customMessage: params.customMessage });
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends BaseError {
  constructor(params: Omit<BaseErrorParams, 'statusCode'>) {
    super({ message: params.message ?? ResponseMessage.UNAUTHORIZED, statusCode: 401, customMessage: params.customMessage });
    this.name = 'UnauthorizedError';
  }
}



export class ForbiddenError extends BaseError {
  constructor(params: Omit<BaseErrorParams, 'statusCode'>) {
    super({ message: params.message ?? ResponseMessage.FORBIDDEN, statusCode: 403, customMessage: params.customMessage });
    this.name = 'ForbiddenError';
  }
}
export class IternalServerError extends BaseError {

  constructor(params: Omit<BaseErrorParams, 'statusCode'>) {
    super({ message: params.message ?? ResponseMessage.FAIL, statusCode: 500, customMessage: params.customMessage });
    this.name = 'IternalServerError';
  }
}