export abstract class AbstractDBManager<T> {

  client: any;

  abstract connect(): Promise<T>;

  abstract begin(): Promise<T>;

  abstract commit(): Promise<void>;

  abstract rollback(): Promise<void>;

  abstract release(): Promise<void>;

  abstract disconnect(): Promise<void>;
}
