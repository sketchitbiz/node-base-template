import bcrypt from 'bcrypt'
import { redisManager, type RedisInterface } from 'src/database/RedisManager'
import { Transaction } from 'src/util/Decorators'
import { NotFoundError, UnauthorizedError } from 'src/util/types/Error'
import { ResponseMessage } from 'src/util/types/ResponseMessage'
import { UserMapper } from './UserMapper'
import type { UserMst } from './models/UserMst'

export class UserService {

  private readonly userMapper: UserMapper
  private readonly redis: RedisInterface

  constructor() {
    this.userMapper = new UserMapper()
    this.redis = redisManager
  }

  @Transaction()
  async createUser(params: Omit<UserMst, 'index'>) {

    const hashedPassword = await bcrypt.hash(params.password, 10)
    const user = await this.userMapper.createUser({ ...params, password: hashedPassword }) as UserMst

    const { password, ...userWithoutPassword } = user
    await this.redis.set(`user:${user.index}`, JSON.stringify(userWithoutPassword))

    return userWithoutPassword
  }

  async login(params: { email: string, password: string }) {
    const user = await this.findUserByEmailWithPassword(params.email)
    const isPasswordCorrect = await bcrypt.compare(params.password, user.password)
    if (!isPasswordCorrect) {
      throw new UnauthorizedError({ message: ResponseMessage.PASSWORD_INCORRECT })
    }

    // const token = generateJwt(user.index.toString())
    // return token
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  async findAllUsers() {
    let redisUsers = await this.redis.get('users')
    if (redisUsers) {
      return JSON.parse(redisUsers) as UserMst[]
    }

    const users = await this.userMapper.findAllUsers()

    if (!users) {
      throw new NotFoundError({ message: ResponseMessage.NO_DATA })
    }

    await this.redis.set('users', JSON.stringify(users))

    return users
  }

  async findUserByEmail(email: string) {
    const user = await this.userMapper.findUserByEmail(email)
    if (!user) {
      throw new NotFoundError({ message: ResponseMessage.NO_USER, customMessage: "유저가 존재하지 않습니다." })
    }

    return user
  }

  async findUserByEmailWithPassword(email: string) {
    const user = await this.userMapper.findUserByEmailWithPassword(email)
    if (!user) {
      throw new NotFoundError({ message: ResponseMessage.NO_USER, customMessage: "유저가 존재하지 않습니다." })
    }

    return user
  }

  async findUserByIndex(index: number) {
    const user = await this.userMapper.findUserByIndex(index)
    if (!user) {
      throw new NotFoundError({ message: ResponseMessage.NO_USER, customMessage: "유저가 존재하지 않습니다." })
    }

    return user
  }

  @Transaction()
  async updateUser(params: Partial<UserMst>): Promise<Omit<UserMst, 'password'>> {
    await this.findUserByEmail(params.email!)

    const hashedPassword = await bcrypt.hash(params.password!, 10)
    const updatedUser = await this.userMapper.updateUser({ ...params, password: hashedPassword }) as UserMst
    await this.redis.set(`user:${updatedUser.index}`, JSON.stringify(updatedUser))

    const { password, ...userWithoutPassword } = updatedUser

    return userWithoutPassword
  }
}

