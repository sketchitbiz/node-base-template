
import Joi from 'joi';
import { CreatedUpdateTimeAndIdSchema, CreatedUpdateTimeId, JoiDayjs, Provider, Yn } from '../../util/types/Common.js';


export const UserType = Object.freeze({
  U: 'U',
  C: 'C'
});

export const UserMstSchema = CreatedUpdateTimeAndIdSchema.keys({
  uid: Joi.string(),
  name: Joi.string().allow(null),
  cellphone: Joi.string().allow(null),
  email: Joi.string().allow(null),
  lastLoginProvider: Joi.string().valid(...Object.values(Provider)).required(),
  lastLoginTime: JoiDayjs.allow(null),
  type: Joi.string().valid(...Object.values(UserType)).required(),
  marketingAgreeYn: Joi.string().valid(...Object.values(Yn)).default(Yn.N),
  mergedYn: Joi.string().valid(...Object.values(Yn)).allow(null).default(null)
});

export const PartialUserMstSchema = UserMstSchema.fork(Object.keys(UserMstSchema.describe().keys), (schema) => schema.optional());



/**
 * user_mst
 *
 * @export
 * @class UserMst
 * @typedef {UserMst}
 */
export class UserMst extends CreatedUpdateTimeId {

  /** @type {string} */
  name;

  /** @type {string} */
  cellphone;

  /** @type {string} */
  email;

  /** @type {Provider} */
  lastLoginProvider;

  /** @type {Dayjs} */
  lastLoginTime;

  /** @type {UserType} */
  type;

  /** @type {Yn} */
  marketingAgreeYn;

  /** @type {Yn} */
  mergedYn;
}