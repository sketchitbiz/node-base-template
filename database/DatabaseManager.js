import dayjs from "dayjs";
import { config } from 'dotenv';
import pg from 'pg';
import { AbstractDBManager } from '../util/types/AbstractDBManager.js';

const { Pool, types } = pg;

config();

// datetime 변환 설정
types.setTypeParser(1184, (val) => {
  return dayjs(val).format('YYYY-MM-DD HH:mm:ss');
});

// date 변환 설정
types.setTypeParser(1082, (val) => {
  return dayjs(val).format('YYYY-MM-DD');
});

// Pool 인스턴스 생성
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
  max: 100,
  min: 10,
  // user: process.env.DB_USER,
  // host: process.env.DB_HOST,
  // database: process.env.DB_NAME,
  // password: process.env.DB_PASSWORD,
  // port: Number(process.env.DB_PORT),
  // max: 40,
  // min: 10
});


/**
 * 트랜잭션 
 *

 * @template U
 * @export
 * @async
 * @param {PgDBManager} tx
 * @param {(tx: PgDBManager) => Promise<U>} callback
 * @returns {Promise<U>}
 */
export async function transaction(tx, callback) {
  await tx.begin();
  try {
    const result = await callback(tx);
    await tx.commit();
    return result;
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally {
    tx.release();
  }
}
export class PgDBManager extends AbstractDBManager {

  /** @type {pg.Pool} @private */
  pool;

  /** @type {pg.PoolClient} */
  client;

  constructor() {
    super();
    this.pool = pool;
  }

  async connect() {
    this.client = await this.pool.connect();
    return this.client;
  }

  async disconnect() {
    this.client.release();
  }

  async begin() {
    if (!this.client) {
      this.client = await this.pool.connect();
    }
    try {
      await this.client.query('BEGIN');
    } catch (error) {
      throw error;
    }
  }

  async commit() {
    try {
      await this.client.query('COMMIT');
    } catch (error) {
      throw error;
    }
  }

  async rollback() {
    try {
      await this.client.query('ROLLBACK');
    } catch (error) {
      throw error;
    }
  }

  async release() {
    this.client.release();
  }
}