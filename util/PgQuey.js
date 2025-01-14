import { snakeToCamel } from './Functions.js';
import { logger } from './Logger.js';
import { AbstractQuery } from './types/AbstractQuery.js';


export class PgQueryBuilder extends AbstractQuery {

  /** @type {import('pg').PoolClient} @private */
  client;


  /**
   * Creates an instance of PgQueryBuilder.
   *
   * @constructor
   * @param {import('pg').PoolClient} client
   */
  constructor(client) {
    super();

    if (!client) {
      throw new Error('Client is required');
    }

    this.client = client;
  }

  build() {
    let query = '';

    // 쿼리 타입에 따라 쿼리 작성
    switch (this.query.type) {
      case 'SELECT':
        query = `SELECT ${this.query.selectFields.join(', ')} FROM ${this.query.table}`;
        break;

      case 'INSERT':
        let values;
        if (Array.isArray(this.query.values[0])) {
          values = this.query.values.map(value => `(${value.join(', ')})`).join(', ');
        } else {
          values = `(${this.query.values.join(', ')})`;
        }
        query = `INSERT INTO ${this.query.table} (${this.query.insertFields.join(', ')}) VALUES ${values}`;
        break;

      case 'UPDATE':
        let sets = Object.entries(this.query.updateSets).map(([key, value]) => `${key} = ${value}`).join(', ');
        query = `UPDATE ${this.query.table} SET ${sets}`;
        break;

      case 'DELETE':
        query = `DELETE FROM ${this.query.table}`;
        break;

      default:
        throw new Error('Invalid query type');
    }

    // Join 조건 추가
    for (const join of this.query.joins) {
      query += `${join.type} JOIN ${join.table} ON ${join.on}`;
    }

    // Where 조건 추가
    if (this.query.where.length > 0) {
      query += ` WHERE ${this.query.where.join(' ')}`;
    }

    // group by 조건 추가
    if (this.query.groupBy.length > 0) {
      query += ` GROUP BY ${this.query.groupBy.join(', ')}`;
    }

    // having 조건 추가
    if (this.query.having.length > 0) {
      query += ` HAVING ${this.query.having.join(' ')}`;
    }

    // order by 조건 추가
    if (this.query.orderBy.length > 0) {
      query += ` ORDER BY ${this.query.orderBy.join(', ')}`;
    }

    // limit 조건 추가
    if (this.query.limit) {
      query += ` LIMIT ${this.query.limit}`;
    }

    // limit 조건 추가
    if (this.query.limit) {
      query += ` LIMIT ${this.query.limit}`;
    }

    // limit절 추가
    if (this.query.limit) {
      query += ` LIMIT ${this.query.limit}`;
    }

    // offset 조건 추가
    if (this.query.offset) {
      query += ` OFFSET ${this.query.offset}`;
    }

    query += ';';

    const values = [];
    const paramList = Object.keys(this.query.params).sort((a, b) => b.length - a.length);
    let index = 1;
    logger.debug(`Query: ${this.name}`, { query, params: this.query.params });
    paramList.forEach(key => {
      const newSql = query.replace(new RegExp(`:${key}`, 'g'), `$${index}`);

      if (newSql !== query) {
        query = newSql;
        values.push(this.query.params[key]);
        index++;
      }
    });

    /** @type {import('pg').QueryConfig} */
    const result = {
      name: this.name,
      text: query,
      values: values,
    };

    logger.debug(`Raw Query: ${this.name}`, result);

    return result;
  }

  rawQueryBuild() {
    let query = this._rawQuery;
    const paramList = Object.keys(this.query.params).sort((a, b) => b.length - a.length);
    let index = 1;

    const values = [];
    paramList.forEach(key => {
      const newSql = query.replace(new RegExp(`:${key}`, 'g'), `$${index}`);

      if (newSql !== query) {
        query = newSql;
        values.push(this.query.params[key]);
        index++;
      }
    });

    /** @type {import('pg').QueryConfig} */
    const result = {
      name: this.name,
      text: query,
      values: values,
    };

    logger.debug(`Raw Query: ${this.name}`, result);

    return result;
  }


  /**
   * 많은 데이터를 조회하는 쿼리
   * @template T
   * @async
   * @returns {Promise<T[] | null>}
   */
  async findMany() {
    const query = this.build();
    const { rows, rowCount } = await this.client.query(query);

    if (rowCount === 0) {
      return null;
    }

    return snakeToCamel(rows);
  }


  /**
   * 하나의 데이터를 조회하는 쿼리
   * @template T
   * @async
   * @returns {Promise<T | null>}
   */
  async findOne() {
    const query = this.build();
    const { rows, rowCount } = await this.client.query(query);

    if (rowCount === 0) {
      return null;
    }

    return snakeToCamel(rows[0]);
  }

  /**
   * 쿼리 실행
   * @template T
   * @async
   * @returns {Promise<T | null>}
   */
  async exec() {
    const query = this.build();
    const { rows, rowCount } = await this.client.query(query);

    if (rowCount > 1) {
      return snakeToCamel(rows);
    } else if (rowCount === 1) {
      return snakeToCamel(rows[0]);
    }

    return;
  }


  /**
   * 많은 데이터를 조회하는 쿼리
   * @template T
   * @async
   * @returns {Promise<T[] | null>}
   */
  async rawFindMany() {
    const query = this.rawQueryBuild();
    const { rows, rowCount } = await this.client.query(query);

    if (rowCount === 0) {
      return null;
    }

    return snakeToCamel(rows);
  }

  /**
   * 하나의 데이터를 조회하는 쿼리
   * @template T
   * @async
   * @returns {Promise<T | null>}
   */
  async rawFindOne() {
    const query = this.rawQueryBuild();
    const { rows, rowCount } = await this.client.query(query);

    if (rowCount === 0) {
      return null;
    }

    return snakeToCamel(rows[0]);
  }

  /**
   * 쿼리 실행
   * @template T
   * @async
   * @returns {Promise<T | null>}
   */
  async rawExec() {
    const query = this.rawQueryBuild();
    const { rows, rowCount } = await this.client.query(query);

    if (rowCount > 1) {
      return snakeToCamel(rows);
    } else if (rowCount === 1) {
      return snakeToCamel(rows[0]);
    }

    return;
  }
}

