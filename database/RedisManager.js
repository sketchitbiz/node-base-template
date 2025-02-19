import Redis from 'ioredis'
import { logger } from '../util/Logger.js'

/**
 * Redis 작업을 위한 인터페이스 타입
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
 * Redis 클라이언트를 생성하고 연결합니다
 * @param {import('ioredis').RedisOptions} config - Redis 설정
 * @returns {Promise<RedisInterface>} Redis 작업을 위한 함수들을 포함한 객체
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

  // 이벤트 리스너 설정
  client.on('error', err => logger.error(`Redis 클라이언트 에러: ${err}`))
  client.on('connect', () => logger.info('Redis 클라이언트 연결 완료'))
  client.on('ready', () => logger.info('Redis 클라이언트 준비 완료'))
  client.on('reconnecting', () => logger.info('Redis 재연결 시도 중...'))

  // 연결 확인
  try {
    await client.ping()
  } catch (err) {
    console.error("Redis 연결 실패: ", err)
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
          logger.debug(`Redis: ${methodName} 실행`, { args })

          try {
            const result = await originalMethod.apply(this, args)
            logger.debug(`Redis: ${methodName} 결과`, { result })
            return result
          } catch (error) {
            logger.error(`Redis: ${methodName} 에러`, { error, args })
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
