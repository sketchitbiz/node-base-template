import { ResponseMessage } from "./ResponseMessage.js"

/**
 * @class BaseError
 * @abstract
 * Base error class that all other error classes extend from
 * Provides common error properties and functionality
 */
export class BaseError extends Error {
  /** @type {number} HTTP status code for the error */
  statusCode

  /** @type {string} Custom message for the error */
  customMessage

  /** @type {string} Default error message */
  message

  /**
   * @constructor
   * @param {{message?: string, customMessage?: string, statusCode?: number}} params
   */
  constructor({ message, customMessage, statusCode }) {
    super(message || 'fail')
    this.statusCode = statusCode || 500
    this.message = message || 'fail'
    this.customMessage = customMessage || ''
    Error.captureStackTrace(this, this.constructor)
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
  constructor({ message, customMessage } = {}) {
    super({
      message: message || ResponseMessage.noData,
      statusCode: 404,
      customMessage
    })
    this.name = 'NotFoundError'
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
  constructor({ message, customMessage, data } = {}) {
    super({
      message: message || ResponseMessage.badRequest,
      statusCode: 400,
      customMessage
    })
    this.name = 'ValidationError'
    this.data = data
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
  constructor({ message, customMessage } = {}) {
    super({
      message: message || ResponseMessage.conflict,
      statusCode: 409,
      customMessage
    })
    this.name = 'ConflictError'
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
  constructor({ statusCode, message, customMessage } = {}) {
    super({
      message: message || ResponseMessage.fail,
      statusCode: statusCode || 500,
      customMessage
    })
    this.name = 'GeneralError'
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
  constructor({ message, customMessage } = {}) {
    super({
      message: message || ResponseMessage.badRequest,
      statusCode: 400,
      customMessage
    })
    this.name = 'BadRequestError'
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
  constructor({ message, customMessage } = {}) {
    super({
      message: message || ResponseMessage.unauthorized,
      statusCode: 401,
      customMessage
    })
    this.name = 'UnauthorizedError'
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
  constructor({ message, customMessage } = {}) {
    super({
      message: message || ResponseMessage.forbidden,
      statusCode: 403,
      customMessage
    })
    this.name = 'ForbiddenError'
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
  constructor({ message, customMessage } = {}) {
    super({ message: message || ResponseMessage.internalServerError, statusCode: 500, customMessage })
    this.name = 'InternalServerError'
  }
} 