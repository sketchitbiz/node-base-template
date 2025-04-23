/**
 * Logger Utility Module
 * 
 * This module provides comprehensive logging functionality using Winston logger.
 * It includes HTTP request/response logging, error logging, and daily rotating file logs.
 * 
 * Features:
 * - HTTP request/response logging
 * - Error logging with stack traces
 * - Daily rotating log files
 * - Console logging with colors
 * - Circular reference handling
 * 
 * Log Levels (in order of priority):
 * - error (0): Critical errors
 * - debug (1): Debug information
 * - warn (2): Warning messages
 * - info (3): General information
 * - data (4): Data logging
 * - verbose (5): Detailed information
 * - silly (6): Very detailed information
 * - custom (7): Custom logging
 * 
 * Usage:
 * ```javascript
 * // Log HTTP request
 * logRequest(req);
 * 
 * // Log HTTP response
 * logResponse(req, res, responseBody);
 * 
 * // Log errors
 * logError('Error message', req, res, responseBody);
 * 
 * // Direct logger usage
 * logger.info('General information');
 * logger.error('Error occurred', error);
 * ```
 * 
 * Log File Configuration:
 * - Daily rotating files
 * - 30 days retention
 * - Compressed archives
 * - Format: YYYY-MM-DD.log
 */

import dayjs from 'dayjs'
import express from 'express'
import winston from 'winston'
import winstonDaily from 'winston-daily-rotate-file'

const { combine, label, timestamp, printf, colorize } = winston.format

/**
 * Formats HTTP request and response data for logging
 * @param {express.Request |null} [req]
 * @param {express.Response} [res]
 * @param {any} [responseBody]
 * @return {object}
 */
export function formatHttpLoggerResponse(req, res, responseBody) {
  return {
    Request: req ? {
      headers: req.headers,
      host: req.hostname,
      url: req.originalUrl,
      method: req.method,
      params: req.params,
      query: req?.query,
      files: req?.files,
      body: req.body,
    } : null,
    Response: res ? {
      headers: res.getHeaders(),
      statusCode: res.statusCode,
      body: responseBody ?? null
    } : undefined
  }
}


/**
 * Logs incoming HTTP request details
 * @param {express.Request} req
 */
export function logRequest(req) {
  const { Request } = formatHttpLoggerResponse(req)

  logger.info(`Request ${Request.url}`, Request)
  // logger.info('Response', Response);
}


/**
 * Logs outgoing HTTP response details
 * @param {express.Request | null} req
 * @param {express.Response} res
 * @param {any} resBody
 */
export function logResponse(req, res, resBody) {
  const { Response } = formatHttpLoggerResponse(req, res, resBody)

  logger.info(`Response ${res.req.baseUrl + res.req.url}`, Response)
}

/**
 * Logs error details with request and response information
 * @param {string} message
 * @param {express.Request} [req]
 * @param {express.Response} [res]
 * @param {any} [resBody]
 */
export function logError(message, req, res, resBody) {
  const { Request, Response } = formatHttpLoggerResponse(req, res, resBody)

  logger.error(message)
  if (Request) {
    logger.error('Request', Request)
  }
  if (Response) {
    logger.error('Response', Response)
  }

}

/**
 * Log level definitions
 * Lower numbers indicate higher priority
 */
const Level = { // 숫자가 낮을수록 우선순위가 높다.
  error: 0,
  debug: 1,
  warn: 2,
  info: 3,
  data: 4,
  verbose: 5,
  silly: 6,
  custom: 7
}

/**
 * Color definitions for different log levels
 */
const colors = { // 각각의 레벨에 대한 색상을 지정해줍니다.
  error: 'red',
  debug: 'blue',
  warn: 'yellow',
  info: 'green',
  data: 'magenta',
  verbose: 'cyan',
  silly: 'grey',
  custom: 'yellow',
  no: 'white'
}

winston.addColors(colors)

/**
 * Handles circular references in JSON stringification
 * @returns {Function} Replacer function for JSON.stringify
 */
const getCircularReplacer = () => {
  const seen = new WeakSet()
  /** @type {Function} */
  const replacer = function (key, value) {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]'
      }
      seen.add(value)
    }
    return value
  }
  return replacer
}

/**
 * Console logging format configuration
 * Includes timestamp, label, and colored output
 */
const consoleFormat = winston.format.combine(
  label({ label: 'Test Server' }),
  timestamp(),
  printf(info => {
    let { level, message, label, timestamp, ...other } = info

    // @ts-ignore
    timestamp = colorize().colorize('no', `[ ${new Date(timestamp).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })} ]`)
    // timestamp = colorize().colorize('no', `[ ${dayjs().tzformat('YYYY-MM-DD HH:mm:ss A')} ]`);
    label = colorize().colorize('no', `[ ${label}] `)
    // @ts-ignore
    message = colorize().colorize(level, message)
    let { body, ...others } = other
    body = JSON.stringify(body, null, 2)
    body = body ? colorize().colorize('data', `[Body]\n` + body) : null


    // return `${timestamp} ${label} -  ${message} ${Object.keys(other).length > 0 ? '\n' + JSON.stringify(others, null, 2) + `\n${body}` : ''}`.trim();
    // @ts-ignore
    return `${timestamp} ${label} -  ${message} ${Object.keys(other).length > 0 ? '\n' + JSON.stringify(others, getCircularReplacer(), 2) + `\n${body ?? ''}` : ''}`.trim()
  })
)

/**
 * File logging format configuration
 * Includes timestamp, label, and structured output
 */
const fileFormat = winston.format.combine(
  label({ label: 'Test Server' }),
  timestamp(),
  printf(info => {
    let { label, level, message, timestamp, ...other } = info

    level = `[ ${level.toUpperCase()} ]`
    timestamp = `[ ${dayjs().format('YYYY-MM-DD hh:mm:ss A')} ]`
    label = `[ ${label} ] `
    let { body, ...others } = other
    body = JSON.stringify(body, null, 2)
    body = `[Body]\n${body}`

    // return `${level} ${timestamp} ${label} - ${message} ${Object.keys(other).length > 0 ? '\n' + JSON.stringify(others, null, 2) + `\n${body}` : ''}`.trim();
    // @ts-ignore
    return `${timestamp} ${label} -  ${message} ${Object.keys(other).length > 0 ? '\n' + JSON.stringify(others, getCircularReplacer(), 2) + `\n${body ?? ''}` : ''}`.trim()
  })
)

/**
 * Winston logger instance configuration
 * - Console transport for development
 * - Daily rotating file transport for production
 * - Custom log levels and formats
 */
export const logger = winston.createLogger({
  levels: Level,
  level: 'custom',
  // defaultMeta : { service : 'Covil App Server' },
  transports: [
    new winston.transports.Console({ debugStdout: true, format: combine(consoleFormat) }),
    new winstonDaily({
      level: 'custom', // info 레벨 로그를 저장할 파일 설정
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      filename: `%DATE%.log`, // %DATE% = 위에서 설정한 datePattern 이 들어감
      dirname: 'log', // 로그 파일을 저장할 디렉토리 설정
      maxFiles: 30,  // 30일치 로그 파일 저장
      format: fileFormat
    }),
  ]
})
