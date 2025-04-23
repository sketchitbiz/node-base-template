
/**
 * Abstract Database Manager
 * 
 * This is an abstract class for database connection and transaction management.
 * Currently only PostgreSQL is used, but this abstraction allows for easy integration
 * of other database systems in the future. When adding a new database type,
 * simply create a new manager class that extends this abstract class.
 * 
 * Usage Example:
 * ```javascript
 * // Implementation example in a concrete class
 * class PostgresDBManager extends AbstractDBManager {
 *   async connect() {
 *     this.client = await pool.connect();
 *     return this.client;
 *   }
 *   
 *   async begin() {
 *     await this.client.query('BEGIN');
 *   }
 *   
 *   // Other method implementations...
 * }
 * 
 * // Using the manager in application code
 * const dbManager = new PostgresDBManager();
 * await dbManager.connect();
 * await dbManager.begin();
 * try {
 *   // Database operations
 *   await dbManager.commit();
 * } catch (error) {
 *   await dbManager.rollback();
 *   throw error;
 * } finally {
 *   await dbManager.release();
 * }
 * ```
 *
 * @export
 * @abstract
 * @class AbstractDBManager
 */
export class AbstractDBManager {

  /** @type {any} */
  client;

  /**
   * Connect to the database
   *
   * @abstract
   * @memberof AbstractDBManager
   * @returns {Promise<any>} Database client or connection
   */
  connect() {
    throw new Error('connect() is not implemented');
  }

  /**
   * Disconnect from the database
   *
   * @abstract
   * @memberof AbstractDBManager
   * @returns {Promise<any>}
   */
  disconnect() {
    throw new Error('disconnect() is not implemented');
  }

  /**
   * Begin a transaction
   *
   * @abstract
   * @memberof AbstractDBManager
   * @returns {Promise<any>}
   */
  begin() {
    throw new Error('begin() is not implemented');
  }

  /**
   * Commit a transaction
   *
   * @abstract
   * @memberof AbstractDBManager
   * @returns {Promise<any>}
   */
  commit() {
    throw new Error('commit() is not implemented');
  }

  /**
   * Rollback a transaction
   *
   * @abstract
   * @memberof AbstractDBManager
   * @returns {Promise<any>}
   */
  rollback() {
    throw new Error('rollback() is not implemented');
  }

  /**
   * Release the database connection
   *
   * @abstract
   * @memberof AbstractDBManager
   * @returns {Promise<any>}
   */
  release() {
    throw new Error('release() is not implemented');
  }
}
