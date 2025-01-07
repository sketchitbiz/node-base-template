import { BaseMapper } from '../../util/types/BaseMapper.js';
import { UserMst } from "./UserMst.js";


/**
 *
 * @class UserMapper
 */
export class UserMapper extends BaseMapper {


  /**
   * 사용자 생성
   *
   * @async
   * @param {Partial<UserMst>} user
   * @returns {Promise<UserMst>}
   */
  async createUser(user) {
    // @ts-ignore
    return this.exec(async query => query.setName('createUser')
      .insert(`public.user_mst`, true)
      .insertFields('name', 'email', 'password')
      .insertValues(`'${user.name}'`, `'${user.email}'`, `'${user.password}'`)
      .exec()
    );
  }

  /**
   * 이메일 존재 여부 확인
   *
   * @async
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  async checkEmailExists(email) {
    const result = await this.exec(async query => query.setName('checkEmailExists')
      .setQuery(`SELECT exists(SELECT 1 FROM public.user_mst WHERE email = :email)`)
      .setParams({ email })
      .rawExec()
    );

    if (result[0]['exists']) {
      return true;
    }

    return false;
  }


  /**
   * 모든 사용자 조회
   *
   * @async
   * @returns {Promise<UserMst[]>}
   */
  async findAllUsers() {
    return this.exec(async query => query.setName('findAllUsers')
      .select('um.*')
      .from('public.user_mst um')
      .findMany()
    );
  }

  /**
   * 이메일로 사용자 조회
   *
   * @async
   * @param {string} email
   * @returns {Promise<UserMst | null>}
   */
  async findUserByEmail(email) {
    return this.exec(async query => query.setName('findUserByEmail')
      .select('um.*')
      .from('public.user_mst um')
      .where('um.email = :email')
      .setParams({ email })
      .findOne()
    );
  }

  /**
   * 인덱스로 사용자 조회
   *
   * @async
   * @param {number} index
   * @returns {Promise<UserMst | null>}
   */
  async findUserByIndex(index) {
    return this.exec(async query => query.setName('findUserByIndex')
      .select('um.*')
      .from('public.user_mst um')
      .where('um.index = :index')
      .setParams({ index })
      .findOne()
    );
  }
}