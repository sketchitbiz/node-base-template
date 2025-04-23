import { CreatedUpdateTime } from '../../../util/types/Common'


export interface UserMst extends CreatedUpdateTime {
  index: number
  name: string
  email: string
  password: string
}