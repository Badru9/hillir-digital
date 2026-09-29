import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

let _db: ReturnType<typeof postgres<Contract>> | undefined;

export function getDb() {
  if (!_db) {
    const url = process.env['DATABASE_URL'];
    if (!url) {
      throw new Error('DATABASE_URL is not set');
    }
    _db = postgres<Contract>({
      contractJson,
      url,
    });
  }
  return _db;
}

// Backwards-compatible export: callers using `db.orm...` continue to work,
// but the connection is established lazily on first access at request time,
// not at module-import (build) time.
export const db = new Proxy({} as ReturnType<typeof postgres<Contract>>, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop);
  },
});
