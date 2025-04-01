/**
 * Response Message Module
 * 
 * This module defines standardized response messages used throughout the application.
 * It provides a consistent set of messages for various API response scenarios,
 * including success, errors, and specific application states.
 * 
 * The messages are frozen objects to prevent modification during runtime,
 * ensuring consistency across the application.
 * 
 * Usage Example:
 * ```javascript
 * // Import the ResponseMessage object
 * import { ResponseMessage } from './ResponseMessage.js';
 * 
 * // Use in API responses
 * return {
 *   status: 200,
 *   message: ResponseMessage.success,
 *   data: result
 * };
 * 
 * // Use in error handling
 * throw new Error(ResponseMessage.unauthorized);
 * 
 * // Use in conditional responses
 * return data ? 
 *   { message: ResponseMessage.success, data } : 
 *   { message: ResponseMessage.noData };
 * ```
 */
export const ResponseMessage = Object.freeze({
  success: 'success',
  noData: 'no data',
  noUser: 'no user',
  tokenRequired: 'token is required',
  tokenInvalid: 'token is invalid',
  passwordIncorrect: 'password is incorrect',
  userExist: `user exist`,
  fail: 'fail',
  conflict: 'conflict',
  noAdmin: 'no admin',
  platformRequired: 'platform is required',
  cannotConnectSns: 'cannot connect sns',
  adminExist: 'admin exist',
  needMoreInfo: 'need more info',
  badRequest: 'bad request',
  forbidden: 'forbidden',
  unauthorized: 'unauthorized',
  internalServerError: 'internal server error',
});