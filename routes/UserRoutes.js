import { Router } from 'express';
import { UserController } from "../modules/user/UserController.js";
import { generateJwt } from "../util/Jwt.js";
import { jwtAuth, setBasicInfo } from '../util/Middlewares.js';

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
  app.use('/users', jwtAuth, userRouter);
}
