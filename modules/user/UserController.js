import { ValidationError } from "util/types/Error.js"
import { ResponseMessage } from "util/types/ResponseMessage.js"
import { sendErrorResponse, sendResponse } from "../../util/Functions.js"
import { ResponseData } from "../../util/types/ResponseData.js"
import { AuthService } from '../auth/AuthService.js'
import { LoginRequest } from "./models/Requests.js"
import { UserService } from "./UserService.js"

export class UserController {
  /** @type {InstanceType<typeof UserService>} */
  userService

  /** @type {InstanceType<typeof AuthService>} */
  authService

  constructor() {
    this.userService = new UserService()
    this.authService = new AuthService()
  }

  /**
   * 사용자 로그인
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  login = async (req, res) => {
    try {

      let result = LoginRequest.safeParse(req.body)
      if (!result.success) {
        throw new ValidationError({ message: ResponseMessage.badRequest, customMessage: result.error.message })
      }
      const { email, password } = result.data

      const user = await this.authService.login(req.body)
      const response = ResponseData.data(user)
      sendResponse(res, response)
    } catch (e) {
      sendErrorResponse(res, e)
    }
  };

  /**
   * 사용자 생성
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  createUser = async (req, res) => {
    try {
      const user = await this.userService.createUser(req.body)
      const response = ResponseData.data(user)
      sendResponse(res, response)
    } catch (e) {
      sendErrorResponse(res, e)
    }
  };


  /**
   * 사용자 조회
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  findAllUsers = async (req, res) => {
    try {
      const users = await this.userService.findAllUsers()
      const response = ResponseData.data(users)
      sendResponse(res, response)
    } catch (e) {
      sendErrorResponse(res, e)
    }
  };

  /**
   * 사용자 업데이트
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  updateUser = async (req, res) => {
    try {
      const body = req.body
      const index = Number(req.params.index)
      const user = await this.userService.updateUser({ updateUser: body, index })
      const response = ResponseData.data(user)
      sendResponse(res, response)
    } catch (e) {
      sendErrorResponse(res, e)
    }
  };
}