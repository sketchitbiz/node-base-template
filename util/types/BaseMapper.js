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
  * Create a database client and execute the callback function
  * @template T
  * @protected
  * @param {(query: AbstractQuery) => Promise<T>} callback - Callback function that takes a database client as an argument
  * @returns {Promise<T>} The result of executing the callback function
  * @throws {Error} Error thrown during execution of the callback function
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
