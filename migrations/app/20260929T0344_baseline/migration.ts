#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/aefb0fd333d7de567deae4aa0873ec859a5aef3cfb9fc841e3036654e4e85e9a/contract';
import endContract from '../../snapshots/aefb0fd333d7de567deae4aa0873ec859a5aef3cfb9fc841e3036654e4e85e9a/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Calculation',
        columns: [
          col('adSpend', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('averageOrderValue', 'float8', {
            notNull: true,
            codecRef: { codecId: 'pg/float8@1' },
          }),
          col('costPerResult', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('marginPerResult', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('productPrice', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('profit', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('resultCount', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('revenue', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('revenuePerResult', 'float8', {
            notNull: true,
            codecRef: { codecId: 'pg/float8@1' },
          }),
          col('roi', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('passwordHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('username', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_username_key',
        columns: ['username'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Calculation',
        index: 'Calculation_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Calculation',
        foreignKey: {
          name: 'Calculation_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
