
/**
 * 추상화 DB 관리자
 *
 * @export
 * @abstract
 * @class AbstractDBManager
 */
export class AbstractDBManager {

  /** @type {any} */
  client;

  /**
   * 연결
   *
   * @abstract
   * @memberof AbstractDBManager
   * @returns {Promise<any>}
   */
  connect() {
    throw new Error('connect() is not implemented');
  }

  /**
   * 연결 해제
   *
   * @abstract
   * @memberof AbstractDBManager
   * @returns {Promise<any>}
   */
  disconnect() {
    throw new Error('disconnect() is not implemented');
  }

  /**
   * 트랜잭션 시작
   *
   * @abstract
   * @memberof AbstractDBManager
   * @returns {Promise<any>}
   */
  begin() {
    throw new Error('begin() is not implemented');
  }

  /**
   * 트랜잭션 커밋
   *
   * @abstract
   * @memberof AbstractDBManager
   * @returns {Promise<any>}
   */
  commit() {
    throw new Error('commit() is not implemented');
  }

  /**
   * 트랜잭션 롤백
   *
   * @abstract
   * @memberof AbstractDBManager
   * @returns {Promise<any>}
   */
  rollback() {
    throw new Error('rollback() is not implemented');
  }

  /**
   * 릴리즈
   *
   * @abstract
   * @memberof AbstractDBManager
   * @returns {Promise<any>}
   */
  release() {
    throw new Error('release() is not implemented');
  }
}
