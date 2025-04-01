import bcrypt from 'bcrypt'
import { redisManager } from '../../database/RedisManager.js'
import { createTransactionalService } from '../../database/TransactionProxy.js'
import { generateJwt } from '../../util/Jwt.js'
import { NotFoundError, UnauthorizedError } from '../../util/types/Error.js'
import { ResponseMessage } from '../../util/types/ResponseMessage.js'
import { UserMst } from '../user/models/UserMst.js'
import { UserService } from '../user/UserService.js'
class _AuthService {

  /** @type {import('../../database/RedisManager.js').RedisInterface} @private */
  redis

  /** @type {InstanceType<typeof UserService>} @private */
  userService

  constructor() {
    this.userService = new UserService()
    this.redis = redisManager
  }


  /**
   * 로그인
   *
   * @async
   * @param {Omit<UserMst, 'index'| 'name'>} body
   * @returns {Promise<{token: string}>}
   */
  async login(body) {

    // redis에서 사용자 조회
    /** @type {string | null | UserMst} */
    let redisUser = await this.redis.get(`users:${body.email}`)
    if (redisUser) {
      redisUser = /** @type {UserMst} */ (JSON.parse(redisUser))

      const isPasswordValid = await bcrypt.compare(body.password, redisUser.password)
      if (isPasswordValid && redisUser.email === body.email) {
        const token = generateJwt(redisUser.email)
        return { token }
      }
    }


    const user = await this.userService.findUserByEmail(body.email)
    if (!user) {
      throw new NotFoundError({ message: ResponseMessage.noUser, customMessage: "사용자가 존재하지 않습니다." })
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedError({ message: ResponseMessage.passwordIncorrect, customMessage: "비밀번호가 일치하지 않습니다." })
    }

    const token = generateJwt(user.email)

    await this.redis.set(`users:${user.email}`, JSON.stringify(user), 60 * 60 * 24)

    return { token }
  }


  /**
   * 가입
   *
   * @async
   * @param {Omit<UserMst, 'index'>} body
   * @returns {Promise<{token: string}>}
   */
  async join(body) {
    const user = await this.userService.createUser(body)
    const token = generateJwt(user.email)

    await this.redis.del('users')
    await this.redis.set(`users:${user.email}`, JSON.stringify(user))

    return { token }
  }
}

/** @type {typeof _AuthService} */
export const AuthService = createTransactionalService(_AuthService)