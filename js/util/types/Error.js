import { ResponseMessage } from "./ResponseMessage.js"

/**
 * @class BaseError
 * @abstract
 * Base error class that all other error classes extend from
 * Provides common error properties and functionality
 */
export class BaseError extends Error {
  /** @type {string} Custom message for the error */
  customMessage

  /** @type {string} Default error message */
  message

  /** @type {number} HTTP status code for the error */
  statusCode

  /**
   * @constructor
   * @param {{message?: string, customMessage?: string, statusCode?: number}} params
   */
  constructor({ customMessage, message, statusCode }) {
    super(message || 'fail')
    this.statusCode = statusCode || 500
    this.message = message || 'fail'
    this.customMessage = customMessage || ''
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Error class for handling 400 Bad Request errors
 * Used for malformed requests or invalid parameters
 */
export class BadRequestError extends BaseError {
  /**
   * @constructor
   * @param {{message?: string, customMessage?: string}} params
   */
  constructor({ customMessage, message } = {}) {
    super({
      customMessage,
      message: message || ResponseMessage.badRequest,
      statusCode: 400
    })
    this.name = 'BadRequestError'
  }
}

/**
 * Error class for handling 409 Conflict errors
 * Used when there is a conflict with the current state of the resource
 */
export class ConflictError extends BaseError {
  /**
   * @constructor
   * @param {{message?: string, customMessage?: string}} params
   */
  constructor({ customMessage, message } = {}) {
    super({
      customMessage,
      message: message || ResponseMessage.conflict,
      statusCode: 409
    })
    this.name = 'ConflictError'
  }
}

/**
 * Error class for handling 403 Forbidden errors
 * Used when user is authenticated but lacks required permissions
 */
export class ForbiddenError extends BaseError {
  /**
   * @constructor
   * @param {{message?: string, customMessage?: string}} params
   */
  constructor({ customMessage, message } = {}) {
    super({
      customMessage,
      message: message || ResponseMessage.forbidden,
      statusCode: 403
    })
    this.name = 'ForbiddenError'
  }
}

/**
 * Error class for handling general server errors
 * Used for unexpected server-side errors
 */
export class GeneralError extends BaseError {
  /**
   * @constructor
   * @param {{statusCode?: number, message?: string, customMessage?: string}} params
   */
  constructor({ customMessage, message, statusCode } = {}) {
    super({
      customMessage,
      message: message || ResponseMessage.fail,
      statusCode: statusCode || 500
    })
    this.name = 'GeneralError'
  }
}

/**
 * Error class for handling 500 Internal Server errors
 * Used for unexpected server-side errors that cannot be handled more specifically
 */
export class InternalServerError extends BaseError {
  /**
   * @constructor
   * @param {{message?: string, customMessage?: string}} params
   */
  constructor({ customMessage, message } = {}) {
    super({ customMessage, message: message || ResponseMessage.internalServerError, statusCode: 500 })
    this.name = 'InternalServerError'
  }
}

/**
 * Error class for handling 404 Not Found errors
 * Used when requested resource is not found
 */
export class NotFoundError extends BaseError {
  /**
   * @constructor
   * @param {{message?: string, customMessage?: string}} params
   */
  constructor({ customMessage, message } = {}) {
    super({
      customMessage,
      message: message || ResponseMessage.noData,
      statusCode: 404
    })
    this.name = 'NotFoundError'
  }
}

/**
 * Error class for handling 401 Unauthorized errors
 * Used when authentication is required but not provided
 */
export class UnauthorizedError extends BaseError {
  /**
   * @constructor
   * @param {{message?: string, customMessage?: string}} params
   */
  constructor({ customMessage, message } = {}) {
    super({
      customMessage,
      message: message || ResponseMessage.unauthorized,
      statusCode: 401
    })
    this.name = 'UnauthorizedError'
  }
}

/**
 * Error class for handling 400 Bad Request errors
 * Used when data validation fails
 */
export class ValidationError extends BaseError {
  /** @type {any} Additional data related to validation failure */
  data

  /**
   * @constructor
   * @param {{message?: string, customMessage?: string, data?: any}} params
   */
  constructor({ customMessage, data, message } = {}) {
    super({
      customMessage,
      message: message || ResponseMessage.badRequest,
      statusCode: 400
    })
    this.name = 'ValidationError'
    this.data = data
  }
} 