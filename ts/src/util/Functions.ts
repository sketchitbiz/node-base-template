import bcrypt from 'bcrypt'
import { Response } from 'express'
import { fromError, type ZodError } from 'zod-validation-error'
import { logger, logResponse } from "./Logger"
import type { BaseError } from './types/Error'
import { ResponseData } from "./types/ResponseData"


/**
 * Convert snake_case to camelCase
 * @param data Object or Array to convert
 * @returns Converted data in camelCase
 */
export function snakeToCamel(data: any): any {
  if (data === null || data === undefined) {
    return data
  }

  if (Array.isArray(data)) {
    return data.map((item) => snakeToCamel(item))
  }

  if (typeof data === 'object') {
    const camelCaseData: Record<string, any> = {}
    for (const key in data) {
      const value = data[key]
      const camelCaseKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
      // 값이 객체나 배열인 경우 재귀적으로 처리
      camelCaseData[camelCaseKey] = snakeToCamel(value)
    }
    return camelCaseData
  }

  return data
}

/**
 * Send response
 * @param res Express Response object
 * @param result Server response data
 */
export function sendResponse<T>(res: Response, result: ResponseData<T>): void {
  logResponse(res.req, res, result)

  res.status(result.statusCode).json([result])
}

/**
 * Send error response
 * @param res Express Response object 
 * @param error Error object
 */
export function sendErrorResponse(res: Response, error: Error | unknown | BaseError): void {
  logger.error(`Error: `, error)
  const response = ResponseData.fromError(error as Error | BaseError)
  sendResponse(res, response)
}

/**
 * Hash password with salt
 * @param password Password to hash
 * @param salt Salt to use
 * @returns Hashed password
 */
export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Parse Zod error
 */
export function parseZodError(error: ZodError) {
  return fromError(error).details.map(d => ({ field: d.path[0], messaging: d.message }))
}