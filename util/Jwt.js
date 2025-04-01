/**
 * JWT (JSON Web Token) Utility Module
 * 
 * This module provides JWT authentication functionality for the application, including:
 * - JWT token generation
 * - JWT authentication strategy for Passport.js
 * - Token validation and user verification
 * 
 * Usage:
 * 1. Token Generation:
 *    - generateJwt(userId): Generate a new JWT token for a user
 * 
 * 2. Authentication Strategy:
 *    - jwtStrategy: Passport.js strategy for JWT authentication
 * 
 * Configuration:
 * - Token Options:
 *   - Algorithm: HS256
 *   - Expiration: 1 day
 *   - Issuer: 'issuer'
 *   - Audience: 'audience'
 * 
 * Example:
 * ```javascript
 * // Generate token
 * const token = generateJwt('user123');
 * 
 * // Use in Express route with Passport
 * app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
 *   // Handle authenticated request
 * });
 * 
 * // Client-side usage
 * // Add token to Authorization header
 * headers: {
 *   'Authorization': `Bearer ${token}`
 * }
 * ```
 */

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