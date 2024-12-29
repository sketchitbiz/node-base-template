import { BaseMapper } from '../../util/types/BaseMapper.js';
import { UserMst } from "./UserMst.js";


/**
 *
 * @class UserMapper
 */
export class UserMapper extends BaseMapper {

  /**
   * uid로 사용자 조회
   * @param {string} uid - 사용자 uid
   * @returns {Promise<UserMst|null>} 사용자 정보
   */
  async findUserByUid(uid) {
    return this.exec(async query => query.setName('findUserByUid')
      .select('um.*')
      .from('link9.user_mst um')
      .where('um.uid = :uid')
      .setParams({ uid })
      .findOne()
    );
  }


  /**
   * 모든 사용자 조회
   * @returns {Promise<UserMst[]>} 사용자 목록
   */
  async findAllUsers() {
    return this.exec(async query => query.setName('findAllUsers')
      .select('um.*')
      .from('link9.user_mst um')
      .findMany()
    );
  }
}