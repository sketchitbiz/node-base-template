import { PgDBManager } from '@/database/DatabaseManager.js'
import { getManager } from '@/database/TransactionContext.js'
import type { PoolClient } from 'pg'
import { logger } from '../Logger.js'
import { PgQueryBuilder } from '../PgQuery.js'
import type { AbstractQuery } from './AbstractQuery.js'

export abstract class BaseMapper {

  protected async exec<T>(callback: (query: AbstractQuery<T>) => Promise<T | null>) {
    let manager = getManager()
    let client: PoolClient
    if (!manager) {
      manager = new PgDBManager()
      client = await manager.connect()
    } else {
      client = manager.client
    }


    try {
      return callback(new PgQueryBuilder<T>(client))
    } catch (error) {
      logger.error(error)
      throw error
    } finally {
      if (!manager) {
        client.release()
      }
    }
  }

  /**
   * 모든 데이터 개수 조회
   * @param table - 테이블 이름
   * @returns 모든 데이터 개수
   */
  protected async allCnt(table: string) {
    const result: { allCnt: number } | null = await this.exec(q => q.setName(`${table}_allCnt`).SELECT(`CAST(COUNT(*) AS INTEGER) AS all_cnt`).FROM(table).findOne<{ allCnt: number }>())

    return result?.allCnt
  }

  /**
   * 조건에 따른 데이터 개수 조회
   * @param params - 파라미터
   * @returns 조건에 따른 데이터 개수
   */
  protected async totalCnt(params: { params: Record<string, any>, table: string, where: string }) {
    const result: { totalCnt: number } | null = await this.exec(q =>
      q.setName(`${params.table}_totalCnt`)
        .SELECT(`CAST(COUNT(*) AS INTEGER) AS total_cnt`)
        .FROM(params.table)
        .WHERE(params.where)
        .SET_PARAMS(params.params)
        .findOne<{ totalCnt: number }>())

    return result?.totalCnt
  }
}