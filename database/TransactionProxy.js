import { AsyncLocalStorage } from "async_hooks"
import { PgDBManager, transaction } from './DatabaseManager.js'

/**
 * TransactionProxy.js
 * 
 * This module provides transaction management functionality for service classes.
 * It uses AsyncLocalStorage to maintain transaction context across async operations
 * and automatically wraps service methods in database transactions.
 * 
 * Key features:
 * - Automatic transaction wrapping for service methods
 * - Transaction context management using AsyncLocalStorage
 * - Proxy-based method interception
 * - Support for nested transactions
 */

// Storage for maintaining transaction context across async operations
const txContext = new AsyncLocalStorage()

/**
 * Retrieves the current transaction context
 * @returns {PgDBManager} The current database manager instance in the transaction context
 */
export function getManager() {
  return txContext.getStore()
}

/**
 * Determines if a method should be wrapped in a transaction
 * @param {string} prop - Method name to check
 * @returns {boolean} True if the method should be wrapped in a transaction
 */
const shouldWrapTransaction = (prop) => {
  return typeof prop === 'string'
    && !prop.startsWith('_')
    && !['constructor', 'withTransaction', 'client'].includes(prop)
}

/**
 * Creates a transactional wrapper for a service class
 * 
 * This function takes a service class and returns a new class that automatically
 * wraps all public methods in database transactions. It uses a Proxy to intercept
 * method calls and ensures that each method runs within its own transaction context.
 * 
 * Features:
 * - Automatic transaction management for all public methods
 * - Transaction context preservation across async operations
 * - Method-specific transaction isolation
 * - Proper cleanup of database connections
 * 
 * @param {new (...args: any[]) => any} Target - The service class to wrap
 * @returns {new (...args: any[]) => any} A new class with transaction support
 * 
 * @example
 * class UserService {
 *   async createUser(userData) {
 *     // This method will automatically run in a transaction
 *   }
 * }
 * 
 * const TransactionalUserService = createTransactionalService(UserService)
 */
export function createTransactionalService(Target) {
  return class extends Target {
    constructor(...args) {
      // @ts-ignore
      super(...args)

      return new Proxy(this, {
        /**
         * Intercepts property access on the service instance
         * Wraps method calls in transactions if appropriate
         * 
         * @param {any} target - The original service instance
         * @param {string | symbol} prop - The property being accessed
         * @param {any} receiver - The proxy or object that the property access was initiated on
         * @returns {any} The wrapped method or original property value
         */
        get(target, prop, receiver) {
          const value = target[prop]

          if (typeof value === 'function' && shouldWrapTransaction(String(prop))) {
            return async function (...args) {
              const newClient = new PgDBManager()
              await newClient.connect()
              return transaction(newClient, async (client) => {
                return txContext.run(client, () => value.apply(target, args))
              })
            }
          }
          return value
        }
      })
    }
  }
}