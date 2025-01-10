import { AsyncLocalStorage } from "async_hooks";
import { transaction } from './DatabaseManager.js';

const txContext = new AsyncLocalStorage();
export function getClient() {
  return txContext.getStore();
}

/**
 * 트랜잭션이 필요한 메서드인지 확인
 * @param {string} prop - 메서드 이름
 * @returns {boolean}
 */
const shouldWrapTransaction = (prop) => {
  return typeof prop === 'string'
    && !prop.startsWith('_')
    && !['constructor', 'withTransaction', 'client'].includes(prop);
};

/**
 * 서비스 클래스에 트랜잭션 프록시를 적용
 * @param {new (...args: any[]) => any} Target - 대상 서비스 클래스
 * @returns {new (...args: any[]) => any}
 */
export function createTransactionalService(Target) {
  return class extends Target {
    constructor(...args) {
      // @ts-ignore
      super(...args);

      return new Proxy(this, {
        /**
         * @param {any} target
         * @param {string | symbol} prop
         * @param {any} receiver
         */
        get(target, prop, receiver) {
          const value = target[prop];

          if (typeof value === 'function' && shouldWrapTransaction(String(prop))) {
            return async function (args) {
              return transaction(async (client) => {
                return txContext.run(client, () => value.apply(target, [args]));
              });
            };
          }
          return value;
        }
      });
    }
  };
}

// /**
//  * @template {new (...args: any[]) => any} T
//  * @param {T} mapper
//  * @returns {T}
//  */
// export function createClientImportMapper(mapper) {
//   return class extends mapper {
//     constructor(...args) {
//       super(...args);

//       return new Proxy(this, {
//         /**
//          * @param {any} target
//          * @param {string | symbol} prop
//          * @param {any} receiver
//          */
//         get(target, prop, receiver) {
//           const value = target[prop];

//           if (typeof value === 'function' && typeof prop === 'string' && !prop.startsWith('_')) {
//             return async function (args) {
//               const client = getClient();
//               return value.apply(target, [{ client, ...args }]);
//             };
//           }
//           return value;
//         }
//       });
//     }
//   };
// }