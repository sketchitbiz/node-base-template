import { AsyncLocalStorage } from 'async_hooks';
import type { AbstractDBManager } from '../util/types/AbstractDBManager';

/**
 * 트랜잭션 컨텍스트
 */
export const transactionContext = new AsyncLocalStorage<AbstractDBManager<any>>();


/**
 * 트랜잭션 컨텍스트에서 client 가져오기
 */
export function getManager(): AbstractDBManager<any> | undefined {
  const client = transactionContext.getStore();

  return client;
}