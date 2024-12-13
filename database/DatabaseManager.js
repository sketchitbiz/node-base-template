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

  /** @type {import('pg').Pool} */
  #pool;

  constructor() {
    this.#pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      max: 40,
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


  /**
   * 인스턴스 조회
   *
   * @static
   * @readonly
   * @type {DatabaseManager}
   */
  static get instance() {
    if (!DatabaseManager.#instance) {
      DatabaseManager.#instance = new DatabaseManager();
    }
    return DatabaseManager.#instance;
  }

  /**
   * 새로운 클라이언트 반환
   * @returns {Promise<import('pg').PoolClient>}
   */
  get newClient() {
    return this.#pool.connect();
  }

  /**
   * 트랜잭션 시작
   * @returns {Promise<import('pg').PoolClient>}
   */
  async begin() {
    const client = await this.#pool.connect();
    try {
      await client.query('BEGIN');
      return client;
    } catch (error) {
      client.release();
      throw error;
    }
  }

  /**
   * 트랜잭션 커밋
   * @param {import('pg').PoolClient} client
   * @returns {Promise<void>}
   */
  async commit(client) {
    try {
      await client.query('COMMIT');
    } finally {
      client.release();
    }
  }

  /**
   * 트랜잭션 롤백
   * @param {import('pg').PoolClient} client
   * @returns {Promise<void>}
   */
  async rollback(client) {
    try {
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  }

  /**
   * 트랜잭션 실행
   * @template T
   * @param {TransactionCallback} callback
   * @returns {Promise<T>}
   * @throws {Error}
   */
  async transaction(callback) {
    const client = await this.begin();
    try {
      const result = await callback(client);
      await this.commit(client);
      return result;
    } catch (error) {
      await this.rollback(client);
      throw error;
    }
  }

  async connect() {
    await this.#pool.connect();
    logger.info('Database connected');
  }
}