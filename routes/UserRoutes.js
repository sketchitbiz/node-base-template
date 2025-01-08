import { Router } from 'express';
import passport from "passport";
import { UserController } from "../modules/user/UserController.js";
import { generateJwt } from "../util/Jwt.js";
import { setBasicInfo } from '../util/Middlewares.js';

/**
 * @param {import('express').Router} app
 */
export function UserRoutes(app) {
  const userRouter = Router();
  const userController = new UserController();
  // @ts-ignore
  userRouter.use(setBasicInfo);

  userRouter.get('/test', passport.authenticate('jwt', { session: false }),
    /** 
     * @type {import('express').RequestHandler}
     */
    (req, res) => {
      console.log(`userId: ${req.user}`);
      res.json({ message: 'success' });
    }
  );

  userRouter.post('/genToken', (req, res) => {
    const token = generateJwt('test token');
    res.json({ token });
  });

  userRouter.get('/', userController.findAllUsers);
  userRouter.post('/', userController.createUser);
  userRouter.post('/login', userController.login);
  userRouter.patch('/:index', userController.updateUser);


  app.use('/users', userRouter);
}