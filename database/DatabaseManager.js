import dayjs from "dayjs";
import pg from 'pg';
import { logger } from "../util/Logger.js";

const { Pool, types } = pg;

/**
 * 트랜잭션 콜백
 * @template T
 * @typedef {function} TransactionCallback
 * @property {import('pg').PoolClient} client - 클라이언트 객체
 * @returns {Promise<T>} - The result of the callback function.
 */

export class DatabaseManager {
  static #instance;
  #pool;

  constructor() {
    this.#pool = new Pool({
      user : process.env.DB_USER,
      host : process.env.DB_HOST,
      database : process.env.DB_NAME,
      password : process.env.DB_PASSWORD,
      port : process.env.DB_PORT,
      max : 40,
    });

    // datetime 변환
    types.setTypeParser(1184, (val) => {
      return dayjs(val).format('YYYY-MM-DD HH:mm:ss');
    });

    // date 변환
    types.setTypeParser(1082, (val) => {
      return dayjs(val).format('YYYY-MM-DD');
    });
  }

  static get instance() {
    if (!DatabaseManager.#instance) {
      DatabaseManager.#instance = new DatabaseManager();
    }
    return DatabaseManager.#instance;
  }


  createClient() {
    return this.#pool.connect();
  }


  /**
   *
   * 트랜잭션
   * @template T
   * @param { TransactionCallback } callback
   * @returns {Promise<T>} - The result of the callback function.
   * @throws {Error} - Throws an error if the transaction fails and is rolled back.
   */
  async withTransaction(callback) {
    const client = await this.#pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      // return BaseResult.error({ statusCode : 500, message : error.message, error });
      throw error;
    } finally {
      client.release();
    }
  }

  async getClient() {
    return this.#pool.connect();
  }

  async connect() {
    await this.#pool.connect();
    logger.info('Database connected');
  }

}