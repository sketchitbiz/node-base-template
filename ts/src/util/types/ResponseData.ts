import type { MetaData } from './Common'
import { BaseError, IternalServerError, NotFoundError } from './Error'
import { ResponseMessage } from './ResponseMessage'

export class ResponseData<T> {
  statusCode: number
  message: string
  data: T | T[] | null
  metadata: null | MetaData
  error: BaseError | Error | null

  constructor(params: { statusCode: number, message: string, data?: T | T[], error?: BaseError | Error | null, metadata?: null | MetaData }) {

    if (!params.statusCode || !params.message) {
      throw new IternalServerError({ message: ResponseMessage.INTERNAL_SERVER_ERROR, customMessage: 'statusCode,message는 필수입니다.' })
    }
    this.statusCode = params.statusCode
    this.message = params.message
    this.error = params.error || null
    this.metadata = params.metadata || null
    if (Array.isArray(params.data)) {
      this.data = params.data
    } else if (params.data) {
      this.data = [params.data]
    } else {
      this.data = null
    }
  }

  static success() {
    return new ResponseData({ statusCode: 200, message: 'success', data: null, error: null, metadata: null })
  }

  static noData(params: { message?: ResponseMessage, customMessage: string }) {
    return new ResponseData({ statusCode: 404, message: params.message ?? ResponseMessage.NO_DATA, data: null, error: new NotFoundError({ message: params.message ?? ResponseMessage.NO_DATA, customMessage: params.customMessage }), metadata: null })
  };

  static data<T>(data: T | T[], metadata?: null | MetaData) {
    return new ResponseData({ statusCode: 200, message: ResponseMessage.SUCCESS, data, error: null, metadata })
  }

  static fromError(error: BaseError | Error) {
    if (error instanceof BaseError) {
      return new ResponseData({
        statusCode: error.statusCode ?? 500,
        message: error.message ?? 'fail',
        error,
        data: null,
        metadata: null
      })
    } else if (error instanceof Error) {
      return new ResponseData({
        statusCode: 500,
        data: null,
        message: error.message,
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack
        },
        metadata: null
      })
    } else {
      return new ResponseData({
        statusCode: 500,
        data: null,
        message: ResponseMessage.FAIL,
        error,
        metadata: null
      })
    }
  }
}