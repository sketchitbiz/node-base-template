import { QueryBuilder } from '../Query.js';

/**
 * @class BaseMapper
 */
export class BaseMapper {

  /**
   * @param {import('pg').PoolClient} client
   * @returns {QueryBuilder}
   */
  createQueryBuilder(client) {
    return new QueryBuilder(client);
  }
}