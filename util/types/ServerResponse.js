import { BadRequestError, BaseError, ConflictError, ValidationError } from "./Error.js";
import pg from "pg";

const { DatabaseError } = pg;

/**
 * @template T
 * @class ServerResponse
 */
export class ServerResponse {

  /** @type {number} */
  statusCode;

  /** @type {string} */
  message;

  /** @type {T | null} */
  data;

  /** @type {any| null} */
  error;

  /**
   *
   * @param {Partial<ServerResponse>} params
   */
  constructor(params) {

    if (!params.statusCode || !params.message) {
      throw new ValidationError({ customMessage : 'statusCode, message는 필수입니다.' });
    }

    this.statusCode = params.statusCode;
    this.message = params.message;

    if (Array.isArray(params.data)) {
      this.data = params.data;
    } else {
      this.data = [params.data] ?? null;
    }

    this.error = params.error ?? null;
  }

  static success() {
    return new ServerResponse({ statusCode : 200, message : 'success', data : null, error : null });
  }

  static noData(message) {
    return new ServerResponse({ statusCode : 404, message : message ?? 'no data', data : null, error : null });
  }

  /**
   *
   * @param {T} data
   * @returns {ServerResponse}
   */
  static data(data) {
    return new ServerResponse({ statusCode : 200, message : 'success', data, error : null });
  }

  /**
   *
   * @param {BaseError} error
   */
  static fromError(error) {

    if (error instanceof DatabaseError) {
      return new ServerResponse({
        statusCode : 500,
        message : 'fail',
        error : {
          name : error.name,
          message : error.message,
          stack : error.stack
        }
      });
    }

    return new ServerResponse({
      statusCode : error.statusCode ?? 500,
      message : error.message ?? 'fail',
      error : {
        name : error.name,
        message : error.customMessage ?? error.message,
        stack : error.stack
      }
    });
  }

  /**
   * @param {string} message
   * @param {string} customMessage
   * @returns {ServerResponse}
   */
  static badRequest({ message, customMessage }) {
    return ServerResponse.fromError(new BadRequestError({ message, customMessage }));
  }

  /**
   * @param {string} message
   * @param {string} customMessage
   * @returns {ServerResponse}
   */
  static conflict({ message, customMessage }) {
    return ServerResponse.fromError(new ConflictError({ message, customMessage }));
  }
}