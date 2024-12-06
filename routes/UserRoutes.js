import { Router } from 'express';
import { UserController } from "../features/user/UserController.js";

/**
 * @param {express.Express | Router} app
 */
export function UserRoutes(app) {
  const userRouter = Router();
  const userController = new UserController();

  userRouter.get('/:uid', userController.findUserByUid);

  app.use('/users', userRouter);
}
