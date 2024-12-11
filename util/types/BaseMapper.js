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
  createQueryBuilder(client) {
    return new QueryBuilder(client);
  }
}