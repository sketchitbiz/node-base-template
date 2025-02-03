import { Router } from 'express'
import { UserController } from "../modules/user/UserController.js"
import { generateJwt } from "../util/Jwt.js"
import { jwtAuth, localAuth, setBasicInfo } from '../util/Middlewares.js'

/**
 * @param {import('express').Router} app
 */
export function UserRoutes(app) {
  const userRouter = Router()
  const userController = new UserController()
  // @ts-ignore
  userRouter.use(setBasicInfo)

  userRouter.get('/test',
  )

  userRouter.post('/genToken', (req, res) => {
    const token = generateJwt('test token')
    res.json({ token })
  })

  userRouter.get('/', userController.findAllUsers)
  userRouter.post('/join', userController.createUser)
  userRouter.post('/login', localAuth)
  userRouter.patch('/:index', userController.updateUser)


  // 모든 라우트에 토큰 검증 미들웨어 적용
  app.use('/users', (req, res, next) => {
    const whitelist = ['/login', '/join']
    if (whitelist.includes(req.path)) {
      return next()
    } else {
      jwtAuth(req, res, next)
    }

  }, userRouter)
}
