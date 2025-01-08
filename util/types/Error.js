import { ResponseMessage } from "./ResponseMessage.js";

/**
 * @class BaseError
 * @abstract
 */
export class BaseError extends Error {
  /** @type {number} */
  statusCode;

  /** @type {string} */
  customMessage;

  /** @type {string} */
  message;

  /**
   * @constructor
   * @param {{message?: string, customMessage?: string, statusCode?: number}} params
   */
  constructor({ message, customMessage, statusCode }) {
    super(message || 'fail');
    this.statusCode = statusCode || 500;
    this.message = message || 'fail';
    this.customMessage = customMessage || '';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends BaseError {
  /**
   * @constructor
   * @param {{message?: string, customMessage?: string}} params
   */
  constructor({ message, customMessage } = {}) {
    super({
      message: message || ResponseMessage.noData,
      statusCode: 404,
      customMessage
    });
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends BaseError {
  /** @type {any} */
  data;

  /**
   * @constructor
   * @param {{message?: string, customMessage?: string, data?: any}} params
   */
  constructor({ message, customMessage, data } = {}) {
    super({
      message: message || ResponseMessage.badRequest,
      statusCode: 400,
      customMessage
    });
    this.name = 'ValidationError';
    this.data = data;
  }
}

export class ConflictError extends BaseError {
  /**
   * @constructor
   * @param {{message?: string, customMessage?: string}} params
   */
  constructor({ message, customMessage } = {}) {
    super({
      message: message || ResponseMessage.conflict,
      statusCode: 409,
      customMessage
    });
    this.name = 'ConflictError';
  }
}

export class GeneralError extends BaseError {
  /**
   * @constructor
   * @param {{statusCode?: number, message?: string, customMessage?: string}} params
   */
  constructor({ statusCode, message, customMessage } = {}) {
    super({
      message: message || ResponseMessage.fail,
      statusCode: statusCode || 500,
      customMessage
    });
    this.name = 'GeneralError';
  }
}

export class BadRequestError extends BaseError {
  /**
   * @constructor
   * @param {{message?: string, customMessage?: string}} params
   */
  constructor({ message, customMessage } = {}) {
    super({
      message: message || ResponseMessage.badRequest,
      statusCode: 400,
      customMessage
    });
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends BaseError {
  /**
   * @constructor
   * @param {{message?: string, customMessage?: string}} params
   */
  constructor({ message, customMessage } = {}) {
    super({
      message: message || ResponseMessage.unauthorized,
      statusCode: 401,
      customMessage
    });
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends BaseError {
  /**
   * @constructor
   * @param {{message?: string, customMessage?: string}} params
   */
  constructor({ message, customMessage } = {}) {
    super({
      message: message || ResponseMessage.forbidden,
      statusCode: 403,
      customMessage
    });
    this.name = 'ForbiddenError';
  }
}

export class InternalServerError extends BaseError {
  /**
   * @constructor
   * @param {{message?: string, customMessage?: string}} params
   */
  constructor({ message, customMessage } = {}) {
    super({ message: message || ResponseMessage.internalServerError, statusCode: 500, customMessage });
    this.name = 'InternalServerError';
  }
} 