import { UserService } from '@/modules/user/UserService'
import { Strategy as LocalStrategy } from 'passport-local'



export const localStrategy = new LocalStrategy({
  // 프로젝트마다 username, password 컬럼 이름이 다를 수 있음
  usernameField: 'email',
  passwordField: 'password',
  session: false,
}, async (username, password, done) => {
  const userService = new UserService()
  try {
    const user = await userService.login({ email: username, password })
    done(null, user)
  } catch (error) {
    done(error, false)
  }
  // 데이터베이스에서 사용자 조회
  // 사용자가 존재하면 done(null, user)
  // 사용자가 존재하지 않으면 done(null, false, { message: '사용자를 찾을 수 없습니다.' })
  // 비밀번호가 일치하지 않으면 done(null, false, { message: '비밀번호가 일치하지 않습니다.' })
  // 비밀번호가 일치하면 done(null, user)
})