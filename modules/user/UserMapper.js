import { createClientImportMapper } from '../../database/TransactionProxy.js';
import { BaseMapper } from '../../util/types/BaseMapper.js';
import { UserMst } from "./UserMst.js";


/**
 *
 * @class UserMapper
 */
class _UserMapper extends BaseMapper {

  /**
   * @param {{client?: import('pg').PoolClient, uid: string}} params
   * @returns {Promise<UserMst|null>}
   */
  async findUserByUid({ client, uid }) {
    // @ts-ignore
    const query = this._createQueryBuilder(client)
      .setName('findUserByUid')
      .select('um.*')
      .from('link9.user_mst um')
      .where('um.uid = :uid')
      .setParams({ uid });

    return query.findOne();
  }
}


/** @type {typeof _UserMapper} */
export const UserMapper = createClientImportMapper(_UserMapper);