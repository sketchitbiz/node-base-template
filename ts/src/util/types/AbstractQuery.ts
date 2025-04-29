interface FileQuery {
  fileType: string
  contentsNo?: number
  userId?: number
  limit?: number
  fieldName?: string
}

interface CountQueryParams {
  table: string
  where?: string
}

export interface FromToDate {
  fromDate: string
  toDate: string
}

export interface KeywordParam {
  keyword: string[]
}

/**
 * @description file count 쿼리 추가
 * @param {FileQuery} params
 * @returns {string}
 */
export function addFileCountQuery(params: FileQuery): string {
  let query = `coalesce(`
  query += `( SELECT count(*) FROM common.attach_file_info`
  query += ` WHERE attach_file_type = ${params.fileType}`

  if (params.contentsNo) {
    query += ` AND contents_no = ${params.contentsNo}`
  }
  query += `), 0) AS file_cnt`

  return query
}

/**
 * @description 생성자로 파일 쿼리 추가
 * @param {FileQuery} params
 * @returns {string}
 */
export function addCreatorFileQuery(params: FileQuery): string {
  let query = `coalesce((SELECT count(*) FROM common.attach_file_info WHERE attach_file_type = '${params.fileType}' AND created_id = ${params.userId} `

  if (params.limit) {
    query += ` LIMIT ${params.limit}`
  }

  query += `), 0) as file_cnt`
  query += ` ,'${params.fileType}' AS file_type`

  return query
}

/**
 * @description 파일 쿼리 추가
 * @param {FileQuery} params
 * @returns {string}
 */
export function addFileQuery(params: FileQuery): string {
  let query = `(SELECT json_agg(sub_image) FROM (SELECT s.attach_file_no, s.origin_file_name, s.file_path, s.created_time` +
    `, s.update_time FROM common.attach_file_info s` +
    ` WHERE s.attach_file_type = '${params.fileType}'`

  if (params.userId) {
    query += ` AND s.created_id = ${params.userId}` // userId 조건 추가
  }

  if (params.contentsNo) {
    query += ` AND s.contents_no = ${params.contentsNo}` // contentsNo 조건 추가
  }

  query += `) sub_image ) AS ${params.fieldName}` // 쿼리 마무리

  return query
}

/**
 * @description 전체 카운트 쿼리 추가
 * @param {CountQueryParams} params
 * @param {string} params.table - 테이블 이름
 * @param {string} [params.where] - 조건절
 * @returns {string}
 */
export function addAllCountQuery({ table, where }: CountQueryParams): string {
  let query = `(SELECT count(*) FROM ${table}`
  if (where) {
    query += ` WHERE ${where}`
  }
  query += `) AS all_cnt`

  return query
}

/**
 * @description 필터 결과 카운트 쿼리 추가
 * @param {CountQueryParams} params
 * @param {string} params.table - 테이블 이름
 * @param {string} [params.where] - 조건절
 * @returns {string}
 */
export function addTotalCountQuery(params: CountQueryParams): string {
  let query = `(SELECT count(*) FROM ${params.table}`
  if (params.where) {
    query += ` WHERE ${params.where}`
  }
  query += `) AS total_cnt`

  return query
}

/**
 * @description 행 번호 쿼리 추가
 * @param {string} sort - 정렬 조건
 * @returns {string}
 */
export function addRowNoQuery(sort: string): string {
  return `row_number() over(${sort}) as no`
}

// 배열의 요소 타입을 추출하는 타입
type ElementType<T> = T extends (infer U)[] ? U : T

interface Query<T> {
  name: string
  type: 'SELECT' | 'UPDATE' | 'DELETE' | 'INSERT' | null
  table: string
  selectFields: (keyof ElementType<T>)[] | ['*'] | string[] // ElementType을 사용하여 배열의 요소 타입의 키만 선택
  insertFields: (keyof ElementType<T>)[]
  values: any[]
  params: Record<string, any>
  updateSets: Record<keyof ElementType<T>, any>
  returning: boolean
  joins: Join[]
  where: string[]
  groupBy: string[]
  having: string[]
  orderBy: OrderBy[]
  returningFields: string[]
  limit: number | null
  offset: number | null
}

type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' | 'CROSS' | 'NATURAL' | 'FULL OUTER' | 'LEFT OUTER' | 'RIGHT OUTER' | 'NATURAL OUTER'

interface Join {
  type: JoinType // 조인 타입
  table: string // 조인할 테이블 이름
  on: string // 조인 조건
}

type OrderByDirection = 'ASC' | 'DESC' | 'USING' | 'NULLS FIRST' | 'NULLS LAST' | 'ASC NULLS FIRST' | 'ASC NULLS LAST' | 'DESC NULLS FIRST' | 'DESC NULLS LAST'

interface OrderBy {
  field: string // 정렬 필드
  direction: OrderByDirection // 정렬 방향
}

/**
 *  날짜 트랜스 쿼리 추가
 * @param  field - 필드 이름
 */
export function addDateTrunc(field: string) {
  return `(date_trunc('day', ${field}::timestamp) BETWEEN date_trunc('day', :fromDate::timestamp) AND date_trunc('day', :toDate::timestamp))`
}

export abstract class AbstractQuery<T> {

  protected name: string
  protected query: Query<T>
  protected _rawQuery: string

  constructor() {
    this._rawQuery = ''
    this.query = {
      name: '',
      type: null,
      table: '',
      selectFields: [],
      insertFields: [],
      values: [],
      params: {} as Record<string, any>,
      updateSets: {} as Record<keyof ElementType<T>, any>,
      returning: false,
      joins: [],
      where: [],
      groupBy: [],
      having: [],
      orderBy: [],
      limit: null,
      offset: null,
      returningFields: [],

    }
  }


  setName(name: string) {
    this.name = name
    return this
  }


  /**
   * Raw Query 작성
   *
   * @param  query
   * @returns 
   */
  rawQuery(query: string): this {
    this._rawQuery += ' ' + query
    return this
  }

  SELECT(...fields: (keyof ElementType<T>)[] | ['*'] | string[]): this {
    this.query.type = 'SELECT'
    this.query.selectFields = fields.length > 0 ? fields : ['*']
    return this
  }

  INSERT(table: string): this {
    this.query.type = 'INSERT'
    this.query.table = table
    return this
  }

  INSERT_FIELDS(...fields: (keyof ElementType<T>)[]): this {
    this.query.insertFields = fields
    return this
  }

  INSERT_VALUES(...values: any[] | any[][]): this {
    this.query.values = values
    return this
  }

  UPDATE(table: string): this {
    this.query.type = 'UPDATE'
    this.query.table = table
    return this
  }

  UPDATE_FIELDS(sets: Partial<Record<keyof ElementType<T>, any>>): this {
    this.query.updateSets = sets as Record<keyof ElementType<T>, any>
    return this
  }

  DELETE(table: string): this {
    this.query.type = 'DELETE'
    this.query.table = table
    return this
  }

  FROM(table: string): this {
    this.query.table = table
    return this
  }

  JOIN(params: Join): this {
    this.query.joins.push(params)
    return this
  }

  WHERE(predicate: string): this {
    this.query.where = [predicate]
    return this
  }

  AND(predicate: string): this {
    this.query.where.push('AND ' + `(${predicate})`)
    return this
  }

  OR(predicate: string): this {
    this.query.where.push('OR ' + predicate)
    return this
  }

  GROUP_BY(fields: string[]): this {
    this.query.groupBy = fields
    return this
  }

  HAVING(predicate: string): this {
    this.query.having = [predicate]
    return this
  }

  ORDER_BY(params: OrderBy): this {
    this.query.orderBy.push(params)
    return this
  }

  LIMIT(limit: number): this {
    this.query.limit = limit
    return this
  }

  OFFSET(offset: number): this {
    this.query.offset = offset
    return this
  }

  RETURNING(...fields: string[]): this {
    this.query.returning = true
    if (fields.length === 0) {
      this.query.returningFields = ['*']
    } else {
      this.query.returningFields = fields
    }
    return this
  }

  SET_PARAMS(params: Record<string, any>): this {
    this.query.params = params
    return this
  }

  SET_PARAM(key: string, value: any): this {
    this.query.params[key] = value
    return this
  }

  protected abstract build(): any

  protected abstract rawQueryBuild(): any

  abstract findMany<T = any>(): Promise<T[] | null>

  abstract findOne<T = any>(): Promise<T | null>

  abstract exec<T>(): Promise<T | null>

  abstract rawFindMany<T = any>(): Promise<T[] | null>

  abstract rawFindOne<T = any>(): Promise<T | null>

  abstract rawExec(): Promise<any>
}