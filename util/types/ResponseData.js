import pg from "pg";
import { BadRequestError, BaseError, ConflictError, ValidationError } from "./Error.js";

const { DatabaseError } = pg;

/**
 * @template T
 * @class ServerResponse
 */
export class ResponseData {

  /** @type {number} */
  statusCode;

  /** @type {string} */
  message;

  /** @type {T | T[] | null} */
  data;

  /** @type {Error| null} */
  error;

  /**
   *
   * @param {Partial<ResponseData<T>>} params
   */
  constructor(params) {

    if (!params.statusCode || !params.message) {
      throw new ValidationError({ customMessage: 'statusCode, message는 필수입니다.' });
    }

    this.statusCode = params.statusCode;
    this.message = params.message;

    if (Array.isArray(params.data)) {
      this.data = params.data;
    } else if (params.data === null || params.data === undefined) {
      this.data = null;
    } else {
      this.data = [params.data];
    }

    this.error = params.error ?? null;
  }

  static success() {
    return new ResponseData({ statusCode: 200, message: 'success', data: null, error: null });
  }

  static noData(message) {
    return new ResponseData({ statusCode: 404, message: message ?? 'no data', data: null, error: null });
  }

  /**
   * @template T
   * @param {T} data
   * @returns {ResponseData<T>}
   */
  static data(data) {
    return new ResponseData({ statusCode: 200, message: 'success', data, error: null });
  }

  /**
   *
   * @param {BaseError | Error} error
   */
  static fromError(error) {

    if (error instanceof BaseError) {
      return new ResponseData({
        statusCode: error.statusCode ?? 500,
        message: error.message ?? 'fail',
        error: {
          name: error.name,
          message: error.customMessage ?? error.message,
          stack: error.stack
        }
      });
    } else if (error instanceof Error) {
      return new ResponseData({
        statusCode: 500,
        data: null,
        message: error.message,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      });
    } else {
      return new ResponseData({
        statusCode: 500,
        data: null,
        message: 'fail',
        error
      });
    }
  }

  /**
   * @param {{message: string, customMessage?: string}} params
   * @returns {ResponseData}
   */
  static badRequest({ message, customMessage }) {
    return ResponseData.fromError(new BadRequestError({ message, customMessage }));
  }

  /**
   * @param {{message: string, customMessage?: string}} params
   * @returns {ResponseData}
   */
  static conflict({ message, customMessage }) {
    return ResponseData.fromError(new ConflictError({ message, customMessage }));
  }
}