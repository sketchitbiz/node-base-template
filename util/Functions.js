import { hash } from 'bcrypt';
import { logger, logResponse } from "./Logger.js";
import { ResponseData } from "./types/ResponseData.js";

/**
 * Convert snake_case to camelCase
 * @param {Object | Array} data
 */
export function snakeToCamel(data) {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => snakeToCamel(item));
  }

  if (typeof data === 'object') {
    const camelCaseData = {};
    for (const key in data) {
      const value = data[key];
      const camelCaseKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
      // 값이 객체나 배열인 경우 재귀적으로 처리
      camelCaseData[camelCaseKey] = snakeToCamel(value);
    }
    return camelCaseData;
  }

  return data;
}

/**
 * Convert camelCase to snake_case
 * @param {Object | Array} data
 */
export function camelToSnake(data) {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => camelToSnake(item));
  }

  if (typeof data === 'object') {
    const snakeCaseData = {};
    for (const key in data) {
      const value = data[key];
      const snakeCaseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      snakeCaseData[snakeCaseKey] = camelToSnake(value);
    }
    return snakeCaseData;
  } else if (typeof data === 'string') {
    return data.replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  return data;
}

/**
 * Send response
 * @param {import('express').Response}res
 * @param {ResponseData} result
 */
export function sendResponse(res, result) {
  logResponse(null, res, result);
  res.status(result.statusCode).json([result]);
}

export function sendErrorResponse(res, error) {
  logger.error(`Error: `, error);
  const response = ResponseData.fromError(error);
  sendResponse(res, response);
}


/**
 * 비밀번호 해싱
 *
 * @export
 * @param {string} password
 * @returns {Promise<string>}
 */
export function hashPassword(password) {
  return hash(password, 10);
}