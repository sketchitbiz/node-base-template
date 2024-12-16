import { QueryBuilder } from '../Query.js';

/**
 * @class BaseMapper
 */
export class BaseMapper {

  /**
   * @protected
   * @param {import('pg').PoolClient} client
   * @returns {QueryBuilder}
   */
  _createQueryBuilder(client) {
    return new QueryBuilder(client);
  }
}