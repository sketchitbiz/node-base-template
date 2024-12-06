import { BaseService } from "../../util/types/BaseService.js";
import { UserMapper } from "./UserMapper.js";
import { ServerResponse } from "../../util/types/ServerResponse.js";
import { User } from "./User.js";
import { logger } from "../../util/Logger.js";
import { NotFoundError } from "../../util/types/Error.js";

export class UserService extends BaseService {

  /** @type {UserMapper} */
  userMapper;

  constructor() {
    super();
    this.userMapper = new UserMapper();
  }

  /**
   * uid로 사용자 조회
   * @param {string} uid
   * @returns {Promise<ServerResponse<User>>}
   */
  async findUserByUid(uid) {
    try {
      const user = await this.userMapper.findUserByUid(await this.client, uid);

      if (!user) {
        throw new NotFoundError({ customMessage : '사용자를 찾을 수 없습니다.' });
      }

      return ServerResponse.data(user);
    } catch (e) {
      logger.error('Error: ', e);

      return ServerResponse.fromError(e);
    }
  }
}