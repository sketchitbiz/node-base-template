import type { Request, Response } from 'express'
import { sendErrorResponse, sendResponse } from 'src/util/Functions'
import { ResponseData } from 'src/util/types/ResponseData'
import type { UserMst } from './models/UserMst'
import { UserService } from './UserService'

export class UserController {
  private userService = new UserService();

  login = async (req: Request, res: Response) => {
    try {
      const user = req.user as UserMst
      const { password, ...userWithoutPassword } = user

      const response = ResponseData.data(userWithoutPassword)

      sendResponse(res, response)
    } catch (error) {
      sendErrorResponse(res, error)
    }
  }


  findAllUsers = async (req: Request, res: Response) => {
    try {
      const result = await this.userService.findAllUsers()
      const response = ResponseData.data(result)

      sendResponse(res, response)
    } catch (error) {
      sendErrorResponse(res, error)
    }
  }

  findUserByEmail = async (req: Request, res: Response) => {
    try {
      const result = await this.userService.findUserByEmail(req.body.email)
      const response = ResponseData.data(result)

      sendResponse(res, response)
    } catch (error) {
      sendErrorResponse(res, error)
    }
  }

  findUserByIndex = async (req: Request, res: Response) => {
    try {
      const result = await this.userService.findUserByIndex(req.body.index)
      const response = ResponseData.data(result)

      sendResponse(res, response)
    } catch (error) {
      sendErrorResponse(res, error)
    }
  }

  join = async (req: Request, res: Response) => {
    try {
      const result = await this.userService.createUser(req.body)
      const response = ResponseData.data(result)

      sendResponse(res, response)
    } catch (error) {
      sendErrorResponse(res, error)
    }
  }

  updateUser = async (req: Request, res: Response) => {
    try {
      const result = await this.userService.updateUser(req.body)
      const response = ResponseData.data(result)

      sendResponse(res, response)
    } catch (error) {
      sendErrorResponse(res, error)
    }
  }
}
