/**
 * PostgreSQL Database Manager Module
 * 
 * This module provides database connection and transaction management for PostgreSQL.
 * Features:
 * - Connection pooling for efficient database access
 * - Transaction management with begin, commit, and rollback
 * - Date/time type handling
 * - Implements AbstractDBManager interface for consistent database operations
 */

import dayjs from "dayjs"
import { config } from 'dotenv'
import pg from 'pg'
import { AbstractDBManager } from '../util/types/AbstractDBManager.js'

const { Pool, types } = pg

config()

// Configure datetime type conversion
types.setTypeParser(1184, (val) => {
  return dayjs(val).format('YYYY-MM-DD HH:mm:ss')
})

// Configure date type conversion
types.setTypeParser(1082, (val) => {
  return dayjs(val).format('YYYY-MM-DD')
})

// Create Pool instance
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
})


/**
 * Transaction wrapper function
 * Handles transaction lifecycle including begin, commit, rollback, and release
 *
 * @template U
 * @export
 * @async
 * @param {PgDBManager} tx - Transaction manager instance
 * @param {(tx: PgDBManager) => Promise<U>} callback - Async callback function to execute within transaction
 * @returns {Promise<U>} - Result of the callback execution
 */
export async function transaction(tx, callback) {
  await tx.begin()
  try {
    const result = await callback(tx)
    await tx.commit()
    return result
  } catch (error) {
    await tx.rollback()
    throw error
  } finally {
    tx.release()
  }
}

/**
 * PostgreSQL Database Manager class
 * Extends AbstractDBManager to implement PostgreSQL-specific database operations
 */
export class PgDBManager extends AbstractDBManager {

  /** @type {pg.Pool} @private */
  pool

  /** @type {pg.PoolClient} */
  client

  constructor() {
    super()
    this.pool = pool
  }

  /**
   * Establishes a connection to the database
   * @returns {Promise<pg.PoolClient>} Database client instance
   */
  async connect() {
    this.client = await this.pool.connect()
    return this.client
  }

  /**
   * Releases the database connection
   */
  async disconnect() {
    this.client.release()
  }

  /**
   * Begins a new transaction
   * Creates a new connection if one doesn't exist
   */
  async begin() {
    if (!this.client) {
      this.client = await this.pool.connect()
    }
    try {
      await this.client.query('BEGIN')
    } catch (error) {
      throw error
    }
  }

  /**
   * Commits the current transaction
   */
  async commit() {
    try {
      await this.client.query('COMMIT')
    } catch (error) {
      throw error
    }
  }

  /**
   * Rolls back the current transaction
   */
  async rollback() {
    try {
      await this.client.query('ROLLBACK')
    } catch (error) {
      throw error
    }
  }

  /**
   * Releases the database client connection
   */
  async release() {
    this.client.release()
  }
}