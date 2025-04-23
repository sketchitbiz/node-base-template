import { BaseMapper } from 'src/util/types/BaseMapper'
import type { UserMst } from './models/UserMst'

export class UserMapper extends BaseMapper {

  async createUser(params: Omit<UserMst, 'index'>) {
    return this.exec(async query => query.setName('createUser')
      .INSERT(`public.user_mst`).INSERT_FIELDS('name', 'email', 'password')
      .INSERT_VALUES(`'${params.name}'`, `'${params.email}'`, `'${params.password}'`).RETURNING()
      .exec<UserMst>()
    )
  }

  async checkEmailExist(email: string) {
    return this.exec(async query => {
      const result = await query.setName('checkEmailExist')
        .rawQuery(`SELECT exists(SELECT 1 FROM public.user_mst WHERE email = :email)`)
        .SET_PARAMS({ email })
        .rawExec()

      return result[0]['exists'] === true
    }
    )
  }

  async findAllUsers() {
    return this.exec(async query => query.setName('findAllUsers')
      .SELECT('um.index', 'um.name', 'um.email')
      .FROM(`public.user_mst um`)
      .findMany<UserMst>()
    )
  }

  async findUserByIndex(index: number) {
    return this.exec(async query => query.setName('findUserByIndex')
      .SELECT('um.*')
      .FROM(`public.user_mst um`)
      .WHERE(`um.index = :index`)
      .SET_PARAMS({ index })
      .findOne<UserMst>()
    )
  }

  async findUserByEmail(email: string) {
    return this.exec(async query => query.setName('findUserByEmail')
      .SELECT('um.index', 'um.name', 'um.email')
      .FROM(`public.user_mst um`)
      .WHERE(`um.email = :email`)
      .SET_PARAMS({ email })
      .findOne<UserMst>()
    )
  }

  async findUserByEmailWithPassword(email: string) {
    return this.exec(async query => query.setName('findUserByEmailWithPassword')
      .SELECT('um.index', 'um.name', 'um.email', 'um.password')
      .FROM(`public.user_mst um`)
      .WHERE(`um.email = :email`)
      .SET_PARAMS({ email })
      .findOne<UserMst>()
    )
  }

  async updateUser(params: Partial<UserMst>) {
    return this.exec(async query => query.setName('updateUser')
      .UPDATE(`public.user_mst`)
      .UPDATE_FIELDS(params)
      .WHERE(`um.index = :index`)
      .SET_PARAMS({ index: params.index })
      .RETURNING()
      .exec<UserMst>()
    )
  }
}