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
 * @property {string} fieldName - 필드명
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

  let query = `coalesce(`;
  query += `( SELECT count(*) FROM common.attach_file_info`;
  query += ` WHERE attach_file_type = ${params.fileType}`;

  if (params.contentsNo) {
    query += ` AND contents_no = ${params.contentsNo}`;
  }
  query += `), 0) AS file_cnt`;

  return query;
}


/**
 * @description 생성자로 파일 쿼리 추가
 * @param {FileQuery} params
 * @returns {string}
 */
export function addCreatorFileQuery(params) {
  let query = `coalesce((SELECT count(*) FROM common.attach_file_info WHERE attach_file_type = '${params.fileType}' AND created_id = ${params.userId} `;

  if (params.limit) {
    query += ` LIMIT ${params.limit}`;
  }

  query += `), 0) as file_cnt`;
  query += ` ,'${params.fileType}' AS file_type`;

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
 * @param {string} params.table - 테이�� 이름
 * @param {string} [params.where] - 조건절
 * @returns {string}
 */
export function addAllCountQuery({ table, where }) {
  let query = `(SELECT count(*) FROM ${table}`;
  if (where) {
    query += ` WHERE ${where}`;
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
  let query = `(SELECT count(*) FROM ${params.table}`;
  if (params.where) {
    query += ` WHERE ${params.where}`;
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
 * @typedef {Object} Query
 * @property {string} name - 쿼리 이름
 * @property {string|null} type - 쿼리 타입 (예: 'SELECT')
 * @property {string|null} table - 대상 테이블명
 * @property {string[]} fields - 선택할 필드 목록
 * @property {boolean} returning - 반환 여부
 * @property {Array<{type: string, table: string, condition: string|null}>} joins - JOIN 절 정보
 * @property {string[]} where - WHERE 조건절
 * @property {string[]} groupBy - GROUP BY 필드 목록
 * @property {string[]} having - HAVING 조건절
 * @property {Array<{field: string, direction: string}>} orderBy - 정렬 정보
 * @property {number|null} limit - LIMIT 값
 * @property {Record<string,any>} params - 파라미터화된 값들
 * @property {string[] | string[][]} values - INSERT 할때 넣는 값들
 */


/**
 * @class QueryBuilder
 */
export class QueryBuilder {


  /**
   * @type {string|undefined}
   * @private
   */
  name;

  /**
   * @type {Query}
   * @private
   */
  query;

  /**
   * @type {string}
   * @private
   */
  rawQuery;

  /**
   * @type {import('pg').PoolClient}
   * @private
   */
  client;

  /**
   * @param {import('pg').PoolClient} client
   * @constructor
   *
   */
  constructor(client) {
    if (!client) {
      throw new Error('Database client is required');
    }
    this.client = client;
    this.rawQuery = '';
    this.query = {
      returning: false,
      name: '',
      type: null,
      table: null,
      fields: [],
      joins: [],
      where: [],
      groupBy: [],
      having: [],
      orderBy: [],
      limit: null,
      params: {},
      values: []
    };
  }

  /**
   *  쿼리 이름 지정
   * @param {string} name
   */
  setName(name) {
    this.query.name = name;
    this.name = name;
    return this;
  }

  /**
   * raw 쿼리 작성
   * @param {string} query
   */
  setQuery(query) {
    this.rawQuery += ' ' + query;
    return this;
  }


  /**
   * SELECT문 추가
   * @param {string[]} fields
   */
  select(...fields) {
    this.query.type = 'SELECT';
    this.query.fields = fields.length > 0 ? fields : ['*'];
    return this;
  }

  /**
   * INSERT 쿼리 시작
   *
   * @param {string} table 대상 테이블명
   * @returns {this}
   */
  insert(table, returning = false) {
    this.query.type = 'INSERT';
    this.query.table = table;
    this.query.returning = returning;
    return this;
  }

  /**
   * INSERT 할 필드 목록
   *
   * @param {...string} fields
   * @returns {this}
   */
  insertFields(...fields) {
    this.query.fields = fields;
    return this;
  }

  /**
   * INSERT 할 값 목록
   *
   * @param {...any} values
   * @returns {this}
   */
  insertValues(...values) {
    this.query.values = values;
    return this;
  }

  /**
   * UPDATE 쿼리 시작
   *
   * @param {string} table 대상 테이블명
   * @returns {this}
   */
  update(table, returning = false) {
    this.query.type = 'UPDATE';
    this.query.table = table;
    this.query.returning = returning;
    return this;
  }

  /**
   * UPDATE 할 필드 목록
   *
   * @param {string} field 필드명
   * @param {any} value 값
   * @returns {this}
   */
  updateSet(field, value) {
    this.query.fields.push(`${field} = :${value}`);
    return this;
  }


  /**
   * DELETE 쿼리 시작
   *
   * @param {string} table 대상 테이블명
   * @returns {this}
   */
  delete(table) {
    this.query.type = 'DELETE';
    this.query.table = table;
    return this;
  }

  /**
   * FROM 절
   *
   * @param {string} table 테이블명
   * @returns {this}
   */
  from(table) {
    this.query.table = table;
    return this;
  }

  /**
   * WHERE 절
   *
   * @param {string} condition 조건절
   * @returns {this}
   */
  where(condition) {
    this.query.where.push(condition);
    return this;
  }

  /**
   * GROUP BY 절
   *
   * @param {...string} fields 필드 목록
   * @returns {this}
   */
  groupBy(...fields) {
    this.query.groupBy.push(...fields);
    return this;
  }

  /**
   * HAVING 절
   *
   * @param {string} condition 조건절
   * @param {any} value 값
   * @returns {this}
   */
  having(condition, value) {
    if (value !== undefined) {
      this.query.having.push(condition);
      this.query.values.push(value);
    }
    return this;
  }

  /**
   * ORDER BY 절
   *
   * @param {string} field 필드명
   * @param {string} direction 정렬 방향
   * @returns {this}
   */
  orderBy(field, direction = 'ASC') {
    this.query.orderBy.push({ field, direction: direction.toUpperCase() });
    return this;
  }

  /**
   * LIMIT 절
   *
   * @param {number} count 제한 값
   * @returns {this}
   */
  limit(count) {
    this.query.limit = count;
    return this;
  }

  // JOIN의 기본 메서드 - 모든 JOIN 타입을 지원

  /**
   * JOIN 추가
   *
   * @param {'INNER' | 'LEFT' | 'RIGHT' | 'FULL OUTER' | 'CROSS' | 'LEFT OUTER' | 'RIGHT OUTER' | 'NATURAL' | 'NATURAL LEFT' | 'NATURAL RIGHT'} joinType JOIN 타입
   * @param {string} table JOIN 테이블
   * @param {string|null} condition JOIN 조건
   * @returns {this}
   */
  addJoin(joinType, table, condition) {
    this.query.joins.push({
      type: joinType.toUpperCase(),
      table,
      condition
    });
    return this;
  }

  /**
   * INNER JOIN 추가
   *
   * @param {string} table JOIN 테이블
   * @param {string|null} condition JOIN 조건
   * @returns {this}
   */
  innerJoin(table, condition) {
    return this.addJoin('INNER', table, condition);
  }

  // LEFT JOIN
  /**
   * LEFT JOIN 추가
   *
   * @param {string} table JOIN 테이블
   * @param {string|null} condition JOIN 조건
   * @returns {this}
   */
  leftJoin(table, condition) {
    return this.addJoin('LEFT', table, condition);
  }

  // RIGHT JOIN
  /**
   * RIGHT JOIN 추가
   *
   * @param {string} table JOIN 테이블
   * @param {string|null} condition JOIN 조건
   * @returns {this}
   */
  rightJoin(table, condition) {
    return this.addJoin('RIGHT', table, condition);
  }

  // FULL OUTER JOIN
  /**
   * FULL OUTER JOIN 추가
   *
   * @param {string} table JOIN 테이블
   * @param {string|null} condition JOIN 조건
   * @returns {this}
   */
  fullOuterJoin(table, condition) {
    return this.addJoin('FULL OUTER', table, condition);
  }

  // CROSS JOIN
  /**
   * CROSS JOIN 추가
   *
   * @param {string} table JOIN 테이블
   * @returns {this}
   */
  crossJoin(table) {
    return this.addJoin('CROSS', table, null);
  }

  // LEFT OUTER JOIN
  /**
   * LEFT OUTER JOIN 추가
   *
   * @param {string} table JOIN 테이블
   * @param {string|null} condition JOIN 조건
   * @returns {this}
   */
  leftOuterJoin(table, condition) {
    return this.addJoin('LEFT OUTER', table, condition);
  }

  // RIGHT OUTER JOIN
  /**
   * RIGHT OUTER JOIN 추가
   *
   * @param {string} table JOIN 테이블
   * @param {string|null} condition JOIN 조건
   * @returns {this}
   */
  rightOuterJoin(table, condition) {
    return this.addJoin('RIGHT OUTER', table, condition);
  }

  // NATURAL JOIN
  /**
   * NATURAL JOIN 추가
   *
   * @param {string} table JOIN 테이블
   * @returns {this}
   */
  naturalJoin(table) {
    return this.addJoin('NATURAL', table, null);
  }

  // NATURAL LEFT JOIN
  /**
   * NATURAL LEFT JOIN 추가
   *
   * @param {string} table JOIN 테이블
   * @returns {this}
   */
  naturalLeftJoin(table) {
    return this.addJoin('NATURAL LEFT', table, null);
  }

  // NATURAL RIGHT JOIN
  /**
   * NATURAL RIGHT JOIN 추가
   *
   * @param {string} table JOIN 테이블
   * @returns {this}
   */
  naturalRightJoin(table) {
    return this.addJoin('NATURAL RIGHT', table, null);
  }


  /**
   * 파라미터 설정
   *
   * @param {Record<string,any>} params 파라미터
   * @returns {this}
   */
  setParams(params) {
    this.query.params = params;
    return this;
  }

  /**
   * 쿼리 생성
   * @returns {import('pg').QueryConfig}
   * @private
   */
  build() {
    let query = '';

    logger.debug(`Query: ${this.query.name}`, this.query);


    // 쿼리 타입에 따라 쿼리 생성
    if (this.query.type === 'SELECT') {
      query = `SELECT ${this.query.fields.join(', ')} FROM ${this.query.table}`;
    } else if (this.query.type === 'INSERT') {
      query = `INSERT INTO ${this.query.table} (${this.query.fields.join(', ')}) VALUES ${Array.isArray(this.query.values[0])
        ? this.query.values.map(row => `(${row.join(', ')})`).join(', ')
        : `(${this.query.values.join(', ')})`}`;

      if (this.query.returning) {
        query += ` RETURNING *`;
      }
    } else if (this.query.type === 'UPDATE') {
      query = `UPDATE ${this.query.table} SET ${this.query.fields.join(', ')}`;

      if (this.query.returning) {
        query += ` RETURNING *`;
      }
    } else if (this.query.type === 'DELETE') {
      query = `DELETE FROM ${this.query.table} WHERE ${this.query.where.join(' AND ')}`;
    }

    // JOIN 절 추가
    if (this.query.joins.length) {
      query += ' ' + this.query.joins
        .map(join => {
          if (join.condition) {
            return `${join.type} JOIN ${join.table} ON ${join.condition}`;
          }
          return `${join.type} JOIN ${join.table}`;
        })
        .join(' ');
    }

    // WHERE 절 추가
    if (this.query.where.length) {
      query += ` WHERE ${this.query.where.join(' ')}`;
    }

    // GROUP BY 절 추가
    if (this.query.groupBy.length) {
      query += ` GROUP BY ${this.query.groupBy.join(', ')}`;
    }

    // HAVING 절 추가
    if (this.query.having.length) {
      query += ` HAVING ${this.query.having.join(' ')}`;
    }

    // ORDER BY 절 추가
    if (this.query.orderBy.length) {
      query += ` ORDER BY ${this.query.orderBy
        .map(({ field, direction }) => `${field} ${direction}`)
        .join(', ')}`;
    }

    // LIMIT 절 추가
    if (this.query.limit) {
      query += ` LIMIT ${this.query.limit}`;
    }

    const values = [];
    if (this.query.type === 'SELECT') {
      const paramList = Object.keys(this.query.params).sort((a, b) => b.length - a.length);
      let index = 1;

      paramList.forEach(param => {
        const newSql = query.replace(new RegExp(`:${param}`, 'g'), `$${index}`);
        if (newSql !== query) {
          query = newSql;
          values.push(this.query.params[param]);
          index++;
        }
      });

    }


    const queryConfig = {
      name: this.query.name,
      text: query,
      values
    };
    logger.debug(`Raw Query: ${queryConfig.name}`, queryConfig);
    return queryConfig;
  }

  /**
   * raw 쿼리 생성
   * @returns {import('pg').QueryConfig}
   * @private
   */
  rawQueryBuild() {
    let query = this.rawQuery;
    const paramList = Object.keys(this.query.params).sort((a, b) => b.length - a.length);
    let index = 1;
    const values = [];

    paramList.forEach(param => {
      const newSql = query.replace(new RegExp(`:${param}`, 'g'), `$${index}`);
      if (newSql !== query) {
        query = newSql;
        values.push(this.query.params[param]);
        index++;
      }
    });

    logger.debug(`Raw Query: ${this.query.name}`, {
      name: this.query.name,
      text: query,
      values
    });
    return {
      name: this.query.name,
      text: query,
      values
    };
  }


  /**
   * 다수 조회
   * @template T
   * @returns {Promise<T[]>}
   */
  async findMany() {
    const query = this.build();
    logger.debug(`Query: ${query.name}`, query);

    const { rows } = await this.client.query(query);
    if (rows.length === 0) {
      return [];
    }
    return snakeToCamel(rows);
  }

  /**
   * 단일 조회
   * @template T
   * @returns {Promise<T | null>}
   */
  async findOne() {
    const query = this.build();
    logger.debug(`Query: ${query.name}`, query);

    const { rows } = await this.client.query(query);
    if (rows.length === 0) {
      return null;
    }
    return snakeToCamel(rows[0]);
  }

  /**
   * 실행
   * @template T
   * @returns {Promise<T | void>}
   * @throws {DatabaseError}
   */
  async exec() {
    const query = this.build();
    logger.debug(`Query: ${query.name}}`, query);

    const { rows } = await this.client.query(query);
    if (rows.length > 0) {
      return snakeToCamel(rows);
    }
  }


  /**
   * raw 쿼리 다수 조회
   * @template T
   * @returns {Promise<T[]>}
   */
  async rawFindMany() {
    const query = this.rawQueryBuild();
    logger.debug(`Query: ${query.name}`, query);

    const { rows } = await this.client.query(query);
    if (rows.length === 0) {
      return [];
    }
    return snakeToCamel(rows);
  }


  /**
   * raw 쿼리 단일 조회
   * @template T
   * @returns {Promise<T | null>}
   */
  async rawFindOne() {
    const query = this.rawQueryBuild();
    logger.debug(`Query: ${query.name}`, query);

    const { rows } = await this.client.query(query);
    if (rows.length === 0) {
      return null;
    }
    return snakeToCamel(rows[0]);
  }


  /**
   * raw 쿼리 실행
   * @template T
   * @returns {Promise<T | void>}
   */
  async rawExec() {
    const query = this.rawQueryBuild();
    logger.debug(`Query: ${query.name}}`, query);

    const { rows } = await this.client.query(query);
    if (rows.length > 0) {
      return snakeToCamel(rows);
    }
  }
}
