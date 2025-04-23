import type { Request } from 'express'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt'
import { UserMapper } from 'src/modules/user/UserMapper'
import { NotFoundError, UnauthorizedError } from './types/Error'
import { ResponseMessage } from './types/ResponseMessage'


const webTokenOption: SignOptions = {
  algorithm: 'HS256',
  expiresIn: '1 day',
  issuer: 'issuer',
  audience: 'audience'
}


/**
 * JWT 생성
 */
export function generateJwt(userId: string) {
  const payload = { userId }

  return jwt.sign(payload, 'secretKey', webTokenOption)
}


/**
 * Jwt 전략
 */
export const jwtStategy = new JwtStrategy({
  algorithms: ['HS256'],
  passReqToCallback: true,
  secretOrKey: 'secret',

  jwtFromRequest: ExtractJwt.fromExtractors([
    (req: Request) => ExtractJwt.fromAuthHeaderAsBearerToken()(req),
    (req: Request) => ExtractJwt.fromHeader('access_token')(req),
    (req: Request) => req.cookies['access_token']
  ]),
  audience: 'audience',
  issuer: 'issuer',
}, async (req, payload, done) => {
  const userId = payload.userId

  const userMapper = new UserMapper()
  const user = await userMapper.findUserByEmail(userId)

  if (!user) {
    return done(new NotFoundError({ message: ResponseMessage.NO_USER, customMessage: "존재하지 않는 유저입니다." }), null)
  }

  if (!userId) {
    return done(new UnauthorizedError({ message: ResponseMessage.TOKEN_INVALID, customMessage: "유효하지 않는 토큰입니다." }), null)
  } else {
    done(null, user)
  }
})