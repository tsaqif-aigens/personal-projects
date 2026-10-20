import {
  boolean,
  customType,
  index,
  integer,
  json,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// It automatically run the command `db-server:file`, which apply the migration before Next.js starts in development mode,
// Alternatively, if your database is running, you can run `npm run db:migrate` and there is no need to restart the server.

// Need a database for production? Just claim it by running `npm run neon:claim`.
// Tested and compatible with Next.js Boilerplate

export const counterSchema = pgTable('counter', {
  id: serial('id').primaryKey(),
  count: integer('count').default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const templateSchema = pgTable('templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  content: text('content').notNull(),
  sampleData: json('sample_data').notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// citext for case-insensitive, unique slug matching (mirrors the PostgreSQL extension).
const citext = customType<{ data: string }>({
  dataType: () => 'citext',
});

export const invitationStatusEnum = pgEnum('invitation_status', [
  'draft',
  'preview',
  'published',
  'archived',
]);

export const imageRoleEnum = pgEnum('image_role', [
  'cover',
  'couple',
  'gallery',
  'music',
]);

export const attendanceEnum = pgEnum('attendance', [
  'hadir',
  'akan_hadir',
  'tidak_hadir',
]);

export const invitations = pgTable(
  'invitations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    slug: citext('slug').notNull(),
    status: invitationStatusEnum('status').notNull().default('draft'),
    htmlTemplate: text('html_template').notNull(),
    vars: jsonb('vars').notNull(),
    theme: jsonb('theme').notNull(),
    templateVersion: integer('template_version').notNull().default(1),
    varsSchemaVersion: integer('vars_schema_version').notNull().default(1),
    isPaid: boolean('is_paid').notNull().default(false),
    publishedAt: timestamp('published_at', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  table => [
    uniqueIndex('invitations_slug_unique').on(table.slug),
    index('invitations_user_id_idx').on(table.userId),
  ],
);

export const invitationImages = pgTable(
  'invitation_images',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    invitationId: uuid('invitation_id')
      .notNull()
      .references(() => invitations.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    role: imageRoleEnum('role').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  table => [index('invitation_images_invitation_id_idx').on(table.invitationId)],
);

export const guests = pgTable(
  'guests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    invitationId: uuid('invitation_id')
      .notNull()
      .references(() => invitations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    phone: text('phone'),
    sent: boolean('sent').notNull().default(false),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  table => [index('guests_invitation_id_idx').on(table.invitationId)],
);

export const rsvps = pgTable(
  'rsvps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    invitationId: uuid('invitation_id')
      .notNull()
      .references(() => invitations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    attendance: attendanceEnum('attendance').notNull(),
    message: text('message'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  table => [index('rsvps_invitation_id_idx').on(table.invitationId)],
);

export const aiGenerationStepEnum = pgEnum('ai_generation_step', [
  'theme',
  'template',
]);

export const aiGenerations = pgTable(
  'ai_generations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    invitationId: uuid('invitation_id')
      .notNull()
      .references(() => invitations.id, { onDelete: 'cascade' }),
    step: aiGenerationStepEnum('step').notNull(),
    model: text('model'),
    status: text('status').notNull().default('success'),
    error: text('error'),
    tokensIn: integer('tokens_in'),
    tokensOut: integer('tokens_out'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  table => [
    index('ai_generations_user_id_idx').on(table.userId),
    index('ai_generations_invitation_id_idx').on(table.invitationId),
  ],
);

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'paid',
  'failed',
  'expired',
  'cancelled',
]);

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    invitationId: uuid('invitation_id')
      .notNull()
      .references(() => invitations.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(),
    status: orderStatusEnum('status').notNull().default('pending'),
    midtransOrderId: text('midtrans_order_id'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  table => [index('orders_invitation_id_idx').on(table.invitationId)],
);
