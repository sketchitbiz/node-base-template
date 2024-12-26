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
}

/** @type {typeof _UserService} */
export const UserService = createTransactionalService(_UserService);