import { DatabaseManager } from "../../database/DatabaseManager.js";

export class BaseService {

  /** @type {DatabaseManager} */
  #databaseManager;

  constructor() {
    this.#databaseManager = DatabaseManager.instance;
  }


  get client() {
    return this.#databaseManager.createClient();
  }


  /**
   * 트랜잭션
   * @template T
   * @protected
   * @param {TransactionCallback} callback
   * @param callback
   * @returns {Promise<T>}
   */
  withTransaction = (callback) => this.#databaseManager.withTransaction(callback);
}