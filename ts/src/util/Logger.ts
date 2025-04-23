import dayjs from 'dayjs';
import { Request, Response } from 'express';
import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import type { AbstractConfigSetColors, AbstractConfigSetLevels } from 'winston/lib/winston/config';

const { combine, label, timestamp, printf, colorize } = winston.format;

interface HttpLoggerResponse {
  Request: {
    headers: any;
    host: string;
    url: string;
    method: string;
    params: any;
    query?: any;
    files?: any;
    body: any;
  } | null;
  Response: {
    headers: any;
    statusCode: number;
    body: any;
  } | undefined;
}

/**
 * HTTP Logger Request 포맷팅
 * @param req Express Request 객체
 * @param res Express Response 객체
 * @param responseBody 응답 바디
 * @returns 포맷팅된 로그 객체
 */
export function formatHttpLoggerResponse(
  req?: Request,
  res?: Response,
  responseBody?: any
): HttpLoggerResponse {
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
 * 요청 로깅
 * @param req 요청 객체
 */
export function logRequest(req: Request): void {
  const { Request } = formatHttpLoggerResponse(req);

  if (Request?.url) {
    logger.info(`Request ${Request.url}`, Request);
  }
}

/**
 * 응답 로깅
 * @param req 요청 객체
 * @param res 응답 객체
 * @param resBody 응답 바디
 */
export function logResponse(req: Request, res: Response, resBody: any): void {
  const { Response } = formatHttpLoggerResponse(req, res, resBody);

  logger.info(`Response ${res.req.baseUrl + res.req.url}`, Response);
}

/**
 * 에러 로깅
 * @param message 에러 메시지
 * @param req 요청 객체
 * @param res 응답 객체
 * @param resBody 응답 바디
 */
export function logError(message: string, req?: Request, res?: Response, resBody?: any): void {
  const { Request, Response } = formatHttpLoggerResponse(req, res, resBody);

  logger.error(message);
  if (Request) {
    logger.error('Request', Request);
  }
  if (Response) {
    logger.error('Response', Response);
  }
}



export const Level: AbstractConfigSetLevels = {
  error: 0,
  debug: 1,
  warn: 2,
  info: 3,
  data: 4,
  verbose: 5,
  silly: 6,
  custom: 7
}


const colors: AbstractConfigSetColors = {
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

// 콘솔 로그 색상 설정
winston.addColors(colors);

// 콘솔 로그 포맷
const consoleFormat = winston.format.combine(
  label({ label: 'Test Server' }),
  timestamp(),
  printf((info: any) => {
    let { level, message, label, timestamp, ...other } = info;

    timestamp = colorize().colorize('no', `[${new Date(timestamp).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })}]`);
    label = colorize().colorize('no', `[${label}]`);
    message = colorize().colorize(level, message);

    // 순환 참조를 안전하게 처리하는 함수
    const safeStringify = (obj: any): string => {
      const cache = new Set();
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (cache.has(value)) {
            return '[Circular]';
          }
          cache.add(value);
        }
        return value;
      }, 2);
    };

    let { body, ...others } = other;
    body = body ? safeStringify(body) : '';
    body = body ? colorize().colorize('data', `[Body]\n${body}`) : '';

    const othersStr = Object.keys(others).length > 0 ? '\n' + safeStringify(others) : '';

    return `${timestamp} ${label} - ${message}${othersStr}${body ? '\n' + body : ''}`.trim();
  })
);

// 파일 로그 포맷
const fileFormat = winston.format.combine(
  label({ label: 'Test Server' }),
  timestamp(),
  printf((info: any) => {
    let { label, level, message, timestamp, ...other } = info;

    level = `[${level.toUpperCase()}]`;
    timestamp = `[${dayjs().format('YYYY-MM-DD hh:mm:ss A')}]`;
    label = `[${label}]`;

    // 순환 참조를 안전하게 처리하는 함수
    const safeStringify = (obj: any): string => {
      const cache = new Set();
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (cache.has(value)) {
            return '[Circular]';
          }
          cache.add(value);
        }
        return value;
      }, 2);
    };

    let { body, ...others } = other;
    body = body ? safeStringify(body) : '';
    body = body ? colorize().colorize('data', `[Body]\n${body}`) : '';

    const othersStr = Object.keys(others).length > 0 ? '\n' + safeStringify(others) : '';

    return `${timestamp} ${label} - ${message}${othersStr}${body ? '\n' + body : ''}`.trim();
  })
);

// 로거 생성
export const logger = winston.createLogger({
  levels: Level,
  level: 'custom',
  transports: [
    new winston.transports.Console({ debugStdout: true, format: combine(consoleFormat) }),
    new winstonDaily({
      level: 'custom',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      filename: `%DATE%.log`,
      dirname: 'log',
      maxFiles: 30,
      format: fileFormat
    }),
  ]
});