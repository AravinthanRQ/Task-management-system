class MockRedis {
  private static instance: MockRedis;
  private store = new Map<string, string>();

  constructor() {
    if (MockRedis.instance) {
      return MockRedis.instance;
    }
    MockRedis.instance = this;
  }

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async set(key: string, value: string, ...args: any[]): Promise<"OK"> {
    this.store.set(key, value);
    return "OK";
  }

  async del(...keys: string[]): Promise<number> {
    let count = 0;
    keys.forEach((key) => {
      if (this.store.delete(key)) count++;
    });
    return count;
  }

  async quit(): Promise<"OK"> {
    return "OK";
  }

  on(event: string, callback: (...args: any[]) => void) {
  }
}

export const Redis = MockRedis;

export type RedisOptions = {};