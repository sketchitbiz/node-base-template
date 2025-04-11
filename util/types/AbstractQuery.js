/**
 * This file contains utility functions for query construction and an abstract class for query builders.
 * It provides a foundation for building SQL queries in a structured and type-safe manner.
 * 
 * Currently, only PostgreSQL is supported through the PgQuery class which inherits from AbstractQuery.
 * However, the abstract design allows for easy integration of other database systems in the future.
 * To add support for a new database, simply create a new query builder class that extends AbstractQuery.
 * 
 * Usage Example:
 * ```javascript
 * // Using the PostgreSQL implementation
 * const queryBuilder = new PgQueryBuilder(client)
 *   .setName('getUserData')
 *   .SELECT('id', 'name', 'email')
 *   .FROM('users')
 *   .WHERE('active = true')
 *   .AND('last_login > :lastLoginDate')
 *   .SET_PARAM('lastLoginDate', '2023-01-01')
 *   .ORDER_BY({ field: 'created_at', direction: 'DESC' })
 *   .LIMIT(10);
 * 
 * const users = await queryBuilder.findMany();
 * ```
 * 
 * The module provides a fluent interface for building queries with proper type definitions
 * and abstracts away the differences between database systems.
 */

/**
 * File related query interface
 * 
 * 
 * @typedef {Object} FileQuery
 * @property {string} fileType - 파일 타입 file type
 * @property {number} [contentsNo] - 컨텐츠 번호 (선택사항) - optional content number
 * @property {number} [userId] - 사용자 ID (선택사항) - optional user ID
 * @property {number} [limit] - 제한 수 (선택사항) - optional limit
 * @property {string} [fieldName] - 필드명 (선택사항) - optional field name
 */


/**
 * Count query parameter interface
 * 전체 카운트 쿼리 파라미터 인터페이스
 * 
 * @typedef {Object} CountQueryParams
 * @property {string} table - table name
 * @property {string} [where] - WHERE condition (optional)
 */

/**
 * Date range interface
 * @typedef {Object} FromToDate
 * @property {string} fromDate - start date
 * @property {string} toDate - end date
 */

/**
 * Keyword interface
 * @typedef {Object} KeywordParam
 * @property {string[]} keyword - keyword
 */

/**
 * Adds a file count query to get the number of files
 * 
 * This function creates a SQL query fragment that counts files based on the provided parameters.
 * It returns a coalesced count to ensure null values are converted to zero.
 * 
 * Usage Example:
 * ```javascript
 * const fileCountQuery = addFileCountQuery({
 *   fileType: 'PRODUCT_IMAGE',
 *   contentsNo: 123
 * });
 * ```
 * 
 * @param {FileQuery} params - Parameters for the file count query
 * @returns {string} SQL query fragment for counting files
 */
export function addFileCountQuery(params) {
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
 * Adds a file query to count files created by a specific user
 * 
 * This function creates a SQL query fragment that counts files created by a specific user
 * based on the provided parameters. It returns both the count and file type.
 * 
 * Usage Example:
 * ```javascript
 * const creatorFileQuery = addCreatorFileQuery({
 *   fileType: 'USER_UPLOADS',
 *   userId: 456,
 *   limit: 10
 * });
 * ```
 * 
 * @param {FileQuery} params - Parameters for the creator file query
 * @returns {string} SQL query fragment for counting files by creator
 */
export function addCreatorFileQuery(params) {
  let query = `coalesce((SELECT count(*) FROM common.attach_file_info WHERE attach_file_type = '${params.fileType}' AND created_id = ${params.userId} `

  if (params.limit) {
    query += ` LIMIT ${params.limit}`
  }

  query += `), 0) as file_cnt`
  query += ` ,'${params.fileType}' AS file_type`

  return query
}

/**
 * Adds a file query to retrieve file information as a JSON array
 * 
 * This function creates a SQL query fragment that retrieves detailed file information
 * as a JSON aggregate based on the provided parameters.
 * 
 * Usage Example:
 * ```javascript
 * const fileQuery = addFileQuery({
 *   fileType: 'PRODUCT_IMAGE',
 *   contentsNo: 123,
 *   userId: 456,
 *   fieldName: 'product_images'
 * });
 * ```
 * 
 * @param {FileQuery} params - Parameters for the file query
 * @returns {string} SQL query fragment for retrieving file information as JSON
 */
export function addFileQuery(params) {
  let query = `(SELECT json_agg(sub_image) FROM (SELECT s.attach_file_no, s.origin_file_name, s.file_path, s.created_time` +
    `, s.update_time FROM common.attach_file_info s` +
    ` WHERE s.attach_file_type = '${params.fileType}'`

  if (params.userId) {
    query += ` AND s.created_id = ${params.userId}` // userId condition added
  }

  if (params.contentsNo) {
    query += ` AND s.contents_no = ${params.contentsNo}` // contentsNo condition added
  }

  query += `) sub_image ) AS ${params.fieldName}` // query finish

  return query
}

/**
 * Adds a total count query to get the number of records in a table
 * 
 * This function creates a SQL query fragment that counts all records in a table
 * with an optional WHERE condition.
 * 
 * Usage Example:
 * ```javascript
 * const allCountQuery = addAllCountQuery({
 *   table: 'users',
 *   where: 'active = true'
 * });
 * ```
 * 
 * @param {Object} params - Parameters for the count query
 * @param {string} params.table - Table name to query
 * @param {string} [params.where] - Optional WHERE condition
 * @returns {string} SQL query fragment for counting all records
 */
export function addAllCountQuery({ table, where }) {
  let query = `(SELECT count(*) FROM ${table}`
  if (where) {
    query += ` WHERE ${where}`
  }
  query += `) AS all_cnt`

  return query
}

/**
 * Adds a total count query to get the number of records in a table
 * 
 * This function creates a SQL query fragment that counts all records in a table
 * with an optional WHERE condition. Similar to addAllCountQuery but with a different
 * parameter structure and alias.
 * 
 * Usage Example:
 * ```javascript
 * const totalCountQuery = addTotalCountQuery({
 *   table: 'products',
 *   where: 'category_id = 5'
 * });
 * ```
 * 
 * @param {Object} params - Parameters for the total count query
 * @param {string} params.table - Table name to query
 * @param {string} [params.where] - Optional WHERE condition
 * @returns {string} SQL query fragment for counting total records
 */
export function addTotalCountQuery(params) {
  let query = `(SELECT count(*) FROM ${params.table}`
  if (params.where) {
    query += ` WHERE ${params.where}`
  }
  query += `) AS total_cnt`

  return query
}

/**
 * Adds a row number query for result pagination and ordering
 * 
 * This function creates a SQL query fragment that adds a row number to each result
 * based on the provided sort condition.
 * 
 * Usage Example:
 * ```javascript
 * const rowNoQuery = addRowNoQuery('ORDER BY created_at DESC');
 * ```
 * 
 * @param {string} sort - SQL sort condition (e.g., 'ORDER BY field ASC')
 * @returns {string} SQL query fragment for adding row numbers
 */
export function addRowNoQuery(sort) {
  return `CAST(ROW_NUMBER() OVER (ORDER BY ${sort}) AS INTEGER) AS no`
}

/**
 * Adds a date truncation query for date range filtering  
 * 
 * This function creates a SQL query fragment that truncates a date field to the day level
 * and compares it to the provided date range.
 * 
 * Usage Example:
 * ```javascript
 * const dateTruncQuery = addDateTruncQuery('created_time');
 * ```
 * 
 * @param {string} field - The date field to truncate
 * @returns {string} SQL query fragment for date truncation
 */
export function addDateTruncQuery(field) {
  return `(date_trunc('day', ${field}::timestamp) BETWEEN date_trunc('day', :fromDate::timestamp) AND date_trunc('day', :toDate::timestamp))`
}
/**
 * Define types and interfaces for writing queries
 */


/**
 * @typedef {'INNER'|'LEFT'|'RIGHT'|'FULL'|'CROSS'|'NATURAL'|'FULL OUTER'|'LEFT OUTER'|'RIGHT OUTER'|'NATURAL OUTER'} JoinType
 */

/**
 * @typedef {'ASC'|'DESC'|'USING'|'NULLS FIRST'|'NULLS LAST'|'ASC NULLS FIRST'|'ASC NULLS LAST'|'DESC NULLS FIRST'|'DESC NULLS LAST'} OrderByDirection
 */

/**
 * @typedef {Object} Join
 * @property {JoinType} type - join type
 * @property {string} table - table name to join
 * @property {string} on - join condition
 */

/**
 * @typedef {Object} OrderBy
 * @property {string} field - sort field
 * @property {OrderByDirection} direction - sort direction
 */

/**
 * @typedef {Object} Query
 * @property {string} name - query name
 * @property {'SELECT'|'UPDATE'|'DELETE'|'INSERT'|null} type - query type
 * @property {string} table - table name
 * @property {string[]} selectFields - select fields
 * @property {string[]} insertFields - insert fields
 * @property {any[]} values - values used in query (using in insert query)
 * @property {Record<string,any>} params - parameterized values
 * @property {Record<string,any>} updateSets - update fields and values
 * @property {boolean} returning - return status
 * @property {Join[]} joins - join conditions
 * @property {string[]} where - WHERE condition
 * @property {string[]} groupBy - GROUP BY fields
 * @property {string[]} having - HAVING condition
 * @property {OrderBy[]} orderBy - sort conditions
 * @property {string[]} returningFields - fields included in RETURNING clause
 * @property {number|null} limit - LIMIT value
 * @property {number|null} offset - OFFSET value
 * @property {string[]} types - PostgreSQL data types for each column (e.g., ['int4', 'text', 'timestamp']) used in bulk insert
 */

/**
 * Abstract class for query builder
 *
 * @abstract
 * @export
 * @class AbstractQuery
 */
export class AbstractQuery {
  /** @type {string} @protected */
  name
  /** @type {Query} @protected */
  query
  /** @type {string} @protected */
  _rawQuery

  constructor() {
    this._rawQuery = ''
    this.query = {
      name: '',
      type: null,
      table: '',
      selectFields: [],
      insertFields: [],
      values: [],
      params: {},
      updateSets: {},
      returning: false,
      joins: [],
      where: [],
      groupBy: [],
      having: [],
      orderBy: [],
      limit: null,
      offset: null,
      returningFields: [],
      types: []
    }
  }

  /**
   * Specify query name
   * @param {string} name
   * @returns {this}
   */
  setName(name) {
    this.name = name
    this.query.name = name
    return this
  }

  /**
   * Write raw query
   * @param {string} query
   */
  rawQuery(query) {
    this._rawQuery += ' ' + query
    return this
  }

  /**
   * Add SELECT statement
   * @param {string[]} fields
   * @returns {this}
   */
  SELECT(...fields) {
    this.query.type = 'SELECT'
    this.query.selectFields = fields.length > 0 ? fields : ['*']
    return this
  }

  /**
   * Start INSERT query
   * @param {string} table
   * @returns {this}
   */
  INSERT(table) {
    this.query.type = 'INSERT'
    this.query.table = table
    return this
  }

  /**
   * Add INSERT fields
   * @param {string[]} fields
   * @returns {this}
   */
  INSERT_FIELDS(...fields) {
    this.query.insertFields = fields
    return this
  }

  /**
   * Add INSERT values
   * @param {any[] | any[][]} values
   * @returns {this}
   */
  INSERT_VALUES(...values) {
    this.query.values = values
    return this
  }

  /**
   * Start UPDATE query
   * @param {string} table
   * @returns {this}
   */
  UPDATE(table) {
    this.query.type = 'UPDATE'
    this.query.table = table
    return this
  }

  /**
   * Add UPDATE fields
   * @param {Record<string, any>} sets
   * @returns {this}
   */
  UPDATE_FIELDS(sets) {
    this.query.updateSets = sets
    return this
  }

  /**
   * Start DELETE query
   * @param {string} table
   * @returns {this}
   */
  DELETE(table) {
    this.query.type = 'DELETE'
    this.query.table = table
    return this
  }

  /**
   * Start FROM query
   * @param {string} table
   * @returns {this}
   */
  FROM(table) {
    this.query.table = table
    return this
  }

  /**
   * Add JOIN join
   * @param {Join} params
   * @returns {this}
   */
  JOIN(params) {
    this.query.joins.push(params)
    return this
  }

  /**
   * Add WHERE condition
   * @param {string} predicate
   * @returns {this}
   */
  WHERE(predicate) {
    this.query.where = [predicate]
    return this
  }

  /**
   * Add AND condition
   * @param {string} predicate
   * @returns {this}
   */
  AND(predicate) {
    this.query.where.push('AND ' + `(${predicate})`)
    return this
  }

  /**
   * Add OR condition
   * @param {string} predicate
   * @returns {this}
   */
  OR(predicate) {
    this.query.where.push('OR ' + predicate)
    return this
  }

  /**
   * Add GROUP BY fields
   * @param {string[]} fields
   * @returns {this}
   */
  GROUP_BY(fields) {
    this.query.groupBy = fields
    return this
  }

  /**
   * Add HAVING condition
   * @param {string} predicate
   * @returns {this}
   */
  HAVING(predicate) {
    this.query.having = [predicate]
    return this
  }

  /**
   * Add ORDER BY sort condition
   * @param {OrderBy[]} params
   * @returns {this}
   */
  ORDER_BY(...params) {
    this.query.orderBy.push(...params)
    return this
  }

  /**
   * Add LIMIT limit
   * @param {number} limit
   * @returns {this}
   */
  LIMIT(limit) {
    this.query.limit = limit
    return this
  }

  /**
   * Add OFFSET
   * @param {number} offset
   * @returns {this}
   */
  OFFSET(offset) {
    this.query.offset = offset
    return this
  }

  /**
   * Add RETURNING fields
   * @param {string[]} fields
   * @returns {this}
   */
  RETURNING(...fields) {
    this.query.returning = true
    if (fields.length === 0) {
      this.query.returningFields = ['*']
    } else {
      this.query.returningFields = fields
    }
    return this
  }

  /**
   * Add parameters
   * @param {Record<string, any>} params
   * @returns {this}
   */
  SET_PARAMS(params) {
    this.query.params = params
    return this
  }

  /**
   * Add parameters
   * @param {string} key
   * @param {any} value
   * @returns {this}
   */
  SET_PARAM(key, value) {
    this.query.params[key] = value
    return this
  }

  /**
   * Set PostgreSQL data types for bulk insert columns
   * This method is used to specify the data type of each column when performing a bulk insert
   * The order of types should match the order of insert fields
   * 
   * @example
   * query.INSERT('users')
   *   .INSERT_FIELDS('id', 'name', 'created_at')
   *   .SET_TYPES('int4', 'text', 'timestamp')
   *   .INSERT_VALUES([1, 'John', '2024-03-20'], [2, 'Jane', '2024-03-21'])
   * 
   * @param {...string} types - PostgreSQL data types
   * @returns {this}
   */
  SET_TYPES(...types) {
    this.query.types = types
    return this
  }

  /**
   * Build query
   * @abstract
   * @returns {any}
   */
  build() { }

  /**
   * Build raw query
   * @abstract
   * @protected
   * @returns {any}
   */
  rawQueryBuild() { }

  /**
   * Find multiple
   * @abstract
   * @returns {any}
   */
  findMany() { }

  /**
   * Find one
   * @abstract
   * @returns {any}
   */
  findOne() { }

  /**
   * Execute query
   * @abstract
   * @returns {any}
   */
  exec() { }

  /**
   * Find multiple raw query
   * @abstract
   * @returns {any}
   */
  rawFindMany() { }

  /**
   * Find one raw query
   * @abstract
   * @returns {any}
   */
  rawFindOne() { }

  /**
   * Execute raw query
   * @abstract
   * @returns {any}
   */
  rawExec() { }
}