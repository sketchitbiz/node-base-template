import { logRequest } from "./Logger.js";
import { sendResponse } from "./Functions.js";
import { ResponseMessage } from "./types/ResponseMessage.js";
import { verifyJwt } from "./Jwt.js";
import { ServerResponse } from "./types/ServerResponse.js";

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
 * jwt 미들웨어
 * @param {import('express').Request} req
 * @param {import('express').Response}res
 * @param {import('express').NextFunction}next
 */
export const jwtMiddleware = (req, res, next) => {
  try {
    const platform = req.headers['platform'];

    if (!platform) {
      sendResponse(res, new ServerResponse({ message: ResponseMessage.platformRequired, statusCode: 401 }));
      return;
    }

    const token = req.headers['access_token'] ?? req.headers.authorization.split("Bearer ")[1] ?? null;
    if (!token) {
      sendResponse(res, new ServerResponse({ message: ResponseMessage.tokenRequired, statusCode: 401 }));
      return;
    }

    const { SERVER_TYPE } = process.env;

    const uid = verifyJwt(token, platform);
    if (!uid) {
      sendResponse(res, new ServerResponse({ message: ResponseMessage.tokenInvalid, statusCode: 401 }));
      return;
    }

    if (SERVER_TYPE === 'CMS') {
      req.adminId = uid;
      next();
    } else {
      req.uid = uid;
      next();
    }

  } catch (e) {
    sendResponse(res, new ServerResponse({ message: ResponseMessage.tokenRequired, statusCode: 401 }));
  }
}