'use strict';
import { snakeToCamel } from './Functions.js';
import { logger } from './Logger.js';

// ============================ Types ============================
/**
 * @typedef {Object} FileQuery
 * @property {string} fileType - 파일 타입
 * @property {number} [contentsNo] - 컨텐츠 번호
 * @property {string} [userId] - 사용자 id
 * @property {number} limit - 갯수
 */

/**
 * FromToDate 쿼리파람
 * @typedef {Object} FromToDate
 * @property {string} fromDate - 시작날짜
 * @property {string} toDate - 종료날짜
 */

/**
 * 키워드 검색 쿼리파람
 * @typedef {Object} KeywordParam
 * @property {string[]} keyword - 키워드
 */

/**
 * 검색 쿼리
 * @typedef {FromToDate & KeywordParam} SearchQuery
 */

/**
 * @description file count 쿼리 추가
 * @param {FileQuery} params
 * @returns {string}
 */
export function addFileCountQuery(params) {

  let query = `coalesce(`
  query += `( SELECT count(*) FROM common.attach_file_info`
  query += ` WHERE attach_file_type = ${params.fileType}`

  if (params.contentsNo) {
    query += ` AND contents_no = ${params.contentsNo}`
  }
  query += `), 0) AS file_cnt`

  return query;
}


/**
 * @description 생성자로 파일 쿼리 추가
 * @param {FileQuery} params
 * @returns {string}
 */
export function addCreatorFileQuery(params) {
  let query = `coalesce((SELECT count(*) FROM common.attach_file_info WHERE attach_file_type = '${params.fileType}' AND created_id = ${params.userId} `

  if (params.limit) {
    query += ` LIMIT ${params.limit}`
  }

  query += `), 0) as file_cnt`
  query += ` ,'${params.fileType}' AS file_type`

  return query;
}

/**
 * @description 파일 쿼리 추가
 * @param {FileQuery} params
 * @returns {string}
 */
export function addFileQuery(params) {
  let query = `(SELECT json_agg(sub_image) FROM (SELECT s.attach_file_no, s.origin_file_name, s.file_path, s.created_time` +
    `, s.update_time FROM common.attach_file_info s` +
    ` WHERE s.attach_file_type = '${params.fileType}'`;

  if (params.userId) {
    query += ` AND s.created_id = ${params.userId}`; // userId 조건 추가
  }

  if (params.contentsNo) {
    query += ` AND s.contents_no = ${params.contentsNo}`; // contentsNo 조건 추가
  }

  query += `) sub_image ) AS ${params.fieldName}`; // 쿼리 마무리

  return query;
}

/**
 * @description 전체 카운트 쿼리 추가
 * @param {Object} params
 * @param {string} params.table - 테이블 이름
 * @param {string} [params.where] - 조건절
 * @returns {string}
 */
export function addAllCountQuery({ table, where }) {
  let query = `(SELECT count(*) FROM ${table}`
  if (where) {
    query += ` WHERE ${where}`
  }
  query += `) AS all_cnt`;

  return query;
}

/**
 * @description 필터 결과 카운트 쿼리 추가
 * @param {Object} params
 * @param {string} params.table - 테이블 이름
 * @param {string} [params.where] - 조건절
 * @returns {string}
 */
export function addTotalCountQuery(params) {
  let query = `(SELECT count(*) FROM ${params.table}`
  if (params.where) {
    query += ` WHERE ${params.where}`
  }
  query += `) AS total_cnt`;

  return query;
}

/**
 * @description 행 번호 쿼리 추가
 * @param {string} sort - 정렬 조건
 * @returns {string}
 */
export function addRowNoQuery(sort) {
  return `row_number() over(${sort}) as no`;
}


/**
 * @class QueryBuilder
 */
export class QueryBuilder {
  /** @type {string} */
  #name;
  /** @type {string} */
  #query = '';
  /** @type {Record<string,any>} */
  #fields;
  /** @type {import('pg').PoolClient} */
  #client;

  /**
   * @param {import('pg').PoolClient} client
   *
   */
  constructor(client) {
    if (!client) {
      throw new Error('Database client is required');
    }
    this.#client = client;
  }

  get client() {
    return this.#client;
  }

  /**
   *  쿼리 이름 지정
   * @param {string} name
   */
  setName(name) {
    this.#name = name;
    return this;
  }

  /**
   * 쿼리 작성
   * @param {string} query
   */
  setQuery(query) {
    this.#query += query;
    return this;
  }

  /**
   * SELECT문 추가
   * @param {string} query
   */
  select(query) {
    this.#query += 'SELECT ' + query;
    return this;
  }

  /**
   * UPDATE문 추가
   * @param query
   */
  update(query) {
    this.#query += 'UPDATE ' + query;
    return this;
  }

  /**
   * DELETE문 추가
   * @param query
   */
  delete(query) {
    this.#query += 'DELETE ' + query;
    return this;
  }

  /**
   * FROM문 추가
   * @param {string} table
   */
  from(table) {
    this.#query += ' FROM ' + table;
    return this;
  }

  /**
   * JOIN 문 추가
   * @param {string} query
   */
  join(query) {
    this.#query += query;
    return this;
  }

  /**
   * WHERE 문 추가
   */
  where(query) {
    this.#query += ' WHERE ' + query;
    return this;
  }

  /**
   * 필드 추가
   * @param {Record<string,any>} fields
   */
  setFields(fields) {
    this.#fields = fields;
    return this;
  }

  /**
   * 필드 추가
   * @param {string} field
   * @param {any} value
   */
  setField(field, value) {
    this.#fields[field] = value;
    return this;
  }

  /**
   * 빌드
   * @returns {import('pg').QueryConfig}
   */
  #build() {
    if (!this.#query) {
      throw new Error('Query is required');
    }


    let paramIndex = 1;
    const values = [];
    let statement = this.#query;
    const paramList = Object.keys(this.#fields).sort((a, b) => b.length - a.length);

    for (const key of paramList) {
      const value = this.#fields[key];
      const index = `$${paramIndex++}`;
      statement = statement.replace(new RegExp(`\\$${key}`, 'g'), index);
      values.push(value);
    }

    return {
      name: this.#name,
      text: statement,
      values
    }
  }


  /**
   * 다수 조회
   * @template T
   * @returns {Promise<T> | null}
   */
  async findMany() {
    const query = this.#build();
    logger.debug(query);

    const { rows } = await this.#client.query(query);
    if (rows.length === 0) {
      return null;
    }
    const data = snakeToCamel(rows);

    return data;
  }

  /**
   * 단일 조회
   * @template T
   * @returns {Promise<T> | null}
   */
  async findOne() {
    const query = this.#build();
    logger.debug(query);

    const { rows } = await this.#client.query(query);
    if (rows.length === 0) {
      return null;
    }
    return snakeToCamel(rows[0]);
  }

  /**
   * 실행
   * @template T
   * @returns {Promise<T> | boolean}
   * @throws {DatabaseError}
   */
  async exec() {
    const query = this.#build();
    logger.debug(query);

    const { rows } = await this.#client.query(query);
    if (rows.length === 0) {
      return true;
    } else {
      return snakeToCamel(rows);
    }
  }
}