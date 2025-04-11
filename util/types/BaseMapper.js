import { PgDBManager } from '../../database/DatabaseManager.js'
import { getManager } from '../../database/TransactionProxy.js'
import { logger } from '../Logger.js'
import { PgQueryBuilder } from '../PgQuery.js'

import { AbstractDBManager } from './AbstractDBManager.js'
import { AbstractQuery } from './AbstractQuery.js'

/**
 * @class BaseMapper
 */
export class BaseMapper {
  /**
  * Create a database client and execute the callback function
  * @template T
  * @protected
  * @param {(query: AbstractQuery) => Promise<T>} callback - Callback function that takes a database client as an argument
  * @returns {Promise<T>} The result of executing the callback function
  * @throws {Error} Error thrown during execution of the callback function
  */
  async exec(callback) {
    /** @type {AbstractDBManager} */
    let manager = getManager()
    let client
    if (!manager) {
      manager = new PgDBManager()
      await manager.connect()
      client = manager.client
    } else {
      client = manager.client
    }
    try {
      return await callback(new PgQueryBuilder(client))
    } catch (error) {
      logger.error(error)
      throw error
    } finally {
      if (!getManager()) {
        client.release()
      }
    }
  }



  /**
   * 테이블의 모든 레코드 수를 반환합니다.
   * Returns the total count of all records in a table.
   * 
   * @param {string} table 조회할 테이블 이름 / Table name to query
   * @returns {Promise<number>} 테이블의 총 레코드 수 / Total count of records in the table
   */
  async allCount(table) {
    const result = await this.exec(q =>
      q.setName(`${table}AllCount`)
        .SELECT('CAST(COUNT(*) AS INTEGER) AS all_cnt')
        .FROM(table)
        .findOne()
    )
    return result['allCnt']
  }

  /**
   * 테이블에서 특정 조건에 맞는 레코드의 총 개수를 반환합니다.
   * Returns the total count of records in a table that match the specified condition.
   * 
   * @param {Object} params
   * @param {string} params.table 조회할 테이블 이름 / Table name to query
   * @param {string} params.where WHERE 조건절 / WHERE condition clause
   * @param {Record<string,any>} params.params 쿼리 파라미터 / Query parameters
   * @returns {Promise<number>} 조건에 맞는 레코드의 총 개수 / Total count of matching records
   */
  async totalCount({ table, where, params }) {
    const result = await this.exec(q =>
      q.setName(`${table}TotalCount`)
        .SELECT('CAST(COUNT(*) AS INTEGER) AS total_cnt')
        .FROM(table)
        .WHERE(where)
        .SET_PARAMS(params)
        .findOne()
    )
    return result['totalCnt']
  }
}
