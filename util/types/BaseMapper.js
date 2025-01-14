import { PgDBManager } from '../../database/DatabaseManager.js';
import { getManager } from '../../database/TransactionProxy.js';
import { logger } from '../Logger.js';
import { PgQueryBuilder } from '../PgQuey.js';
import { AbstractDBManager } from './AbstractDBManager.js';
import { AbstractQuery } from './AbstractQuery.js';

/**
 * @class BaseMapper
 */
export class BaseMapper {
  /**
  * 데이터베이스 클라이언트를 생성하고 콜백 함수를 실행합니다
  * @template T
  * @protected
  * @param {(query: AbstractQuery) => Promise<T>} callback - 데이터베이스 클라이언트를 인자로 받는 콜백 함수
  * @returns {Promise<T>} 콜백 함수의 실행 결과
  * @throws {Error} 콜백 함수 실행 중 발생한 에러
  */
  async exec(callback) {
    /** @type {AbstractDBManager} */
    let manager = getManager();
    let client;
    if (!manager) {
      manager = new PgDBManager();
      await manager.connect();
      client = manager.client;
    } else {
      client = manager.client;
    }
    try {
      return await callback(new PgQueryBuilder(client));
    } catch (error) {
      logger.error(error);
      throw error;
    } finally {
      if (!getManager()) {
        client.release();
      }
    }
  }
}
