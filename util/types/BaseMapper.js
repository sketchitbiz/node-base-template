import { getNewClient } from '../../database/DatabaseManager.js';
import { getClient } from '../../database/TransactionProxy.js';
import { logger } from '../Logger.js';
import { QueryBuilder } from '../Query.js';

/**
 * @class BaseMapper
 */
export class BaseMapper {

  // /**
  //  * @protected
  //  * @param {import('pg').PoolClient} [client]
  //  * @returns {QueryBuilder}
  //  */
  // _createQueryBuilder(client) {
  //   if (!client) {
  //     throw new Error('Client is required');
  //   }

  //   return new QueryBuilder(client);
  // }


  /**
   * 데이터베이스 클라이언트를 생성하고 콜백 함수를 실행합니다
   * @template T
   * @protected
   * @param {(query: QueryBuilder) => Promise<T>} callback - 데이터베이스 클라이언트를 인자로 받는 콜백 함수
   * @returns {Promise<T>} 콜백 함수의 실행 결과
   * @throws {Error} 콜백 함수 실행 중 발생한 에러
   */
  async exec(callback) {
    /** @type {import('pg').PoolClient} */
    let client = getClient();
    if (!client) {
      client = await getNewClient();
    }
    try {
      return await callback(new QueryBuilder(client));
    } catch (error) {
      logger.error(error);
      throw error;
    } finally {
      if (!getClient()) {
        client.release();
      }
    }
  }
}