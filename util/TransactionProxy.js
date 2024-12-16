import { AsyncLocalStorage } from "async_hooks";

const txContext = new AsyncLocalStorage();
function getClient() {
  const client = txContext.getStore();

  if (!client) {
    throw new Error("Transaction Client가 없습니다.");
  }

  return client;
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
 * @param {typeof BaseService} Target - 대상 서비스 클래스
 * @returns {typeof BaseService}
 */
export function createTransactionalService(Target) {
  return class extends Target {
    constructor(...args) {
      super(...args);

      return new Proxy(this, {
        get(target, prop, receiver) {
          const value = target[prop];

          if (typeof value === 'function' && shouldWrapTransaction(prop)) {
            // console.log(`Wrapping method: ${prop}`); // 디버깅용
            return async function (args) {
              // BaseService에 있는 withTransaction() 함수 호출
              return target.withTransaction(async (client) => {
                // txContext에 client 정보 저장후 함수 실행
                return txContext.run(client, () => value.apply(target, [args]));
              });
            };
          }

        }
      });
    }
  };
}

export function createClientImportMapper(Target) {
  return class extends Target {
    constructor(...args) {
      super(args);

      return new Proxy(this, {
        get(target, prop, receiver) {
          const value = target[prop];

          if (typeof value === 'function' && !prop.startsWith('_')) {
            return async function (args) {
              // txContext에서 client 정보 받아와서
              const client = getClient();
              // 함수 실행하면서 client과 나머지 정보 저장
              return value.apply(target, [{ client, ...args }]);
            }
          }
        }
      });
    }
  }
}