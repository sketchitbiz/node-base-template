/**
 * Local Authentication Strategy Module
 * 
 * This module provides local authentication functionality using Passport.js Local Strategy.
 * It handles user authentication using email and password credentials.
 * 
 * Usage:
 * 1. Authentication Strategy:
 *    - localStrategy: Passport.js strategy for local authentication
 * 
 * Configuration:
 * - Username Field: 'email' (can be customized per project)
 * - Password Field: 'password'
 * - Session: disabled (stateless)
 * 
 * Example:
 * ```javascript
 * // Use in Express route with Passport
 * app.post('/login', 
 *   passport.authenticate('local', { session: false }), 
 *   (req, res) => {
 *     // Handle successful login
 *   }
 * );
 * 
 * // Client-side usage
 * // Send credentials in request body
 * {
 *   "email": "user@example.com",
 *   "password": "userPassword123"
 * }
 * ```
 */

import { Strategy as LocalStrategy } from 'passport-local'
import { UserService } from '../modules/user/UserService.js'

/**
 * Local Strategy for Passport.js authentication
 * Handles user authentication using email and password
 * 
 * Configuration:
 * - Uses email as username field
 * - Uses password field for credentials
 * - Disables session (stateless authentication)
 * 
 * @type {import('passport-local').Strategy}
 */
export const localStrategy = new LocalStrategy({
  usernameField: 'email', // Can be customized per project
  passwordField: 'password',
  session: false,
}, /**@type {import('passport-local').VerifyFunction} */async (email, password, done) => {
  const userService = new UserService()
  try {
    // Attempt to authenticate user
    const user = await userService.login({ email, password })
    return done(null, user)
  } catch (error) {
    // Handle authentication errors
    return done(error, false)
  }
})
