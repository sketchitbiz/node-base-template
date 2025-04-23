import type { NextFunction, Request, RequestHandler, Response } from 'express'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import { sendResponse } from './Functions'
import { logRequest } from './Logger'
import { UnauthorizedError } from './types/Error'
import { ResponseData } from './types/ResponseData'
import { ResponseMessage } from './types/ResponseMessage'
const { TokenExpiredError } = jwt


/**
 * 요청을 로깅하는 미들웨어
 *
 * @export
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export function setBasicInfo(req: Request, res: Response, next: NextFunction) {
  logRequest(req)

  // const userId = ['userId', 'user_id', 'userid'].find(key => req.headers[key])

  // if (userId) {
  //   req.userId = req.headers[userId] as string
  // }

  next()
}

/**
 * 로컬 인증 미들웨어
 * @description id,pw 로그인 미들웨어
 *
 * @export
 * @param {Request} req 
 * @param {Response} res
 * @param {NextFunction} next
 */
export const localAuth: RequestHandler = (req, res, next) => passport.authenticate('local', { session: false }, (err: Error | null, user: Express.User | false | null, info: any, status: any): void => {
  // 에러가 발생하면 에러 처리
  if (err) {
    return next(err)
  }

  // 인증 정보 관련 에러 처리
  if (info) {
    if (info instanceof Error) {
      const response = ResponseData.fromError(info)
      sendResponse(res, response)
      return
    } else {
      const error = new UnauthorizedError({ message: ResponseMessage.FAIL, customMessage: "로그인에 실패했습니다." })
      const response = ResponseData.fromError(error)
      sendResponse(res, response)
      return
    }
  }

  // 인증 성공 시 다음 미들웨어로 이동
  next()
})(req, res, next)

/**
 * JWT 인증 미들웨어
 * @description JWT 토큰 인증 미들웨어
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export const jwtAuth: (req: Request, res: Response, next: NextFunction) => void = (req: Request, res: Response, next: NextFunction) => passport.authenticate('jwt', { session: false }, (err: Error | null, user: Express.User | false | null, info: any, status: any): void => {
  // 에러가 발생하면 에러 처리
  if (err) {
    return next(err)
  }

  // 인증 정보 관련 에러 처리
  if (info) {
    if (info instanceof TokenExpiredError) {
      const response = new ResponseData({ message: ResponseMessage.TOKEN_INVALID, statusCode: 401 })
      sendResponse(res, response)
      return
    }

    // 인증 토큰이 없는 경우 에러 처리
    if ((info as Error).message === 'No auth token') {
      const response = new ResponseData({ message: ResponseMessage.TOKEN_INVALID, statusCode: 401 })
      sendResponse(res, response)
      return
    }
  }

  // 인증성공시 다음 미들웨어로 이동
  next()
})(req, res, next)