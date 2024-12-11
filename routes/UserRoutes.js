import { Router } from 'express';
import { UserController } from "../features/user/UserController.js";
import passport from "passport";
import { generateJwt } from "../util/Jwt.js";

/**
 * @param {express.Express | Router} app
 */
export function UserRoutes(app) {
  const userRouter = Router();
  const userController = new UserController();

  userRouter.get('/test', passport.authenticate('jwt', { session : false }), (req, res) => {
    console.log(`userId: ${ req.user }`);

    res.json({ message : 'success' });
  });

  userRouter.post('/genToken', (req, res) => {
    const token = generateJwt('test token');
    res.json({ token });
  });

  userRouter.get('/:uid', userController.findUserByUid);

  app.use('/users', userRouter);
}