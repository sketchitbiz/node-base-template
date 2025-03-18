import { Strategy as LocalStrategy } from 'passport-local'
import { UserService } from '../modules/user/UserService.js'
export const localStrategy = new LocalStrategy({
  usernameField: 'email', // 프로젝트마다 다를 수 있음
  passwordField: 'password',
  session: false,
}, /**@type {import('passport-local').VerifyFunction} */async (email, password, done) => {
  const userService = new UserService()
  try {
    const user = await userService.login({ email, password })
    return done(null, user)
  } catch (error) {
    return done(error, false)
  }
})
