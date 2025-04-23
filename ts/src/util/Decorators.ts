import { PgDBManager, transaction } from 'src/database/DatabaseManager';
import { transactionContext } from 'src/database/TransactionContext';


// 트랜잭션 데코레이터
export function Transaction() {
  // 메소드 데코레이터로 변경
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const newClient = new PgDBManager();
      await newClient.connect();
      return transaction(newClient, async client => transactionContext.run(client,
        () => originalMethod.apply(this, args)
      ));
    };

    return descriptor;
  };
}