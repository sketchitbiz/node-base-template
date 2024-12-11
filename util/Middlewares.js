import { logRequest } from "./Logger.js";

/**
 * 기본 정보를 설정하는 미들웨어
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {any}
 */
export function setBasicInfo(req, res, next) {
  logRequest(req);

  req.body.uid = req.uid;
  next();
}

/**
 * 에러 핸들링 미들웨어
 * @param {Error | BaseError} err
 * @param {import('express').Request} req
 * @param {import('express').Response}res
 * @param {import('express').NextFunction}next
 */
// export const errorHandlingMiddleware = (err, req, res, next) => {
//   logError(err, req, res, null);
//   const response = ServerResponse.fromError(err);
//
//   // API 요청인지 확인 (Accept 헤더나 경로를 기반으로)
//   const isApiRequest = req.path.startsWith('/api') ||
//     req.headers["content-type"] === 'application/json' ||
//     req.xhr;
//
//   if (isApiRequest) {
//     sendResponse(res, response);
//     return;
//   }
//
//   // API 요청이 아닌 경우
//   if (req.path !== '/errorPage') {
//     return res.redirect('/errorPage');
//   }
// };