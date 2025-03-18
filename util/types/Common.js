import dayjs from 'dayjs'
const { Dayjs } = dayjs

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

}