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

// Load environment variables from .env file
config()

/**
 * JWT token configuration options
 * Defines the settings for token generation and validation
 * 
 * @type {import('jsonwebtoken').SignOptions}
 */
const webTokenOption = {
  algorithm: 'HS256', // Hashing algorithm
  expiresIn: '1 day', // Token validity period
  issuer: 'issuer', // Token issuer
  audience: 'audience', // Token audience
}

/**
 * Generates a new JWT token for user authentication
 * 
 * @param {string} userId - The unique identifier of the user
 * @returns {string} - The generated JWT token
 */
export const generateJwt = (userId) => {
  const payload = { userId }
  return jwt.sign(payload, 'secret', webTokenOption)
}

/**
 * JWT Strategy for Passport.js authentication
 * Handles token validation and user verification
 * 
 * Configuration:
 * - Uses HS256 algorithm for token verification
 * - Extracts token from Authorization header or custom access_token header
 * - Validates token issuer and audience
 * - Verifies user existence in database
 * 
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
    // Extract userId from token payload
    // Note: Payload key may vary depending on project requirements
    const userId = payload.userId

    // Verify user existence in database
    const userMapper = new UserMapper()
    const user = await userMapper.findUserByEmail(userId)
    if (!user) {
      return done(new NotFoundError({
        message: ResponseMessage.noUser,
        customMessage: "존재하지 않는 유저입니다."
      }), false)
    }

    // Return verified user
    return done(null, user)
  } catch (error) {
    // Handle any errors during verification
    return done(error, false)
  }
})