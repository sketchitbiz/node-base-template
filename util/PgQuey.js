import { camelToSnake, snakeToCamel } from './Functions.js'
import { logger } from './Logger.js'
import { AbstractQuery } from './types/AbstractQuery.js'

/**
 * PostgreSQL Query Builder Class
 * 
 * This class provides a fluent interface for building and executing PostgreSQL queries.
 * It extends AbstractQuery to support multiple database types in the future.
 * 
 * Usage Example:
 * ```javascript
 * const queryBuilder = new PgQueryBuilder(client)
 *   .setName('getUsers')
 *   .SELECT('id', 'name', 'email')
 *   .FROM('users')
 *   .WHERE('age > :age')
 *   .SET_PARAM('age', 18)
 *   .ORDER_BY({ field: 'created_at', direction: 'DESC' })
 *   .LIMIT(10)
 * 
 * const users = await queryBuilder.findMany()
 * ```
 */
export class PgQueryBuilder extends AbstractQuery {

  /** @type {import('pg').PoolClient} @private */
  client

  /**
   * Creates an instance of PgQueryBuilder.
   *
   * @constructor
   * @param {import('pg').PoolClient} client - PostgreSQL client instance
   * @throws {Error} If client is not provided
   */
  constructor(client) {
    super()

    if (!client) {
      throw new Error('Client is required')
    }

    this.client = client
  }

  /**
   * Builds the query into PostgreSQL QueryConfig format
   * 
   * This method constructs the SQL query string and parameterizes the values
   * based on the query configuration.
   * 
   * Usage Example:
   * ```javascript
   * const queryBuilder = new PgQueryBuilder(client)
   *   .setName('insertUser')
   *   .INSERT('users')
   *   .INSERT_FIELDS('name', 'email', 'age')
   *   .INSERT_VALUES(['John', 'john@example.com', 25])
   *   .RETURNING('id')
   * 
   * const query = queryBuilder.build()
   * ```
   * 
   * @returns {import('pg').QueryConfig} Object containing the query text and parameter values
   */
  build() {
    let query = ''

    // 쿼리 타입에 따라 쿼리 작성
    // create query by query type
    switch (this.query.type) {
      case 'SELECT':
        query = `SELECT ${this.query.selectFields.join(', ')} FROM ${this.query.table}`
        break

      case 'INSERT':
        let values
        if (Array.isArray(this.query.values[0])) {
          values = this.query.values.map(value =>
            `(${value.map(v => {
              if (v === null || v === undefined || v === '' || v.length === 0) return 'NULL'
              return typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v
            }).join(', ')})`
          ).join(', ')
        } else {
          values = `(${this.query.values.map(v => {
            if (v === null || v === undefined || v === '' || v.length === 0) return 'NULL'
            return typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v
          }).join(', ')})`
        }
        query = `INSERT INTO ${this.query.table} (${this.query.insertFields.join(', ')}) VALUES ${values}`
        break


      case 'UPDATE':
        let sets = Object.entries(this.query.updateSets).map(([key, value]) => `${camelToSnake(key)} = ${typeof value === 'string' ? `'${value}'` : value}`).join(', ')
        query = `UPDATE ${this.query.table} SET ${sets}`
        break

      case 'DELETE':
        query = `DELETE FROM ${this.query.table}`
        break

      default:
        throw new Error('Invalid query type')
    }

    // Join 조건 추가
    // add join condition
    for (const join of this.query.joins) {
      query += `${join.type} JOIN ${join.table} ON ${join.on}`
    }

    // Where 조건 추가
    // add where condition
    if (this.query.where.length > 0) {
      query += ` WHERE ${this.query.where.join(' ')}`
    }

    // group by 조건 추가
    // add group by condition
    if (this.query.groupBy.length > 0) {
      query += ` GROUP BY ${this.query.groupBy.join(', ')}`
    }

    // having 조건 추가
    // add having condition
    if (this.query.having.length > 0) {
      query += ` HAVING ${this.query.having.join(' ')}`
    }

    // order by 조건 추가
    // add order by condition
    if (this.query.orderBy.length > 0) {
      query += ` ORDER BY ${this.query.orderBy.join(', ')}`
    }

    // limit 조건 추가
    // add limit condition
    if (this.query.limit) {
      query += ` LIMIT ${this.query.limit}`
    }

    // offset 조건 추가
    // add offset condition
    if (this.query.offset) {
      query += ` OFFSET ${this.query.offset}`
    }

    // Return 조건 추가
    // add return condition
    if (this.query.returning) {
      query += ` RETURNING ${this.query.returningFields.join(', ')}`
    }

    query += ';'

    const values = []
    const paramList = Object.keys(this.query.params).sort((a, b) => b.length - a.length)
    let index = 1
    logger.debug(`Query: ${this.name}`, { query, params: this.query.params })
    paramList.forEach(key => {
      const newSql = query.replace(new RegExp(`:${key}`, 'g'), `$${index}`)

      if (newSql !== query) {
        query = newSql
        values.push(this.query.params[key])
        index++
      }
    })

    /** @type {import('pg').QueryConfig} */
    const result = {
      text: query,
      values: values,
    }

    logger.debug(`Raw Query: ${this.name}`, result)

    return result
  }

  /**
   * Builds a raw SQL query with parameterized values
   * 
   * This method is used when you want to execute a custom SQL query
   * while still maintaining parameter safety.
   * 
   * Usage Example:
   * ```javascript
   * const queryBuilder = new PgQueryBuilder(client)
   *   .setName('customQuery')
   *   .rawQuery('SELECT * FROM users WHERE age > :age')
   *   .SET_PARAM('age', 18)
   * 
   * const query = queryBuilder.rawQueryBuild()
   * ```
   * 
   * @returns {import('pg').QueryConfig} Object containing the raw query text and parameter values
   */
  rawQueryBuild() {
    let query = this._rawQuery
    const paramList = Object.keys(this.query.params).sort((a, b) => b.length - a.length)
    let index = 1

    const values = []
    paramList.forEach(key => {
      const newSql = query.replace(new RegExp(`:${key}`, 'g'), `$${index}`)

      if (newSql !== query) {
        query = newSql
        values.push(this.query.params[key])
        index++
      }
    })

    /** @type {import('pg').QueryConfig} */
    const result = {
      text: query,
      values: values,
    }

    logger.debug(`Raw Query: ${this.name}`, result)

    return result
  }

  /**
   * Executes a query and returns multiple rows
   * 
   * Usage Example:
   * ```javascript
   * const queryBuilder = new PgQueryBuilder(client)
   *   .setName('getUsers')
   *   .SELECT('id', 'name', 'email')
   *   .FROM('users')
   *   .WHERE('age > :age')
   *   .SET_PARAM('age', 18)
   *   .GROUP_BY(['age'])
   *   .HAVING('count(*) > 5')
   *   .ORDER_BY({ field: 'created_at', direction: 'DESC' })
   *   .LIMIT(10)
   *   .OFFSET(0)
   * 
   * const users = await queryBuilder.findMany()
   * ```
   * 
   * @template T
   * @async
   * @returns {Promise<T[] | null>} Array of results or null if no rows found
   */
  async findMany() {
    const query = this.build()
    const { rows, rowCount } = await this.client.query(query)

    if (rowCount === 0) {
      return null
    }

    return snakeToCamel(rows)
  }

  /**
   * Executes a query and returns a single row
   * 
   * Usage Example:
   * ```javascript
   * const queryBuilder = new PgQueryBuilder(client)
   *   .setName('getUser')
   *   .SELECT('id', 'name', 'email')
   *   .FROM('users')
   *   .WHERE('id = :id')
   *   .SET_PARAM('id', 1)
   *   .JOIN({
   *     type: 'LEFT',
   *     table: 'profiles',
   *     on: 'users.id = profiles.user_id'
   *   })
   * 
   * const user = await queryBuilder.findOne()
   * ```
   * 
   * @template T
   * @async
   * @returns {Promise<T | null>} Single result or null if no row found
   */
  async findOne() {
    const query = this.build()
    const { rows, rowCount } = await this.client.query(query)

    if (rowCount === 0) {
      return null
    }

    return snakeToCamel(rows[0])
  }

  /**
   * Executes a query and returns results based on row count
   * 
   * This method is typically used for INSERT, UPDATE, or DELETE operations
   * where you want to return the affected rows.
   * 
   * Usage Example:
   * ```javascript
   * const queryBuilder = new PgQueryBuilder(client)
   *   .setName('updateUser')
   *   .UPDATE('users')
   *   .UPDATE_FIELDS({
   *     name: 'John Doe',
   *     email: 'john@example.com'
   *   })
   *   .WHERE('id = :id')
   *   .SET_PARAM('id', 1)
   *   .RETURNING('id', 'name', 'email')
   * 
   * const result = await queryBuilder.exec()
   * ```
   * 
   * @template T
   * @async
   * @returns {Promise<T | T[] | null>} Result(s) or null if no rows affected
   */
  async exec() {
    const query = this.build()
    const { rows, rowCount } = await this.client.query(query)

    if (rowCount > 1) {
      return snakeToCamel(rows)
    } else if (rowCount === 1) {
      return snakeToCamel(rows[0])
    }

    return
  }

  /**
   * Executes a raw SQL query and returns multiple rows
   * 
   * Usage Example:
   * ```javascript
   * const queryBuilder = new PgQueryBuilder(client)
   *   .setName('customSelect')
   *   .rawQuery('SELECT u.*, p.bio FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.age > :age')
   *   .SET_PARAM('age', 18)
   * 
   * const users = await queryBuilder.rawFindMany()
   * ```
   * 
   * @template T
   * @async
   * @returns {Promise<T[] | null>} Array of results or null if no rows found
   */
  async rawFindMany() {
    const query = this.rawQueryBuild()
    const { rows, rowCount } = await this.client.query(query)

    if (rowCount === 0) {
      return null
    }

    return snakeToCamel(rows)
  }

  /**
   * Executes a raw SQL query and returns a single row
   * 
   * Usage Example:
   * ```javascript
   * const queryBuilder = new PgQueryBuilder(client)
   *   .setName('customSelectOne')
   *   .rawQuery('SELECT u.*, p.bio FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.id = :id')
   *   .SET_PARAM('id', 1)
   * 
   * const user = await queryBuilder.rawFindOne()
   * ```
   * 
   * @template T
   * @async
   * @returns {Promise<T | null>} Single result or null if no row found
   */
  async rawFindOne() {
    const query = this.rawQueryBuild()
    const { rows, rowCount } = await this.client.query(query)

    if (rowCount === 0) {
      return null
    }

    return snakeToCamel(rows[0])
  }

  /**
   * Executes a raw SQL query and returns results based on row count
   * 
   * This method is used for executing custom SQL queries that return
   * affected rows from INSERT, UPDATE, or DELETE operations.
   * 
   * Usage Example:
   * ```javascript
   * const queryBuilder = new PgQueryBuilder(client)
   *   .setName('customInsert')
   *   .rawQuery('INSERT INTO users (name, email) VALUES (:name, :email) RETURNING id, name, email')
   *   .SET_PARAMS({
   *     name: 'John Doe',
   *     email: 'john@example.com'
   *   })
   * 
   * const result = await queryBuilder.rawExec()
   * ```
   * 
   * @template T
   * @async
   * @returns {Promise<T | T[] | null>} Result(s) or null if no rows affected
   */
  async rawExec() {
    const query = this.rawQueryBuild()
    const { rows, rowCount } = await this.client.query(query)

    if (rowCount > 1) {
      return snakeToCamel(rows)
    } else if (rowCount === 1) {
      return snakeToCamel(rows[0])
    }

    return
  }
}


