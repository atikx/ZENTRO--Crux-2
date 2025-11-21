import { relations } from "drizzle-orm";
import { pgTable, text, uuid, pgEnum } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", ["live", "ended"]);

export const users = pgTable("users", {
  id: uuid("id").notNull().defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  avatar: text("avatar"),
});

export const streams = pgTable("streams", {
  id: uuid("id").notNull().defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  hostId: uuid("hostId")
    .notNull()
    .references(() => users.id),
  status: statusEnum("status").notNull(),
  thumbnail: text("thumbnail").notNull(),
});

// User has many Streams
export const usersRelations = relations(users, ({ many }) => ({
  streams: many(streams),
}));

// Stream belongs to a User
export const streamsRelations = relations(streams, ({ one }) => ({
  host: one(users, {
    fields: [streams.hostId],
    references: [users.id],
  }),
}));
