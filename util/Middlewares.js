import jwt from 'jsonwebtoken'
import passport from 'passport'
import { sendResponse } from './Functions.js'
import { logRequest } from "./Logger.js"
import { UnauthorizedError } from './types/Error.js'
import { ResponseData } from './types/ResponseData.js'
import { ResponseMessage } from './types/ResponseMessage.js'
const { TokenExpiredError } = jwt

/**
 * 기본 정보를 설정하는 미들웨어
 * @param {import('express').Request & { userId: string }} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {any}
 */
export function setBasicInfo(req, res, next) {
  logRequest(req)

  const userId = ['userId', 'user_id', 'userid'].find((id) => req.headers[id])

  if (userId) {
    // @ts-ignore
    req.userId = req.headers[userId]
  }

  next()
}



/**
 * Local Auth 미들웨어
 *
  * @param {import('express').Request} req Express Request 객체
 * @param {import('express').Response} res Express Response 객체
 * @param {import('express').NextFunction} next Express Next 함수
 * @returns {void}
 */
export const localAuth = (req, res, next) => passport.authenticate('local', { session: false },
  /**
   * Local 인증 콜백 함수
   * @type {passport.AuthenticateCallback}
   */
  (err, user, info, status) => {
    if (err) {
      return next(err)
    }

    if (info) {
      if (info instanceof Error) {
        const response = ResponseData.fromError(info)
        sendResponse(res, response)
        return
      } else {
        const error = new UnauthorizedError({ message: ResponseMessage.fail, customMessage: '로그인에 실패했습니다.' })
        const response = ResponseData.fromError(error)
        sendResponse(res, response)
        return
      }
    }

    if (user) {
      const response = ResponseData.data(user)
      sendResponse(res, response)
      return
    }

    next()
  }
)(req, res, next)

/**
 * JWT 인증 미들웨어
 * @param {import('express').Request} req Express Request 객체
 * @param {import('express').Response} res Express Response 객체
 * @param {import('express').NextFunction} next Express Next 함수
 * @returns {void}
 */
export const jwtAuth = (req, res, next) => passport.authenticate('jwt', { session: false },
  /**
   * JWT 인증 콜백 함수
   * @type {passport.AuthenticateCallback}
   */
  (err, user, info, status) => {
    if (err) {
      return next(err)
    }

    if (info) {
      if (info instanceof TokenExpiredError) {
        const response = new ResponseData({ message: ResponseMessage.tokenInvalid, statusCode: 401 })
        sendResponse(res, response)
        return
      }

      // @ts-ignore
      if (info.message === 'No auth token') {
        const response = new ResponseData({ message: ResponseMessage.tokenInvalid, statusCode: 401 })
        sendResponse(res, response)
        return
      }
    }

    next()
  })(req, res, next)
