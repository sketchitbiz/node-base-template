

import bcrypt from 'bcrypt'
import { redisManager } from '../../database/RedisManager.js'
import { createTransactionalService } from "../../database/TransactionProxy.js"
import { ConflictError, NotFoundError, UnauthorizedError } from '../../util/types/Error.js'
import { ResponseMessage } from '../../util/types/ResponseMessage.js'
import { UserMapper } from "./UserMapper.js"
import { UserMst } from './models/UserMst.js'

/** @typedef {import('./UserMapper.js').UserMapper} UserMapperType */

class _UserService {
  /** @type {UserMapperType} @private */
  userMapper

  /** @type {import('../../database/RedisManager.js').RedisInterface} @private */
  redis

  constructor() {
    this.userMapper = new UserMapper()
    this.redis = redisManager
  }

  /**
   * 사용자 생성
   *
   * @async
   * @param {Omit<UserMst, 'index'>} user
   * @returns {Promise<UserMst>}
   */
  async createUser(user) {
    const emailExists = await this.userMapper.checkEmailExists(user.email)
    if (emailExists) {
      throw new ConflictError({ message: ResponseMessage.conflict, customMessage: "이미 존재하는 이메일입니다." })
    }

    const hashedPassword = await bcrypt.hash(user.password, 10)
    user.password = hashedPassword

    const newUser = await this.userMapper.createUser(user)

    delete newUser.password
    await this.redis.set('users', JSON.stringify(newUser), 60 * 60 * 24)
    return newUser
  }


  /**
   * 모든 사용자 조회
   *
   * @async
   * @returns {Promise<UserMst[]>}
   */
  async findAllUsers() {
    /** @type {string | null | UserMst[]} */
    let redisUsers = await this.redis.get('users')
    if (redisUsers) {
      const parsedData = JSON.parse(redisUsers)

      if (parsedData?.length > 0) {
        return parsedData
      }
    }

    let users = await this.userMapper.findAllUsers()
    if (users.length === 0) {
      throw new NotFoundError({ message: ResponseMessage.noData, customMessage: "데이터가 없습니다." })
    }

    // pw 제거
    users = users.map(user => {
      delete user.password
      return user
    })

    await this.redis.set('users', JSON.stringify(users), 60 * 60 * 24)

    return users
  }


  /**
   * 이메일로 사용자 조회
   *
   * @async
   * @param {string} email
   * @returns {Promise<UserMst | null>}
   */
  async findUserByEmail(email) {
    return this.userMapper.findUserByEmail(email)
  }

  /**
   * 사용자 업데이트
   *
   * @async
   * @param {Object} param0 
   * @param {Partial<UserMst>} param0.updateUser
   * @param {number} param0.index
   * @returns {Promise<UserMst>}
   */
  async updateUser({ updateUser, index }) {
    const user = await this.userMapper.findUserByIndex(index)
    if (!user) {
      throw new NotFoundError({ message: ResponseMessage.noData, customMessage: "데이터가 없습니다." })
    }

    if (updateUser.password) {
      const hashedPassword = await bcrypt.hash(updateUser.password, 10)
      updateUser.password = hashedPassword
    }

    updateUser = { ...user, ...updateUser }

    return this.userMapper.updateUser({ user: updateUser, index })
  }

  async findUserByEmailWithPassword(email) {
    const user = await this.userMapper.findUserByEmailWithPassword(email)
    if (!user) {
      throw new NotFoundError({ message: ResponseMessage.noData, customMessage: "데이터가 없습니다." })
    }
    return user
  }

  /**
   * 로그인
   *
   * @async
   * @param {Object} param0 
   * @param {string} param0.email
   * @param {string} param0.password
   * @returns {Promise<Omit<UserMst, 'password'>>}
   */
  async login({ email, password }) {
    const user = await this.findUserByEmailWithPassword(email)
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      throw new UnauthorizedError({ message: ResponseMessage.passwordIncorrect, customMessage: "비밀번호가 틀렸습니다." })
    }

    delete user.password
    return user
  }
}

/** @type {typeof _UserService} */
export const UserService = createTransactionalService(_UserService)
