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
            console.log(`Wrapping method: ${prop}`); // 디버깅용
            return async function (...args) {
              return target.withTransaction(async (client) => {
                return value.apply(target, [client, ...args]);
              });
            };
          }

          return value;
        }
      });
    }
  };
}