/** @typedef {'Y'|'N'} Yn */
/** @typedef {'C'|'U'} UserType */

/** @typedef {'KAKAO' | 'APPLE' | 'ID'} Provider */

/**
 * @abstract
 * @class CreatedUpdateTime
 */
export class CreatedUpdateTime {
  /** @type {Dayjs} */
  createdTime;

  /** @type {Dayjs} */
  updateTime;
}

/**
 * @abstract
 * @class CreatedUpdateId
 */
export class CreatedUpdateId {
  /** @type {string} */
  createId;

  /** @type {string} */
  updateId;
}

/**
 * @abstract
 * @class CreatedUpdateTimeId
 */
export class CreatedUpdateTimeId {
  /** @type {Dayjs} */
  createdTime;

  /** @type {Dayjs} */
  updateTime;

  /** @type {string} */
  createId;

  /** @type {string} */
  updateId;
}