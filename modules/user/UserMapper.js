import { createClientImportMapper } from '../../util/TransactionProxy.js';
import { BaseMapper } from '../../util/types/BaseMapper.js';
import { UserMst } from "./UserMst.js";

/**
 *
 * @class UserMapper
 */
class _UserMapper extends BaseMapper {


  /**
  //  * @param {import('pg').PoolClient} client
   * @param {number} uid
   * @returns {Promise<UserMst|null>}
   *
   */
  async findUserByUid({ client, uid }) {
    const query = this._createQueryBuilder(client)
      .setName('find user by id')
      .select('um.*')
      .from('link9.user_mst um')
      .where('um.uid = $uid')
      .setFields({ uid });

    return query.findOne();
  }
}



/**@type {_UserMapper} */
export const UserMapper = createClientImportMapper(_UserMapper);