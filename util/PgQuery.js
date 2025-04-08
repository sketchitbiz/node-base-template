import { size } from 'es-toolkit/compat'
import { snakeToCamel } from './Functions.js'
import { logger } from './Logger.js'
import { AbstractQuery } from './types/AbstractQuery.js'

/**
 * PostgreSQL 쿼리 빌더 클래스
 * 현재는 PostgreSQL 하나만 사용하고 있어, AbstractQuery 클래스를 상속받고 있습니다만,
 * 추후에 다른 데이터베이스를 도입하게 되면 해당 DB에 맞춘 쿼리빌더 클래스를 AbstractQuery 클래스를 상속받아 구현하면 됩니다.
 * 
 * PostgreSQL query builder class
 * for now, only PostgreSQL is used, but if other databases are introduced,
 * you can implement the corresponding DB query builder class by inheriting the AbstractQuery class.
 */
export class PgQueryBuilder extends AbstractQuery {

  /** @type {import('pg').PoolClient} @private */
  client


  /**
   * Creates an instance of PgQueryBuilder.
   *
   * @constructor
   * @param {import('pg').PoolClient} client
   */
  constructor(client) {
    super()

    if (!client) {
      throw new Error('Client is required')
    }

    this.client = client
  }


  /**
   * 쿼리 빌드
   * build the query info pg QueryConfig format                                                                                                                                                                                                                                                                                                                                                                                                                                           
   * @returns {import('pg').QueryConfig}
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
        if (Array.isArray(this.query.values) && Array.isArray(this.query.values[0])) {
          // 다중 행 INSERT
          const paramCount = this.query.insertFields.length
          const rowCount = this.query.values.flat().length

          // $1, $2, $3 형식의 파라미터 그룹 생성
          const paramGroups = []
          const params = [...this.query.values.flat().flat()]

          for (let i = 0; i < rowCount; i++) {
            const start = i * paramCount + 1
            paramGroups.push(`(${Array.from({ length: paramCount }, (_, j) => `$${start + j}`).join(', ')})`)
          }

          query = `INSERT INTO ${this.query.table} (${this.query.insertFields.join(', ')}) VALUES ${paramGroups.join(', ')}`
          this.query.values = params
        } else {
          // 단일 행 INSERT
          const paramNames = this.query.values.map((_, idx) => `$${idx + 1}`)
          query = `INSERT INTO ${this.query.table} (${this.query.insertFields.join(', ')}) VALUES (${paramNames.join(', ')})`
          this.query.values = this.query.values
        }
        break

      case 'UPDATE':
        query = `UPDATE ${this.query.table} SET `
        query += Object.entries(this.query.updateSets)
          .map(([key, value], idx) => `${key} = $${idx + 1}`)
          .join(', ')
        this.query.params = Object.values(this.query.updateSets)
        break

      case 'DELETE':
        query = `DELETE FROM ${this.query.table}`
        break

      default:
        throw new Error('Query type not specified')
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
      query += ` ORDER BY ${this.query.orderBy
        .map(sort => `${sort.field} ${sort.direction}`)
        .join(', ')}`
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

    let values = []
    if (size(this.query.params) > 0) {

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
    } else {
      values = this.query.values
    }

    /** @type {import('pg').QueryConfig} */
    const result = {
      text: query,
      values: values,
    }

    logger.debug(`Raw Query: ${this.name}`, result)

    return result
  }

  /**
   * Build raw query
   * @protected
   * @returns {import('pg').QueryConfig}
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
   * 많은 데이터를 조회하는 쿼리
   * @template T
   * @async
   * @returns {Promise<T[] | null>}
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
   * 하나의 데이터를 조회하는 쿼리
   * @template T
   * @async
   * @returns {Promise<T | null>}
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
   * 쿼리 실행
   * @template T
   * @async
   * @returns {Promise<T | null>}
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
   * 많은 데이터를 조회하는 쿼리
   * @template T
   * @async
   * @returns {Promise<T[] | null>}
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
   * 하나의 데이터를 조회하는 쿼리
   * @template T
   * @async
   * @returns {Promise<T | null>}
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
   * 쿼리 실행
   * @template T
   * @async
   * @returns {Promise<T | null>}
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


