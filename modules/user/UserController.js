import { sendErrorResponse, sendResponse } from "../../util/Functions.js";
import { ServerResponse } from "../../util/types/ServerResponse.js";
import { UserService } from "./UserService.js";

export class UserController {
  /** @type {InstanceType<typeof UserService>} */
  userService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * 사용자 조회
   * @param {import('express').Request} req
   * @param {import('express').Response} res
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
  };

  findAllUsers = async (req, res) => {
    try {
      const users = await this.userService.findAllUsers();
      const response = ServerResponse.data(users);
      sendResponse(res, response);
    } catch (e) {
      sendErrorResponse(res, e);
    }
  };
}