import dayjs from 'dayjs'
import { CreatedUpdateTimeId } from '../../../util/types/Common.js'
const { Dayjs } = dayjs

// UserMst 테이블 정의
// Define UserMst table

/** @typedef {'U'|'C'} UserType */
export const UserType = Object.freeze({
  U: 'U',
  C: 'C'
})


/**
 * user_mst
 *
 * @export
 * @class UserMst
 */
export class UserMst extends CreatedUpdateTimeId {
  /** @type {number} */
  index

  /** @type {string} */
  name

  /** @type {string} */
  email

  /** @type {string} */
  password


}