import { AsyncLocalStorage } from "async_hooks"
import { PgDBManager, transaction } from './DatabaseManager.js'

// 트랜잭션 컨텍스트를 저장하는 스토리지
const txContext = new AsyncLocalStorage()

/**
 * 트랜잭션 컨텍스트를 반환
 * @returns {PgDBManager}
 */
export function getManager() {
  return txContext.getStore()
}

/**
 * 트랜잭션이 필요한 메서드인지 확인
 * @param {string} prop - 메서드 이름
 * @returns {boolean}
 */
const shouldWrapTransaction = (prop) => {
  return typeof prop === 'string'
    && !prop.startsWith('_')
    && !['constructor', 'withTransaction', 'client'].includes(prop)
}

/**
 * 서비스 클래스에 트랜잭션 프록시를 적용
 * @param {new (...args: any[]) => any} Target - 대상 서비스 클래스
 * @returns {new (...args: any[]) => any}
 */
export function createTransactionalService(Target) {
  return class extends Target {
    constructor(...args) {
      // @ts-ignore
      super(...args)

      return new Proxy(this, {
        /**
         * @param {any} target
         * @param {string | symbol} prop
         * @param {any} receiver
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