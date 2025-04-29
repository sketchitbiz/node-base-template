import dayjs from 'dayjs'
import { config } from 'dotenv'
import pg from 'pg'
import { AbstractDBManager } from '../util/types/AbstractDBManager'
const { Pool, types } = pg

config()

// datetime 변환
types.setTypeParser(1184, val => dayjs(val).format('YYYY-MM-DD HH:mm:ss'))

// date 변환
types.setTypeParser(1083, val => dayjs(val).format('YYYY-MM-DD'))

//
// const { DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, PORT } = process.env;
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
  max: 100,
  min: 10,
  // user: DB_USER,
  // host: DB_HOST,
  // database: DB_NAME,
  // password: DB_PASSWORD,
  // port: Number(PORT),
  // min: 10,
  // max: 100
})

export async function transaction<U>(tx: PgDBManager, callback: (tx: PgDBManager) => Promise<U>) {
  await tx.begin()
  try {
    const result = await callback(tx)
    await tx.commit()
    return result
  }
  catch (e) {
    await tx.rollback()
    throw e
  } finally {
    tx.release()
  }
}

export class PgDBManager extends AbstractDBManager<pg.PoolClient> {


  declare client: pg.PoolClient
  pool: pg.Pool

  constructor() {
    super()
    this.pool = pool
  }

  async connect(): Promise<pg.PoolClient> {
    this.client = await this.pool.connect()
    return this.client
  }

  async begin(): Promise<pg.PoolClient> {
    if (!this.client) {
      this.client = await this.pool.connect()
    }
    try {
      await this.client.query('BEGIN')
      return this.client
    } catch (e) {
      throw e
    }
  }
  async commit(): Promise<void> {
    try {
      await this.client.query('COMMIT')
    } catch (e) {
      throw e
    }
  }

  async rollback(): Promise<void> {
    try {
      await this.client.query('ROLLBACK')
    } catch (e) {
      throw e
    }
  }
  async release(): Promise<void> {
    this.client.release()
  }

  async disconnect(): Promise<void> {
    this.client.release()
  }
}
