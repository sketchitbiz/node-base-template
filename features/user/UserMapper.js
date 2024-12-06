import { BaseMapper } from '../../util/types/BaseMapper.js';
import { User } from "./User.js";

/**
 *
 * @class UserMapper
 */
export class UserMapper extends BaseMapper {


  /**
   * @param {import('pg').PoolClient} client
   * @param {number} uid
   * @returns {Promise<User|null>}
   *
   */
  async findUserByUid(client, uid) {
    const query = this.createQueryBuilder(client)
      .setName('find user by id')
      .select('um.*')
      .from('link9.user_mst um')
      .where('um.uid = $uid')
      .setFields({ uid });
    
    return query.findOne();
  }
}