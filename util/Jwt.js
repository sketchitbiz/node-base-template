import { config } from 'dotenv'
import jwt from 'jsonwebtoken'
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt'
import { UserMapper } from '../modules/user/UserMapper.js'
import { NotFoundError } from "./types/Error.js"
import { ResponseMessage } from "./types/ResponseMessage.js"

config()

/** @type {import('jsonwebtoken').SignOptions} */
const webTokenOption = {
  algorithm: 'HS256', // 해싱 알고리즘
  expiresIn: '1 day', // 토큰 유효 기간
  issuer: 'issuer', // 발행
  audience: 'audience', // 수취
}

/**
 * 토큰 발행
 *
 * @param {string} userId
 * @returns {string}
 */
export const generateJwt = (userId) => {
  const payload = { userId }

  return jwt.sign(payload, 'secret', webTokenOption)
}


/**
 * jwt 전략
 * @type {import('passport-jwt').Strategy}
 */
export const jwtStrategy = new JwtStrategy({
  algorithms: ['HS256'],
  passReqToCallback: true,
  secretOrKey: 'secret',
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() || ExtractJwt.fromHeader('access_token'),
  audience: 'audience',
  issuer: 'issuer',
}, async (req, payload, done) => {
  try {

    // NOTE: 프로젝트마다 payload의 key값이 다를 수 있음
    const userId = payload.userId

    const userMapper = new UserMapper()
    const user = await userMapper.findUserByEmail(userId)
    if (!user) {
      return done(new NotFoundError({ message: ResponseMessage.noUser, customMessage: "존재하지 않는 유저입니다." }), false)
    }

    return done(null, user)
  } catch (error) {
    return done(error, false)
  }
})