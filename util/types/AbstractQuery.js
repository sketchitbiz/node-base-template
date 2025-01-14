
/**
 * 파일 관련 쿼리 인터페이스
 * @typedef {Object} FileQuery
 * @property {string} fileType - 파일 타입
 * @property {number} [contentsNo] - 컨텐츠 번호 (선택사항)
 * @property {number} [userId] - 사용자 ID (선택사항)
 * @property {number} [limit] - 제한 수 (선택사항)
 * @property {string} [fieldName] - 필드명 (선택사항)
 */







/**
 * 카운트 쿼리 파라미터 인터페이스
 * @typedef {Object} CountQueryParams
 * @property {string} table - 테이블명
 * @property {string} [where] - WHERE 조건절 (선택사항)
 */

/**
 * 날짜 범위 인터페이스
 * @typedef {Object} FromToDate
 * @property {string} fromDate - 시작 날짜
 * @property {string} toDate - 종료 날짜
 */

/**
 * 키워드 인터페이스
 * @typedef {Object} KeywordParam
 * @property {string[]} keyword - 키워드
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
 * @typedef {'INNER'|'LEFT'|'RIGHT'|'FULL'|'CROSS'|'NATURAL'|'FULL OUTER'|'LEFT OUTER'|'RIGHT OUTER'|'NATURAL OUTER'} JoinType
 */

/**
 * @typedef {'ASC'|'DESC'|'USING'|'NULLS FIRST'|'NULLS LAST'|'ASC NULLS FIRST'|'ASC NULLS LAST'|'DESC NULLS FIRST'|'DESC NULLS LAST'} OrderByDirection
 */

/**
 * @typedef {Object} Join
 * @property {JoinType} type - 조인 타입
 * @property {string} table - 조인할 테이블 이름
 * @property {string} on - 조인 조건
 */

/**
 * @typedef {Object} OrderBy
 * @property {string} field - 정렬 필드
 * @property {OrderByDirection} direction - 정렬 방향
 */

/**
 * @typedef {Object} Query
 * @property {string} name - 쿼리 이름
 * @property {'SELECT'|'UPDATE'|'DELETE'|'INSERT'|null} type - 쿼리 타입
 * @property {string} table - 테이블 이름
 * @property {string[]} selectFields - select할 필드들
 * @property {string[]} insertFields - insert할 필드들
 * @property {any[]} values - 쿼리에 사용될 값들
 * @property {Record<string,any>} params - 파라미터화된 값들
 * @property {Record<string,any>} updateSets - update할 필드와 값들
 * @property {boolean} returning - 반환 여부
 * @property {Join[]} joins - 조인 조건
 * @property {string[]} where - WHERE 조건절
 * @property {string[]} groupBy - GROUP BY 필드 목록
 * @property {string[]} having - HAVING 조건절
 * @property {OrderBy[]} orderBy - 정렬 조건
 * @property {string[]} returningFields - RETURNING 절에 포함될 필드들
 * @property {number|null} limit - LIMIT 값
 * @property {number|null} offset - OFFSET 값
 */

/**
 * 쿼리빌더 추상화 클래스
 *
 * @abstract
 * @export
 * @class AbstractQuery
 */
export class AbstractQuery {
  /** @type {string} @protected */
  name;
  /** @type {Query} @protected */
  query;
  /** @type {string} @protected */
  _rawQuery;

  constructor() {
    this._rawQuery = '';
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
      returningFields: []
    };
  }

  /**
   * 쿼리 이름 지정
   * @param {string} name
   * @returns {this}
   */
  setName(name) {
    this.name = name;
    this.query.name = name;
    return this;
  }

  /**
   * raw 쿼리 작성
   * @param {string} query
   */
  rawQuery(query) {
    this._rawQuery += ' ' + query;
    return this;
  }

  /**
   * SELECT문 추가
   * @param {string[]} fields
   * @returns {this}
   */
  SELECT(...fields) {
    this.query.type = 'SELECT';
    this.query.selectFields = fields.length > 0 ? fields : ['*'];
    return this;
  }

  /**
   * INSERT 쿼리 시작
   * @param {string} table
   * @returns {this}
   */
  INSERT(table) {
    this.query.type = 'INSERT';
    this.query.table = table;
    return this;
  }

  /**
   * INSERT 필드 추가
   * @param {string[]} fields
   * @returns {this}
   */
  INSERT_FIELDS(...fields) {
    this.query.insertFields = fields;
    return this;
  }

  /**
   * INSERT 값 추가
   * @param {string[] | string[][]} values
   * @returns {this}
   */
  INSERT_VALUES(...values) {
    this.query.values = values;
    return this;
  }

  /**
   * UPDATE 쿼리 시작
   * @param {string} table
   * @returns {this}
   */
  UPDATE(table) {
    this.query.type = 'UPDATE';
    this.query.table = table;
    return this;
  }

  /**
   * UPDATE 필드 추가
   * @param {Record<string, any>} sets
   * @returns {this}
   */
  UPDATE_FIELDS(sets) {
    this.query.updateSets = sets;
    return this;
  }

  /**
   * DELETE 쿼리 시작
   * @param {string} table
   * @returns {this}
   */
  DELETE(table) {
    this.query.type = 'DELETE';
    this.query.table = table;
    return this;
  }

  /**
   * FROM 쿼리 시작
   * @param {string} table
   * @returns {this}
   */
  FROM(table) {
    this.query.table = table;
    return this;
  }

  /**
   * JOIN 조인 추가
   * @param {Join} params
   * @returns {this}
   */
  JOIN(params) {
    this.query.joins.push(params);
    return this;
  }

  /**
   * WHERE 조건절 추가
   * @param {string} predicate
   * @returns {this}
   */
  WHERE(predicate) {
    this.query.where = [predicate];
    return this;
  }

  /**
   * AND 조건절 추가
   * @param {string} predicate
   * @returns {this}
   */
  AND(predicate) {
    this.query.where.push('AND ' + predicate);
    return this;
  }

  /**
   * OR 조건절 추가
   * @param {string} predicate
   * @returns {this}
   */
  OR(predicate) {
    this.query.where.push('OR ' + predicate);
    return this;
  }

  /**
   * GROUP BY 필드 추가
   * @param {string[]} fields
   * @returns {this}
   */
  GROUP_BY(fields) {
    this.query.groupBy = fields;
    return this;
  }

  /**
   * HAVING 조건절 추가
   * @param {string} predicate
   * @returns {this}
   */
  HAVING(predicate) {
    this.query.having = [predicate];
    return this;
  }

  /**
   * ORDER BY 정렬 조건 추가
   * @param {OrderBy} params
   * @returns {this}
   */
  ORDER_BY(params) {
    this.query.orderBy.push(params);
    return this;
  }

  /**
   * LIMIT 제한 추가
   * @param {number} limit
   * @returns {this}
   */
  LIMIT(limit) {
    this.query.limit = limit;
    return this;
  }

  /**
   * OFFSET 추가
   * @param {number} offset
   * @returns {this}
   */
  OFFSET(offset) {
    this.query.offset = offset;
    return this;
  }

  /**
   * RETURNING 필드 추가
   * @param {string[]} fields
   * @returns {this}
   */
  RETURNING(...fields) {
    this.query.returning = true;
    if (fields.length === 0) {
      this.query.returningFields = ['*'];
    } else {
      this.query.returningFields = fields;
    }
    return this;
  }

  /**
   * 파라미터 추가
   * @param {Record<string, any>} params
   * @returns {this}
   */
  SET_PARAMS(params) {
    this.query.params = params;
    return this;
  }

  /**
   * 파라미터 추가
   * @param {string} key
   * @param {any} value
   * @returns {this}
   */
  SET_PARAM(key, value) {
    this.query.params[key] = value;
    return this;
  }


  /** 쿼리빌더 빌드
   * @abstract
   * @protected
   * @returns {any}
   */
  build() { }

  /**
   * raw 쿼리 빌드
   * @abstract
   * @protected
   * @returns {any}
   */
  rawQueryBuild() { }

  /**
   * 여러 개 조회
   * @abstract
   * @returns {any}
   */
  findMany() { }

  /**
   * 하나 조회
   * @abstract
   * @returns {any}
   */
  findOne() { }

  /**
   * 쿼리 실행
   * @abstract
   * @returns {any}
   */
  exec() { }

  /**
   * raw 쿼리 여러 개 조회
   * @abstract
   * @returns {any}
   */
  rawFindMany() { }

  /**
   * raw 쿼리 하나 조회
   * @abstract
   * @returns {any}
   */
  rawFindOne() { }

  /**
   * raw 쿼리 실행
   * @abstract
   * @returns {any}
   */
  rawExec() { }
}