import { createTransactionalService } from "../../util/TransactionProxy.js";
import { BaseService } from "../../util/types/BaseService.js";
import { NotFoundError } from "../../util/types/Error.js";
import { UserMapper } from "./UserMapper.js";
import { UserMst } from "./UserMst.js";

class _UserService extends BaseService {

  /** @type {UserMapper} */
  userMapper;

  constructor() {
    super();
    this.userMapper = new UserMapper();
  }

  /**
   * uid로 사용자 조회
   * @param {import('pg').PoolClient} client
   * @param {string} uid
   * @returns {Promise<UserMst>}
   */
  async findUserByUid(client, uid) {
    const user = await this.userMapper.findUserByUid(client, uid);

    if (!user) {
      throw new NotFoundError({ customMessage: '사용자를 찾을 수 없습니다.' });
    }

    return user;
  }
}

/**@type {_UserService} */
export const UserService = createTransactionalService(_UserService);