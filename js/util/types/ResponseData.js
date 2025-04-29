import pg from "pg"

import { Metadata } from "./Common.js"
import { BadRequestError, BaseError, ConflictError, ValidationError } from "./Error.js"
import { ResponseMessage } from "./ResponseMessage.js"
const { DatabaseError } = pg

/**
 * Response Data Module
 * 
 * This module provides a standardized way to format API responses across the application.
 * It handles both successful responses and various error scenarios, ensuring consistent
 * response structure throughout the API.
 * 
 * The ResponseData class supports:
 * - Single item or array responses
 * - Error handling with appropriate status codes
 * - Metadata for pagination or additional information
 * - Convenience methods for common response types
 * 
 * Usage Examples:
 * ```javascript
 * // Success response with data
 * const users = await userService.getAll();
 * return ResponseData.data(users, paginationMetadata);
 * 
 * // No data found response
 * if (!user) {
 *   return ResponseData.noData();
 * }
 * 
 * // Error response
 * try {
 *   // Some operation
 * } catch (error) {
 *   return ResponseData.fromError(error);
 * }
 * 
 * // Bad request response
 * return ResponseData.badRequest({ 
 *   message: 'Invalid input', 
 *   customMessage: 'Please check your input data' 
 * });
 * ```
 * 
 * @template T The type of data contained in the response
 */
export class ResponseData {

  /** @type {T | T[] | null} Response data, can be single item or array */
  data

  /** @type {Error| null} Error information if the response contains an error */
  error

  /** @type {string | ResponseMessage} Response message indicating the status */
  message

  /** @type {Metadata | null} Additional metadata about the response */
  metadata

  /** @type {number} HTTP status code of the response */
  statusCode

  /**
   * Creates a new ResponseData instance
   * @param {Partial<ResponseData<T>>} params
   * @throws {ValidationError} If required fields are missing
   */
  constructor(params) {

    if (!params.statusCode || !params.message) {
      throw new ValidationError({ customMessage: 'statusCode, message는 필수입니다.' })
    }

    this.statusCode = params.statusCode
    this.message = params.message
    this.metadata = params.metadata ?? null

    if (Array.isArray(params.data)) {
      this.data = params.data
    } else if (params.data === null || params.data === undefined) {
      this.data = null
    } else {
      this.data = [params.data]
    }

    this.error = params.error ?? null
  }

  /**
   * Creates a bad request response
   * @param {{message: string, customMessage?: string}} params Error message parameters
   * @returns {ResponseData} Response with status code 400
   */
  static badRequest({ customMessage, message }) {
    return ResponseData.fromError(new BadRequestError({ customMessage, message }))
  }

  /**
   * Creates a conflict response
   * @param {{message: string, customMessage?: string}} params Error message parameters
   * @returns {ResponseData} Response with status code 409
   */
  static conflict({ customMessage, message }) {
    return ResponseData.fromError(new ConflictError({ customMessage, message }))
  }

  /**
   * Creates a successful response with data
   * @template T
   * @param {T} data The data to be included in the response
   * @param {Metadata|null} metadata Optional metadata about the response
   * @returns {ResponseData<T>} Response with status code 200 and the provided data
   */
  static data(data, metadata = null) {
    return new ResponseData({ data, error: null, message: 'success', metadata, statusCode: 200 })
  }

  /**
   * Creates a response from an error object
   * Handles different types of errors (BaseError, Error, or unknown)
   * @param {BaseError | Error} error The error to convert into a response
   * @returns {ResponseData} Response containing the error information
   */
  static fromError(error) {

    if (error instanceof BaseError) {
      return new ResponseData({
        error: {
          message: error.customMessage ?? error.message,
          name: error.name,
          stack: error.stack
        },
        message: error.message ?? 'fail',
        statusCode: error.statusCode ?? 500
      })
    } else if (error instanceof Error) {
      return new ResponseData({
        data: null,
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack
        },
        message: error.message,
        statusCode: 500
      })
    } else {
      return new ResponseData({
        data: null,
        error,
        message: 'fail',
        statusCode: 500
      })
    }
  }

  /**
   * Creates a response indicating no data was found
   * @param {string|ResponseMessage} message Custom message for no data response
   * @returns {ResponseData} Response with status code 404
   */
  static noData(message = ResponseMessage.noData) {
    return new ResponseData({ data: null, error: null, message: message ?? 'no data', metadata: null, statusCode: 404 })
  }

  /**
   * Creates a successful response with no data
   * @returns {ResponseData} Response with status code 200 and 'success' message
   */
  static success() {
    return new ResponseData({ data: null, error: null, message: 'success', metadata: null, statusCode: 200 })
  }
}