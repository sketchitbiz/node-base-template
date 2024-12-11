import { CreatedUpdateTimeId } from "../../util/types/Common.js";

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