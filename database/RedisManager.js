import Redis from 'ioredis'
import { logger } from '../util/Logger.js'

/**
 * Interface type for Redis operations
 * @typedef {Object} RedisInterface
 * @property {() => import('ioredis').ChainableCommander} beginTransaction
 * @property {() => import('ioredis').ChainableCommander} pipeline
 * @property {(pipeline: import('ioredis').ChainableCommander) => Promise<[Error|null, any][]>} exec
 * @property {(pipeline: import('ioredis').ChainableCommander) => Promise<import('ioredis').ChainableCommander>} discard
 * @property {(key: string, value: string, expireSeconds?: number) => Promise<'OK'>} set
 * @property {(key: string) => Promise<string | null>} get
 * @property {(key: string | string[]) => Promise<number>} del
 * @property {(key: string) => Promise<boolean>} exists
 * @property {() => Promise<'OK'>} flushAll
 * @property {() => Promise<'OK'>} disconnect
 * @property {() => import('ioredis').Redis} getClient
 */

/**
 * Creates and establishes a connection to Redis
 * @param {import('ioredis').RedisOptions} config - Redis configuration options
 * @returns {Promise<RedisInterface>} Object containing Redis operation functions
 */
export async function createRedisConnection(config = {}) {
  const client = new Redis({
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    ...config
  })

  // Set up event listeners
  client.on('error', err => logger.error(`Redis client error: ${err}`))
  client.on('connect', () => logger.info('Redis client connected'))
  client.on('ready', () => logger.info('Redis client ready'))
  client.on('reconnecting', () => logger.info('Attempting to reconnect to Redis...'))

  // Verify connection
  try {
    await client.ping()
  } catch (err) {
    console.error("Redis connection failed: ", err)
    throw err
  }

  /** @type {RedisInterface} */
  const redisInterface = {
    beginTransaction: () => {
      return client.multi()
    },

    pipeline: () => {
      return client.pipeline()
    },

    /**
     * Executes a pipeline of Redis commands
     * @param {import('ioredis').ChainableCommander} pipeline
     * @returns {Promise<[Error|null, any][]>}
     */
    exec: async (pipeline) => {
      const result = await pipeline.exec()
      return result || []
    },

    discard: async (pipeline) => {
      return pipeline.discard()
    },

    set: async (key, value, expireSeconds) => {
      if (expireSeconds) {
        return await client.setex(key, expireSeconds, value)
      }
      return await client.set(key, value)
    },

    get: async (key) => {
      return await client.get(key)
    },

    del: async (key) => {
      return Array.isArray(key)
        ? await client.del(...key)
        : await client.del(key)
    },

    exists: async (key) => {
      const result = await client.exists(key)
      return result === 1
    },

    flushAll: async () => {
      return await client.flushall()
    },

    disconnect: async () => {
      return await client.quit()
    },

    getClient: () => client
  }

  return new Proxy(redisInterface, {
    get(target, prop, receiver) {
      const originalMethod = target[prop]

      if (typeof originalMethod === 'function') {
        return async function (...args) {
          const methodName = prop.toString()
          logger.debug(`Redis: Executing ${methodName}`, { args })

          try {
            const result = await originalMethod.apply(this, args)
            logger.debug(`Redis: ${methodName} result`, { result })
            return result
          } catch (error) {
            logger.error(`Redis: ${methodName} error`, { error, args })
            throw error
          }
        }
      }

      return originalMethod
    }
  })
}

/** @type {RedisInterface} */
export const redisManager = await createRedisConnection({ username: 'heredot', password: 'heredot', db: 1 })
