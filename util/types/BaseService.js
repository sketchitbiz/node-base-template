import { DatabaseManager } from "../../database/DatabaseManager.js";

export class BaseService {

  /** @type {DatabaseManager} */
  #databaseManager;

  constructor() {
    this.#databaseManager = DatabaseManager.instance;

    // 프록시 적용
    // if (this.constructor !== BaseService) {
    //   Object.setPrototypeOf(this.constructor.prototype, createTransactionalService(this.constructor));
    // }
  }


  /**
   * 새로운 클라이언트 반환
   * @returns {Promise<import('pg').PoolClient>}
   */
  get client() {
    return this.#databaseManager.newClient;
  }


  /**
   * 트랜잭션
   * @template T
   * @protected
   * @param {TransactionCallback} callback
   * @param callback
   * @returns {Promise<T>}
   */
  withTransaction = (callback) => this.#databaseManager.transaction(callback);
}