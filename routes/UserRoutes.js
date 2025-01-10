import { Router } from 'express';
import passport from 'passport';
import { UserController } from "../modules/user/UserController.js";
import { sendErrorResponse } from '../util/Functions.js';
import { generateJwt } from "../util/Jwt.js";
import { setBasicInfo } from '../util/Middlewares.js';
import { UnauthorizedError } from '../util/types/Error.js';
import { ResponseMessage } from '../util/types/ResponseMessage.js';

/**
 * @param {import('express').Router} app
 */
export function UserRoutes(app) {
  const userRouter = Router();
  const userController = new UserController();
  // @ts-ignore
  userRouter.use(setBasicInfo);

  userRouter.get('/test',
  );

  userRouter.post('/genToken', (req, res) => {
    const token = generateJwt('test token');
    res.json({ token });
  });

  userRouter.get('/', userController.findAllUsers);
  userRouter.post('/', userController.createUser);
  userRouter.post('/login', userController.login);
  userRouter.patch('/:index', userController.updateUser);


  // 모든 라우트에 토큰 검증 미들웨어 적용
  app.use('/users', function (req, res, next) {

    // 토큰 검증 미들웨어 적용 제외 경로
    const whitelist = ['/login'];
    if (whitelist.includes(req.path)) {
      return next();
    }

    // 토큰 없으면 에러 발생
    if (!req.headers['authorization']) {
      sendErrorResponse(res, new UnauthorizedError({ message: ResponseMessage.tokenRequired, customMessage: "토큰이 필요합니다." }));
      return;
    }

    // 토큰 검증
    passport.authenticate('jwt', { session: false },
      /** @type {import('passport').AuthenticateCallback} */
      (err, user, info, status) => {
        // 에러 발생 시 에러 발생
        if (err) {
          sendErrorResponse(res, err);
          return;
        }

        req.user = user;
        next();
      })(req, res, next);
  }, userRouter);
}
