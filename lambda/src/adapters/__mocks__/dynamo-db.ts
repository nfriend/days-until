import { db as realDb } from '../dynamo-db';

export const db: typeof realDb = {
  put() {
    return Promise.resolve();
  },
  get() {
    return Promise.resolve({});
  },
  delete() {
    return Promise.resolve();
  },
};
