import { size } from 'es-toolkit/compat'
import type { PoolClient, QueryConfig } from 'pg'
import { camelToSnake, snakeToCamel } from './Functions.js'
import { logger } from './Logger.js'
import { AbstractQuery } from './types/AbstractQuery.js'

export class PgQueryBuilder<T> extends AbstractQuery<T> {


  private _client: PoolClient

  constructor(client: PoolClient) {
    super()
    if (!client) {
      throw new Error('Database client is required')
    }
    this._client = client

  }

  get client(): PoolClient {
    return this._client
  }


  build(): QueryConfig {
    if (!this.query) {
      throw new Error('Query is Required!')
    }

    let query: string

    // 쿼리 타입에 따라 쿼리 작성
    switch (this.query.type) {
      case 'SELECT':
        query = `SELECT ${Array.isArray(this.query.selectFields) ? this.query.selectFields.map(v => camelToSnake(v)).join(', ') : this.query.selectFields} FROM ${this.query.table}`
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
        query = `UPDATE ${this.query.table} SET ${Object.entries(this.query.updateSets).map(([key, value]) => `${key} = ${value}`).join(', ')}`
        break
      case 'DELETE':
        query = `DELETE FROM ${this.query.table}`
        break
      default:
        throw new Error('Invalid query type')
    }

    // 조인 조건 추가
    for (const join of this.query.joins) {
      query += ` ${join.type} JOIN ${join.table} ON ${join.on}`
    }

    // 조건절 추가
    if (this.query.where.length > 0) {
      query += ` WHERE ${this.query.where.join(' ')}`
    }

    // 그룹핑 조건 추가
    if (this.query.groupBy.length > 0) {
      query += ` GROUP BY ${this.query.groupBy.join(', ')}`
    }


    // Having절 추가
    if (this.query.having.length > 0) {
      query += ` HAVING ${this.query.having.join(' ')}`
    }

    // 정렬 조건 추가
    if (this.query.orderBy.length > 0) {
      query += ` ORDER BY ${this.query.orderBy.map((order) => `${order.field} ${order.direction}`).join(', ')}`
    }

    // 제한 조건 추가
    if (this.query.limit !== null) {
      query += ` LIMIT ${this.query.limit}`
    }

    // 오프셋 조건 추가
    if (this.query.offset !== null) {
      query += ` OFFSET ${this.query.offset}`
    }

    // 반환 조건 추가
    if (this.query.returning) {
      query += ` RETURNING ${this.query.returningFields.join(', ')}`
    }

    query += `;`

    let values: any[] = []
    if (size(this.query.params) > 0) {
      const paramList = Object.keys(this.query.params).sort((a, b) => b.length - a.length)
      let index = this.query.values ? this.query.values.length + 1 : 1

      // UPDATE SET 값들과 WHERE 파라미터를 모두 포함하여 로깅
      const allParams = {
        ...Object.fromEntries(
          Object.entries(this.query.updateSets || {}).map(([key, value]) => [`${key}`, value])
        ),
        ...this.query.params
      }
      logger.debug(`Query: ${this.name}`, { params: allParams, query })

      paramList.forEach(key => {
        const newSql = query.replace(new RegExp(`:${key}`, 'g'), `$${index}`)

        if (newSql !== query) {
          query = newSql
          values.push(this.query.params[key])
          index++
        }
      })

      // values 배열에 UPDATE SET 값들을 먼저 추가
      if (this.query.values) {
        values = [...this.query.values, ...values]
      }
    } else {
      values = this.query.values || []
    }


    const result: QueryConfig = {
      name: this.name,
      text: query,
      values
    }

    logger.debug(`Raw Query: ${result.name}`, result)
    return result
  }

  rawQueryBuild() {
    let query = this._rawQuery
    const paramList = Object.keys(this.query.params).sort((a, b) => b.length - a.length)
    let index = 1

    const values: any[] = []
    paramList.forEach(key => {
      const newSql = query.replace(new RegExp(`:${key}`, 'g'), `$${index}`)
      if (newSql !== query) {
        query = newSql
        values.push(this.query.params[key])
        index++
      }
    })

    const queryConfig: QueryConfig = {
      name: this.name,
      text: query,
      values
    }

    logger.debug(`Raw Query: ${queryConfig.name}`, queryConfig)
    return queryConfig
  }

  async findMany<T = any>() {
    const query = this.build()

    const { rows } = await this.client.query(query)
    if (rows.length === 0) {
      return null
    }

    return snakeToCamel(rows) as T[]
  }

  async findOne<T = any>() {
    const query = this.build()

    const { rows } = await this.client.query(query)
    if (rows.length === 0) {
      return null
    }

    return snakeToCamel(rows[0]) as T
  }

  async exec<T>(): Promise<T | null> {
    const query = this.build()
    // logger.debug(query);
    const { rows } = await this.client.query(query)

    if (rows.length > 1) {
      return snakeToCamel(rows) as T
    } else if (rows.length === 1) {
      return snakeToCamel(rows[0]) as T
    }

    return null
  }

  async rawFindMany<T = any>() {
    const query = this.rawQueryBuild()
    const { rows } = await this.client.query(query)

    if (rows.length === 0) {
      return null
    }

    return snakeToCamel(rows) as T[]
  }

  async rawFindOne<T = any>() {
    const query = this.rawQueryBuild()
    const { rows } = await this.client.query(query)
    if (rows.length === 0) {
      return null
    }
    return snakeToCamel(rows[0]) as T
  }

  async rawExec<T = any>() {
    const query = this.rawQueryBuild()
    const { rows } = await this.client.query(query)
    if (rows.length > 1) {
      return snakeToCamel(rows) as T[]
    } else if (rows.length === 1) {
      return snakeToCamel(rows[0]) as T
    }

    return
  }
}
