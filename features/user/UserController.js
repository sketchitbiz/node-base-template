import { UserService } from "./UserService.js";
import { sendResponse } from "../../util/Functions.js";

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
   */
  findUserByUid = async (req, res) => {
    const uid = req.params.uid;
    const result = await this.userService.findUserByUid(uid);

    sendResponse(res, result);
  }
}