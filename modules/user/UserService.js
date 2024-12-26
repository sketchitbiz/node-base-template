

import { redisManager } from '../../database/RedisManager.js';
import { createTransactionalService } from "../../database/TransactionProxy.js";
import { NotFoundError } from "../../util/types/Error.js";
import { UserMapper } from "./UserMapper.js";
import { UserMst } from "./UserMst.js";

/** @typedef {import('./UserMapper.js').UserMapper} UserMapperType */

class _UserService {
  /** @type {UserMapperType} @private */
  userMapper;

  /** @type {import('../../database/RedisManager.js').RedisInterface} @private */
  redis;

  constructor() {
    this.userMapper = new UserMapper();
    this.redis = redisManager;
  }

  /**
   * uid로 사용자 조회
   * @param {{uid: string}} params
   * @returns {Promise<UserMst>}
   */
  async findUserByUid({ uid }) {
    // Redis에서 먼저 조회
    const cachedUser = await this.redis.get(`user:${uid}`);
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    const user = await this.userMapper.findUserByUid(uid);

    if (!user) {
      throw new NotFoundError({ message: '사용자를 찾을 수 없습니다.' });
    }

    // Redis에 저장
    await this.redis.set(`user:${uid}`, JSON.stringify(user), 60 * 60 * 24);

    return user;
  }

  async findAllUsers() {
    // redis에서 조회
    const cachedUsers = await this.redis.get('users');
    if (cachedUsers) {
      return JSON.parse(cachedUsers);
    }

    const users = await this.userMapper.findAllUsers();

    if (users.length === 0) {
      throw new NotFoundError({ customMessage: "사용자가 없습니다." });
    }

    // redis에 저장
    await this.redis.set('users', JSON.stringify(users), 60 * 60 * 24);

    return users;
  }
}

/** @type {typeof _UserService} */
export const UserService = createTransactionalService(_UserService);