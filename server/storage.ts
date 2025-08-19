import { type Game, type GameParticipant, type GameMessage, type GameEvidence, type InsertGame, type InsertParticipant, type InsertMessage, type InsertEvidence, type GameState, type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game methods
  createGame(game: InsertGame): Promise<Game>;
  getGame(id: string): Promise<Game | undefined>;
  getGameByRoomCode(roomCode: string): Promise<Game | undefined>;
  updateGame(id: string, updates: Partial<Game>): Promise<Game | undefined>;
  deleteGame(id: string): Promise<void>;
  
  // Participant methods
  addParticipant(participant: InsertParticipant): Promise<GameParticipant>;
  getGameParticipants(gameId: string): Promise<GameParticipant[]>;
  updateParticipant(gameId: string, userId: string, updates: Partial<GameParticipant>): Promise<GameParticipant | undefined>;
  removeParticipant(gameId: string, userId: string): Promise<void>;
  
  // Message methods
  addMessage(message: InsertMessage): Promise<GameMessage>;
  getGameMessages(gameId: string): Promise<GameMessage[]>;
  
  // Evidence methods
  addDiscoveredEvidence(evidence: InsertEvidence): Promise<GameEvidence>;
  getGameEvidence(gameId: string): Promise<GameEvidence[]>;
  
  // Full game state
  getGameState(gameId: string): Promise<GameState | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private games: Map<string, Game>;
  private participants: Map<string, GameParticipant[]>;
  private messages: Map<string, GameMessage[]>;
  private evidence: Map<string, GameEvidence[]>;
  private roomCodeToGameId: Map<string, string>;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.participants = new Map();
    this.messages = new Map();
    this.evidence = new Map();
    this.roomCodeToGameId = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Game methods
  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = randomUUID();
    const game: Game = {
      id,
      roomCode: insertGame.roomCode,
      hostId: insertGame.hostId,
      phase: insertGame.phase || "lobby",
      mystery: insertGame.mystery || null,
      timeRemaining: insertGame.timeRemaining || null,
      createdAt: new Date(),
    };
    this.games.set(id, game);
    this.roomCodeToGameId.set(game.roomCode, id);
    this.participants.set(id, []);
    this.messages.set(id, []);
    this.evidence.set(id, []);
    return game;
  }

  async getGame(id: string): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async getGameByRoomCode(roomCode: string): Promise<Game | undefined> {
    const gameId = this.roomCodeToGameId.get(roomCode);
    if (!gameId) return undefined;
    return this.games.get(gameId);
  }

  async updateGame(id: string, updates: Partial<Game>): Promise<Game | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;
    
    const updatedGame = { ...game, ...updates };
    this.games.set(id, updatedGame);
    return updatedGame;
  }

  async deleteGame(id: string): Promise<void> {
    const game = this.games.get(id);
    if (game) {
      this.roomCodeToGameId.delete(game.roomCode);
    }
    this.games.delete(id);
    this.participants.delete(id);
    this.messages.delete(id);
    this.evidence.delete(id);
  }

  // Participant methods
  async addParticipant(insertParticipant: InsertParticipant): Promise<GameParticipant> {
    const id = randomUUID();
    const participant: GameParticipant = {
      id,
      gameId: insertParticipant.gameId,
      userId: insertParticipant.userId,
      username: insertParticipant.username,
      isReady: insertParticipant.isReady ?? false,
      vote: insertParticipant.vote || null,
      score: insertParticipant.score ?? 0,
    };
    
    const gameParticipants = this.participants.get(insertParticipant.gameId) || [];
    gameParticipants.push(participant);
    this.participants.set(insertParticipant.gameId, gameParticipants);
    
    return participant;
  }

  async getGameParticipants(gameId: string): Promise<GameParticipant[]> {
    return this.participants.get(gameId) || [];
  }

  async updateParticipant(gameId: string, userId: string, updates: Partial<GameParticipant>): Promise<GameParticipant | undefined> {
    const gameParticipants = this.participants.get(gameId) || [];
    const participantIndex = gameParticipants.findIndex(p => p.userId === userId);
    
    if (participantIndex === -1) return undefined;
    
    const updatedParticipant = { ...gameParticipants[participantIndex], ...updates };
    gameParticipants[participantIndex] = updatedParticipant;
    this.participants.set(gameId, gameParticipants);
    
    return updatedParticipant;
  }

  async removeParticipant(gameId: string, userId: string): Promise<void> {
    const gameParticipants = this.participants.get(gameId) || [];
    const filteredParticipants = gameParticipants.filter(p => p.userId !== userId);
    this.participants.set(gameId, filteredParticipants);
  }

  // Message methods
  async addMessage(insertMessage: InsertMessage): Promise<GameMessage> {
    const id = randomUUID();
    const message: GameMessage = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    
    const gameMessages = this.messages.get(insertMessage.gameId) || [];
    gameMessages.push(message);
    this.messages.set(insertMessage.gameId, gameMessages);
    
    return message;
  }

  async getGameMessages(gameId: string): Promise<GameMessage[]> {
    return this.messages.get(gameId) || [];
  }

  // Evidence methods
  async addDiscoveredEvidence(insertEvidence: InsertEvidence): Promise<GameEvidence> {
    const id = randomUUID();
    const evidence: GameEvidence = {
      ...insertEvidence,
      id,
      discoveredAt: new Date(),
    };
    
    const gameEvidence = this.evidence.get(insertEvidence.gameId) || [];
    gameEvidence.push(evidence);
    this.evidence.set(insertEvidence.gameId, gameEvidence);
    
    return evidence;
  }

  async getGameEvidence(gameId: string): Promise<GameEvidence[]> {
    return this.evidence.get(gameId) || [];
  }

  // Full game state
  async getGameState(gameId: string): Promise<GameState | undefined> {
    const game = await this.getGame(gameId);
    if (!game) return undefined;
    
    const participants = await this.getGameParticipants(gameId);
    const messages = await this.getGameMessages(gameId);
    const discoveredEvidence = await this.getGameEvidence(gameId);
    
    const votes: Record<string, string> = {};
    participants.forEach(p => {
      if (p.vote) {
        votes[p.userId] = p.vote;
      }
    });
    
    return {
      id: game.id,
      roomCode: game.roomCode,
      hostId: game.hostId,
      phase: game.phase as any,
      mystery: game.mystery as any,
      participants,
      messages,
      discoveredEvidence,
      timeRemaining: game.timeRemaining || 0,
      votes,
      phaseStartTime: Date.now(), // This should be tracked separately in real implementation
    };
  }
}

export const storage = new MemStorage();
