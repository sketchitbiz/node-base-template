import { jwtAuth, localAuth } from '@/util/Middleware'
import { Router } from 'express'
import { UserController } from 'src/modules/user/UserController'

export function UserRoutes(app: Router) {
  const router = Router()
  const controller = new UserController()

  router.get('/', controller.findAllUsers)
  router.post('/join', controller.join)
  router.post('/login', localAuth, controller.login)

  app.use('/users', (req, res, next) => {
    // JWT 인증 없이 접근 가능한 경로
    const whitelist = ['/login', '/join']

    if (whitelist.includes(req.path)) {
      next()
    } else {
      // 그외는 모두 JWT 인증 필요
      jwtAuth(req, res, next)
    }
  }, router)
} 
