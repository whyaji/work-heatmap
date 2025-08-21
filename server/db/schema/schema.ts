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
  username: varchar('username', { length: 255 }).notNull(),
  nama: varchar('nama', { length: 255 }).notNull(),
  jabatan: varchar('jabatan', { length: 255 }).notNull(),
  kemandoran: bigint('kemandoran', { mode: 'number', unsigned: true }),
  kemandoranPpro: bigint('kemandoran_ppro', { mode: 'number', unsigned: true }),
  kemandoranNama: varchar('kemandoran_nama', { length: 255 }),
  kemandoranKode: varchar('kemandoran_kode', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const coordinateHistorySchema = mysqlTable(
  'coordinate_history',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    userId: bigint('user_id', { mode: 'number', unsigned: true })
      .notNull()
      .references(() => userSchema.id),
    timestamp: timestamp('timestamp').notNull(),
    lat: decimal('lat', { precision: 10, scale: 8 }).notNull(),
    lon: decimal('lon', { precision: 10, scale: 8 }).notNull(),
    accuracy: bigint('accuracy', { mode: 'number', unsigned: true }).notNull(),
    speed: decimal('speed', { precision: 10, scale: 2 }).notNull(),
    bearing: bigint('bearing', { mode: 'number', unsigned: true }).notNull(),
    activity: varchar('activity', { length: 255 }).notNull(),
    battery: bigint('battery', { mode: 'number', unsigned: true }).notNull(),
    network: varchar('network', { length: 255 }).notNull(),
    provider: varchar('provider', { length: 255 }).notNull(),
    insideGeofence: boolean('inside_geofence').notNull().default(false),
    h3Index: varchar('h3_index', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [index('idx_user_id').on(table.userId)]
);
