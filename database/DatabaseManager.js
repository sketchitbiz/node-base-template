import dayjs from "dayjs";
import { config } from 'dotenv';
import pg from 'pg';
import { logger } from "../util/Logger.js";

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
  database: 'test',
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
 * 새로운 클라이언트 반환
 * @returns {Promise<import('pg').PoolClient>}
 */
export const getNewClient = () => {
  return pool.connect();
};

/**
 * 트랜잭션 시작
 * @returns {Promise<import('pg').PoolClient>}
 */
export const begin = async () => {
  const client = await pool.connect();
  try {
    logger.debug('BEGIN');
    await client.query('BEGIN');
    return client;
  } catch (error) {
    await rollback(client);
    throw error;
  }
};

/**
 * 트랜잭션 커밋
 * @param {import('pg').PoolClient} client
 * @returns {Promise<void>}
 */
export const commit = async (client) => {
  try {
    logger.debug('COMMIT');
    await client.query('COMMIT');
  } catch (error) {
    await rollback(client);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * 트랜잭션 롤백
 * @param {import('pg').PoolClient} client
 * @returns {Promise<void>}
 */
export const rollback = async (client) => {
  try {
    logger.debug('ROLLBACK');
    await client.query('ROLLBACK');
  } catch (error) {
    logger.error(error);
  } finally {
    client.release();
  }
};

/**
 * 트랜잭션 실행
 * @template T
 * @param {function(import('pg').PoolClient): Promise<T>} callback
 * @returns {Promise<T>}
 * @throws {Error}
 */
export const transaction = async (callback) => {
  const client = await begin();
  try {
    const result = await callback(client);
    await commit(client);
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * DB 연결
 * @returns {Promise<void>}
 */
export const connect = async () => {
  await pool.connect();
  logger.info('Database connected');
};

