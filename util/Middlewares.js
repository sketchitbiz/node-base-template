import { logRequest } from "./Logger.js";

/**
 * 기본 정보를 설정하는 미들웨어
 * @param {import('express').Request & { userId: string }} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {any}
 */
export function setBasicInfo(req, res, next) {
  logRequest(req);

  const userId = ['userId', 'user_id', 'userid'].find((id) => req.headers[id]);

  if (userId) {
    // @ts-ignore
    req.userId = req.headers[userId];
  }

  next();
}