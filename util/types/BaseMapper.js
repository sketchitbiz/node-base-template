import { QueryBuilder } from '../Query.js';

/**
 * @class BaseMapper
 */
export class BaseMapper {

  /**
   * @protected
   * @param {import('pg').PoolClient} [client]
   * @returns {QueryBuilder}
   */
  _createQueryBuilder(client) {
    if (!client) {
      throw new Error('Client is required');
    }

    return new QueryBuilder(client);
  }
}