import dayjs from 'dayjs'
const { Dayjs } = dayjs


/**
 * Common Types Module
 * 
 * This module defines common types, classes, and constants used throughout the project.
 * It provides abstract base classes for tracking creation and update information,
 * as well as metadata classes for pagination.
 * 
 * Usage Example:
 * ```javascript
 * // Using the CreatedUpdateTimeId class
 * class User extends CreatedUpdateTimeId {
 *   constructor(data) {
 *     super();
 *     this.id = data.id;
 *     this.name = data.name;
 *     this.createdTime = dayjs(data.created_time);
 *     this.updateTime = dayjs(data.update_time);
 *     this.createId = data.create_id;
 *     this.updateId = data.update_id;
 *   }
 * }
 * 
 * // Using the PaginationMetadata class
 * const metadata = new PaginationMetadata({
 *   totalCnt: 100,
 *   pageSize: 10,
 *   pageCnt: 1,
 *   totalPage: 10
 * });
 * 
 * // Using the Yn constant
 * const isActive = Yn.Y;
 * ```
 */

/** @typedef {'Y'|'N'} Yn */

/**
 * @abstract
 * @class CreatedUpdateTime
 */
export class CreatedUpdateTime {
  /** @type {Dayjs} */
  createdTime

  /** @type {Dayjs} */
  updateTime
}

/**
 * @abstract
 * @class CreatedUpdateId
 */
export class CreatedUpdateId {
  /** @type {string} */
  createId

  /** @type {string} */
  updateId
}

/**
 * @abstract
 * @class CreatedUpdateTimeId
 */
export class CreatedUpdateTimeId {
  /** @type {Dayjs} */
  createdTime

  /** @type {Dayjs} */
  updateTime

  /** @type {string} */
  createId

  /** @type {string} */
  updateId
}

export const Yn = Object.freeze({
  Y: 'Y',
  N: 'N'
})

/**
 * @abstract
 * @class Metadata
 */
export class Metadata { }

/**
 * 
 * @class PaginationMetadata
 */
export class PaginationMetadata extends Metadata {
  
  /** @type {number} */
  allCnt

  /** @type {number} */
  totalCnt

  /** @type {number} */
  pageCnt

  /** @type {number} */
  pageSize

  /** @type {number} */
  totalPage

  /**
   * PaginationMetadata 생성자
   * constructor of PaginationMetadata
   * 
   * @param {Object} params
   * @param {number} [params.allCnt=0] 전체 개수
   * @param {number} [params.totalCnt=0] 총 개수
   * @param {number} [params.pageCnt=0] 페이지 개수
   * @param {number} [params.pageSize=0] 페이지 크기
   * @param {number} [params.totalPage=0] 총 페이지 수
   */
  constructor(params = { allCnt: 0, totalCnt: 0, pageCnt: 0, pageSize: 0, totalPage: 0 }) {
    super()
    this.allCnt = params.allCnt
    this.totalCnt = params.totalCnt
    this.pageCnt = params.pageCnt
    this.pageSize = params.pageSize
    this.totalPage = params.totalPage
  }
}