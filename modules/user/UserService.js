import { BaseService } from "../../util/types/BaseService.js";
import { UserMapper } from "./UserMapper.js";
import { UserMst } from "./UserMst.js";
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
   * @returns {Promise<UserMst>}
   */
  async findUserByUid(uid) {
    const client = await this.client;
    const user = await this.userMapper.findUserByUid(client, uid);

    if (!user) {
      throw new NotFoundError({ customMessage : '사용자를 찾을 수 없습니다.' });
    }

    return user;
  }
}