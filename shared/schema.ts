import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomCode: varchar("room_code", { length: 6 }).notNull().unique(),
  hostId: varchar("host_id").notNull(),
  phase: varchar("phase").notNull().default("lobby"), // lobby, investigation, discussion, voting, reveal
  mystery: jsonb("mystery"), // AI generated mystery data
  timeRemaining: integer("time_remaining"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameParticipants = pgTable("game_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull(),
  userId: varchar("user_id").notNull(),
  username: text("username").notNull(),
  isReady: boolean("is_ready").default(false),
  vote: varchar("vote"), // suspect ID they voted for
  score: integer("score").default(0),
});

export const gameMessages = pgTable("game_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull(),
  userId: varchar("user_id").notNull(),
  username: text("username").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const gameEvidence = pgTable("game_evidence", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull(),
  userId: varchar("user_id").notNull(),
  evidenceId: varchar("evidence_id").notNull(), // from AI generated mystery
  room: varchar("room").notNull(),
  discoveredAt: timestamp("discovered_at").defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
});

export const insertParticipantSchema = createInsertSchema(gameParticipants).omit({
  id: true,
});

export const insertMessageSchema = createInsertSchema(gameMessages).omit({
  id: true,
  timestamp: true,
});

export const insertEvidenceSchema = createInsertSchema(gameEvidence).omit({
  id: true,
  discoveredAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type GameParticipant = typeof gameParticipants.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type GameMessage = typeof gameMessages.$inferSelect;
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;
export type GameEvidence = typeof gameEvidence.$inferSelect;

// Game-specific types
export type GamePhase = "lobby" | "investigation" | "discussion" | "voting" | "reveal";

export interface Suspect {
  id: string;
  name: string;
  role: string;
  description: string;
  motive: string;
  alibi: string;
  imageUrl: string;
}

export interface Evidence {
  id: string;
  title: string;
  description: string;
  room: string;
  significance: "low" | "medium" | "high" | "critical";
  isRedHerring: boolean;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  evidence: string[]; // evidence IDs
  hasBeenExplored: boolean;
}

export interface Mystery {
  id: string;
  title: string;
  setting: string;
  victim: {
    name: string;
    description: string;
    background: string;
  };
  crimeScene: string;
  suspects: Suspect[];
  evidence: Evidence[];
  rooms: Room[];
  murderer: {
    suspectId: string;
    method: string;
    confession: string;
    alternateEnding: string;
  };
  difficulty: "easy" | "medium" | "hard";
}

export interface GameState {
  id: string;
  roomCode: string;
  hostId: string;
  phase: GamePhase;
  mystery: Mystery | null;
  participants: GameParticipant[];
  messages: GameMessage[];
  discoveredEvidence: GameEvidence[];
  timeRemaining: number;
  votes: Record<string, string>; // userId -> suspectId
  phaseStartTime: number;
}
