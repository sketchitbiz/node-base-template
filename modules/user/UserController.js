import { sendErrorResponse, sendResponse } from "../../util/Functions.js";
import { ServerResponse } from "../../util/types/ServerResponse.js";
import { UserService } from "./UserService.js";

export class UserController {

  /** @type {UserService} */
  userService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * 사용자 조회
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  findUserByUid = async (req, res) => {
    try {
      const uid = req.params.uid;
      const user = await this.userService.findUserByUid({ uid });

      const response = ServerResponse.data(user);
      sendResponse(res, response);
    } catch (e) {
      sendErrorResponse(res, e); 
    }
  }
}