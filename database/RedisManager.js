import { createClient } from 'redis';
export class RedisManager {

  
  /**
   * 인스턴스
   * @private
   * @type {RedisManager}
   */
  static #instance;

  /**
   * Creates an instance of RedisManager.
   * @private
   * @constructor
   */
  constructor() {
    this.client = createClient({ legacyMode: false });

    this.client.connect().catch(err => console.error("Redis 연결 실패: ", err));

    this.client.on('error', err => console.error(`Redis 클라이언트 에러: ${err}}`));

    this.client.on('connect', () => console.log('Redis 클라이언트 연결 완료'));
  }

  static getInstance() { 
    if (!RedisManager.#instance) {
      RedisManager.#instance = new RedisManager();
    }

    return RedisManager.#instance;
  }


  /**
   * Redis에 key-value 쌍을 저장합니다
   * @param {string} key - 저장할 키
   * @param {string} value - 저장할 값
   * @param {number} [expireSeconds] - 만료 시간(초)
   * @returns {Promise<void>}
   */
  async set(key, value, expireSeconds) {
    if (expireSeconds) {
      await this.client.setEx(key, expireSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * Redis에서 key에 해당하는 값을 조회합니다
   * @param {string} key - 조회할 키
   * @returns {Promise<string|null>} 
   */
  async get(key) {
    return await this.client.get(key);
  }

  /**
   * Redis에서 key를 삭제합니다
   * @param {string} key - 삭제할 키
   * @returns {Promise<void>}
   */
  async del(key) {
    await this.client.del(key);
  }

  /**
   * Redis에 key가 존재하는지 확인합니다
   * @param {string} key - 확인할 키
   * @returns {Promise<boolean>}
   */
  async exists(key) {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Redis의 모든 데이터를 삭제합니다
   * @returns {Promise<void>}
   */
  async flushAll() {
    await this.client.flushAll();
  }

  /**
   * Redis 연결을 종료합니다
   * @returns {Promise<void>}
   */
  async disconnect() {
    await this.client.quit();
  }
}