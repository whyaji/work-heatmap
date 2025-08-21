import { tinyint } from 'drizzle-orm/mysql-core';
import { int } from 'drizzle-orm/mysql-core';
import {
  bigint,
  boolean,
  decimal,
  index,
  mysqlTable,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';

export const userSchema = mysqlTable('user', {
  id: bigint('id', { mode: 'number', unsigned: true }).autoincrement().notNull().primaryKey(),
  username: varchar('username', { length: 255 }),
  nama: varchar('nama', { length: 255 }),
  jabatan: varchar('jabatan', { length: 255 }),
  kemandoran: bigint('kemandoran', { mode: 'number', unsigned: true }),
  kemandoran_ppro: bigint('kemandoran_ppro', { mode: 'number', unsigned: true }),
  kemandoran_nama: varchar('kemandoran_nama', { length: 255 }),
  kemandoran_kode: varchar('kemandoran_kode', { length: 255 }),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
  deleted_at: timestamp('deleted_at'),
});

export const coordinateHistorySchema = mysqlTable(
  'coordinate_history',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    user_id: bigint('user_id', { mode: 'number', unsigned: true })
      .notNull()
      .references(() => userSchema.id),
    timestamp: timestamp('timestamp').notNull(),
    lat: decimal('lat', { precision: 11, scale: 8 }).notNull(),
    lon: decimal('lon', { precision: 11, scale: 8 }).notNull(),
    accuracy: int('accuracy', { unsigned: true }).notNull(),
    speed: decimal('speed', { precision: 8, scale: 2 }),
    bearing: int('bearing', { unsigned: true }),
    activity: varchar('activity', { length: 50 }),
    battery: tinyint('battery', { unsigned: true }),
    network: varchar('network', { length: 20 }),
    provider: varchar('provider', { length: 50 }),
    inside_geofence: boolean('inside_geofence').default(false),
    h3index: varchar('h3index', { length: 50 }),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
    deleted_at: timestamp('deleted_at'),
  },
  (table) => [index('idx_user_id').on(table.user_id)]
);
