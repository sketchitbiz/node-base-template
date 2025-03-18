import { Router } from 'express'
import { UserController } from "../modules/user/UserController.js"
import { jwtAuth, localAuth, setBasicInfo } from '../util/Middlewares.js'

/**
 * @param {import('express').Router} app
 */
export function UserRoutes(app) {
  const userRouter = Router()
  const userController = new UserController()
  // @ts-ignore
  userRouter.use(setBasicInfo)

  userRouter.post('/join', userController.createUser)
  userRouter.post('/login', localAuth, userController.login) // localStrategy 적용


  // 모든 라우트에 토큰 검증 미들웨어 적용
  app.use('/users', (req, res, next) => {
    const whitelist = ['/login', '/join']
    if (whitelist.includes(req.path)) return next()
    else jwtAuth(req, res, next) // jwtStrategy 적용

  }, userRouter)
}
