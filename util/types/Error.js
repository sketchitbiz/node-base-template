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

  /** @type {ResponseMessage} */
  message;

  constructor({ message, customMessage, statusCode }) {
    super(message);
    this.statusCode = statusCode;
    this.message = message ?? 'fail';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends BaseError {

  /**
   * @constructor
   * @param {ResponseMessage} message
   * @param {string} customMessage
   */
  constructor({ message, customMessage }) {
    super({ message : message ?? ResponseMessage.noData, statusCode : 404 });
    this.name = 'NotFoundError';
    this.customMessage = customMessage;
  }
}

export class ValidationError extends BaseError {

  /**
   * @template T
   * @constructor
   * @param {ResponseMessage}message
   * @param customMessage
   * @param {T | null}data
   */
  constructor({ message, customMessage, data }) {
    super({ message, statusCode : 400 });
    this.name = 'ValidationError';
    this.data = data;
    this.customMessage = customMessage;
  }
}

export class ConflictError extends BaseError {

  /**
   * @constructor
   * @param {ResponseMessage} message
   * @param {string} customMessage
   */
  constructor({ message, customMessage }) {
    super({ message : message ?? ResponseMessage.conflict, statusCode : 409 });
    this.name = 'ConflictError';
    this.customMessage = customMessage;
  }
}

export class GeneralError extends BaseError {

  /**
   * @constructor
   * @param {number} statusCode
   * @param {ResponseMessage} message
   * @param {string} customMessage
   */
  constructor({ statusCode, message, customMessage }) {
    super({ message : message ?? ResponseMessage.fail, statusCode : statusCode ?? 500 });
    this.name = 'GeneralError';
    this.customMessage = customMessage;
  }
}

export class BadRequestError extends BaseError {

  /**
   * @constructor
   * @param {ResponseMessage} message
   * @param {string} customMessage
   */
  constructor({ message, customMessage }) {
    super({ message : message ?? ResponseMessage.badRequest, statusCode : 400 });
    this.name = 'BadRequestError';
    this.customMessage = customMessage;
  }
}

export class UnauthorizedError extends BaseError {

  /**
   * @constructor
   * @param {ResponseMessage} message
   * @param {string} customMessage
   */
  constructor({ message, customMessage }) {
    super({ message : message ?? ResponseMessage.unauthorized, statusCode : 401 });
    this.name = 'UnauthorizedError';
    this.customMessage = customMessage;
  }
}

export class ForbiddenError extends BaseError {
  constructor({ message, customMessage }) {
    super({ message : message ?? ResponseMessage.forbidden, statusCode : 403 });
    this.name = 'ForbiddenError';
    this.customMessage = customMessage;
  }
}