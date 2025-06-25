const add = jest.fn().mockImplementation((name, data, opts) => {
  return Promise.resolve({ id: 'mock-job-id', name, data });
});

export class Queue {
  constructor(name: string, opts?: any) {}
  add = add;
  async close() {}
  async disconnect() {}
}

export class Worker {
  constructor(name:string, processor?: any, opts?: any) {}
  on(event: string, callback: (...args: any[]) => void) {}
  async close() {}
}

export const mockClear = () => {
    add.mockClear();
};