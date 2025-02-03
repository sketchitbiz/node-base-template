import { BaseMapper } from '../../util/types/BaseMapper.js'
import { UserMst } from "./UserMst.js"


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
    return this.exec(async query =>
      query.setName('createUser')
        .INSERT(`public.user_mst`)
        .INSERT_FIELDS('name', 'email', 'password')
        .INSERT_VALUES(`'${user.name}'`, `'${user.email}'`, `'${user.password}'`)
        .RETURNING()
        .exec()
    )
  }

  /**
   * 이메일 존재 여부 확인
   *
   * @async
   * @param {string} email
   * @returns {Promise<boolean >}
   */
  async checkEmailExists(email) {
    return this.exec(async query => {
      const result = await query.setName('checkEmailExists')
        .rawQuery(`SELECT exists(SELECT 1 FROM public.user_mst WHERE email = :email)`)
        .SET_PARAMS({ email })
        .rawExec()


      return result[0]['exists'] === true
    })
  }


  /**
   * 모든 사용자 조회
   *
   * @async
   * @returns {Promise<UserMst[]>}
   */
  async findAllUsers() {
    return this.exec(async query =>
      query.setName('findAllUsers')
        .SELECT('um.*')
        .FROM('public.user_mst um')
        .findMany()
    )
  }

  /**
   * 이메일로 사용자 조회
   *
   * @async
   * @param {string} email
   * @returns {Promise<UserMst | null>}
   */
  async findUserByEmail(email) {
    return this.exec(async query =>
      query.setName('findUserByEmail')
        .SELECT('um.*')
        .FROM('public.user_mst um')
        .WHERE('um.email = :email')
        .SET_PARAMS({ email })
        .findOne()
    )
  };

  /**
   * 이메일로 사용자 조회
   *
   * @async
   * @param {string} email
   * @returns {Promise<UserMst | null>}
   */
  async findUserByEmailWithPassword(email) {
    return this.exec(async query =>
      query.setName('findUserByEmailWithPassword')
        .SELECT('um.index', 'um.name', 'um.email', 'um.password')
        .FROM('public.user_mst um')
        .WHERE('um.email = :email')
        .SET_PARAMS({ email })
        .findOne()
    )
  }

  /**
   * 인덱스로 사용자 조회
   *
   * @async
   * @param {number} index
   * @returns {Promise<UserMst | null>}
   */
  async findUserByIndex(index) {
    return this.exec(async query =>
      query.setName('findUserByIndex')
        .SELECT('um.*')
        .FROM('public.user_mst um')
        .WHERE('um.index = :index')
        .SET_PARAMS({ index })
        .findOne()
    )
  }

  /**
   * 사용자 업데이트
   *
   * @async
   * @param {{user: Partial<UserMst>, index: number}} param0  
   * @returns {Promise<UserMst>}
   */
  async updateUser({ user, index }) {
    return this.exec(async query =>
      query.setName('updateUser')
        .UPDATE('public.user_mst')
        .UPDATE_FIELDS({
          name: `'${user.name}'`,
          email: `'${user.email}'`,
          password: `'${user.password}'`
        })
        .WHERE(`index = ${index}`)
        .exec()
    )
  }
}
