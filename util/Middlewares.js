import { logRequest } from "./Logger.js";

/**
 * 기본 정보를 설정하는 미들웨어
 * @param {import('express').Request & { uid: string }} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {any}
 */
export function setBasicInfo(req, res, next) {
  logRequest(req);

  if (req.user) {
    req.body['user'] = req.user;
  }
  next();
}