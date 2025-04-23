import Redis, { type ChainableCommander, type RedisOptions } from 'ioredis'
import { logger } from 'src/util/Logger'

export interface RedisInterface {
  beginTransaction: () => ChainableCommander,
  pipline: () => ChainableCommander,
  exec: (pipline: ChainableCommander) => Promise<[Error | null, any][]>,
  discard: (pipline: ChainableCommander) => Promise<void>,
  set: (key: string, value: string, expireSeconds?: number) => Promise<'OK'>,
  get: (key: string) => Promise<string | null>,
  del: (key: string | string[]) => Promise<number>,
  exists: (key: string) => Promise<boolean>,
  hset: (key: string, field: string, value: string) => Promise<number>,
  hget: (key: string, field: string) => Promise<string | null>,
  hdel: (key: string, field: string | string[]) => Promise<number>,
  hgetall: (key: string) => Promise<Record<string, string>>,
  hkeys: (key: string) => Promise<string[]>,
  hvals: (key: string) => Promise<string[]>,
  hlen: (key: string) => Promise<number>,
  hincrby: (key: string, field: string, increment: number) => Promise<number>,
  hincrbyfloat: (key: string, field: string, increment: number) => Promise<number>,
  hsetnx: (key: string, field: string, value: string) => Promise<number>,
  hmset: (key: string, fields: Record<string, string>) => Promise<string>,
  hmget: (key: string, fields: string | string[]) => Promise<string[]>,
  flushAll: () => Promise<'OK'>,
  disconnect: () => Promise<'OK'>,
  getClient: () => Redis,
}

export async function createRedisConnection(config: RedisOptions) {
  const client = new Redis({
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
    db: 1,
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
    logger.info('Redis 연결 확인 완료')
  }
  catch (err) {
    logger.error(`Redis 연결 확인 실패: ${err}`)
    throw err
  }


  const redisInterface: RedisInterface = {
    beginTransaction() {
      return client.multi()
    },

    pipline() {
      return client.pipeline()
    },

    async exec(pipline) {
      const result = await pipline.exec()
      return result || []
    },

    async set(key, value, expireSeconds) {
      if (expireSeconds) {
        return client.setex(key, expireSeconds, value)
      }
      return client.set(key, value)
    },

    async get(key) {
      return client.get(key)
    },

    async del(key) {
      return Array.isArray(key) ? await client.del(...key) : await client.del(key)
    },

    async exists(key) {
      const result = await client.exists(key)
      return result === 1
    },

    async hset(key, field, value) {
      return client.hset(key, field, value)
    },

    async hget(key, field) {
      return client.hget(key, field)
    },

    async hdel(key: string, field: string | string[]) {
      return Array.isArray(field) ? await client.hdel(key, ...field) : await client.hdel(key, field)
    },

    async hgetall(key) {
      return client.hgetall(key)
    },

    async hkeys(key) {
      return client.hkeys(key)
    },

    async hvals(key) {
      return client.hvals(key)
    },

    async hlen(key) {
      return client.hlen(key)
    },

    async hincrby(key, field, increment) {
      return client.hincrby(key, field, increment)
    },

    async hincrbyfloat(key: string, field: string, increment: number): Promise<number> {
      return Number(await client.hincrbyfloat(key, field, increment))
    },

    async hsetnx(key, field, value) {
      return client.hsetnx(key, field, value)
    },
    async hmset(key: string, fields: Record<string, string>): Promise<string> {
      return client.hmset(key, fields)
    },

    async hmget(key: string, fields: string | string[]): Promise<string[]> {
      const result = await client.hmget(key, ...(Array.isArray(fields) ? fields : [fields]))
      return result.filter((val): val is string => val !== null)
    },

    async flushAll() {
      return client.flushall()
    },

    async disconnect(): Promise<"OK"> {
      client.disconnect()
      return 'OK'
    },

    getClient() {
      return client
    },

    async discard() {
      await client.discard()

    },
  }

  return redisInterface
}


export let redisManager: RedisInterface

export async function initRedisManager() {
  redisManager = await createRedisConnection({
    host: 'localhost',
    port: 6379,
    db: 1,
  })
}

