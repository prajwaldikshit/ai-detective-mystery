import { GameState, GamePhase, Mystery } from "@shared/schema";
import { storage } from "../storage";
import { openaiService } from "./openai";
import { randomUUID } from "crypto";

export class GameService {
  private gameTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly PHASE_DURATIONS = {
    investigation: 10 * 60, // 10 minutes
    discussion: 5 * 60,     // 5 minutes
    voting: 2 * 60,         // 2 minutes
  };

  async createGame(hostId: string, hostUsername: string): Promise<GameState> {
    const roomCode = this.generateRoomCode();
    
    const game = await storage.createGame({
      roomCode,
      hostId,
      phase: "lobby",
      mystery: null,
      timeRemaining: null,
    });

    // Add host as first participant
    await storage.addParticipant({
      gameId: game.id,
      userId: hostId,
      username: hostUsername,
      isReady: false,
      vote: null,
      score: 0,
    });

    return await storage.getGameState(game.id) as GameState;
  }

  async joinGame(roomCode: string, userId: string, username: string): Promise<GameState> {
    const game = await storage.getGameByRoomCode(roomCode);
    if (!game) {
      throw new Error("Game not found");
    }

    if (game.phase !== "lobby") {
      throw new Error("Game already in progress");
    }

    const participants = await storage.getGameParticipants(game.id);
    if (participants.length >= 6) {
      throw new Error("Game is full");
    }

    // Check if user already in game
    const existingParticipant = participants.find(p => p.userId === userId);
    if (existingParticipant) {
      throw new Error("Already in this game");
    }

    await storage.addParticipant({
      gameId: game.id,
      userId,
      username,
      isReady: false,
      vote: null,
      score: 0,
    });

    return await storage.getGameState(game.id) as GameState;
  }

  async setPlayerReady(gameId: string, userId: string, isReady: boolean): Promise<GameState> {
    await storage.updateParticipant(gameId, userId, { isReady });
    return await storage.getGameState(gameId) as GameState;
  }

  async startGame(gameId: string, hostId: string, difficulty: "easy" | "medium" | "hard" = "medium"): Promise<GameState> {
    const game = await storage.getGame(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    if (game.hostId !== hostId) {
      throw new Error("Only the host can start the game");
    }

    if (game.phase !== "lobby") {
      throw new Error("Game already started");
    }

    const participants = await storage.getGameParticipants(gameId);
    if (participants.length < 2) {
      throw new Error("Need at least 2 players");
    }

    // Check if all players are ready
    const allReady = participants.every(p => p.isReady);
    if (!allReady) {
      throw new Error("Not all players are ready");
    }

    // Generate mystery using AI
    const mystery = await openaiService.generateMystery(difficulty);
    
    // Update game to investigation phase
    await storage.updateGame(gameId, {
      phase: "investigation",
      mystery,
      timeRemaining: this.PHASE_DURATIONS.investigation,
    });

    // Start phase timer
    this.startPhaseTimer(gameId, "investigation");

    return await storage.getGameState(gameId) as GameState;
  }

  async exploreRoom(gameId: string, userId: string, roomId: string): Promise<{
    description: string;
    evidence?: any;
    gameState: GameState;
  }> {
    const gameState = await storage.getGameState(gameId);
    if (!gameState || !gameState.mystery) {
      throw new Error("Game not found or mystery not loaded");
    }

    if (gameState.phase !== "investigation") {
      throw new Error("Can only explore rooms during investigation phase");
    }

    const room = gameState.mystery.rooms.find(r => r.id === roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    // Get room description from AI
    const description = await openaiService.generateRoomDescription(
      gameState.mystery,
      roomId,
      gameState.participants.map(p => p.username)
    );

    // Check for undiscovered evidence in this room
    const discoveredEvidenceIds = gameState.discoveredEvidence.map(e => e.evidenceId);
    const roomEvidence = gameState.mystery.evidence.filter(
      e => room.evidence.includes(e.id) && !discoveredEvidenceIds.includes(e.id)
    );

    let discoveredEvidence = null;
    if (roomEvidence.length > 0) {
      // Randomly discover one piece of evidence (30% chance per room visit)
      if (Math.random() < 0.3) {
        const evidence = roomEvidence[Math.floor(Math.random() * roomEvidence.length)];
        await storage.addDiscoveredEvidence({
          gameId,
          userId,
          evidenceId: evidence.id,
          room: roomId,
        });
        discoveredEvidence = evidence;
      }
    }

    const updatedGameState = await storage.getGameState(gameId) as GameState;

    return {
      description,
      evidence: discoveredEvidence,
      gameState: updatedGameState,
    };
  }

  async sendMessage(gameId: string, userId: string, username: string, message: string): Promise<GameState> {
    await storage.addMessage({
      gameId,
      userId,
      username,
      message: message.trim(),
    });

    return await storage.getGameState(gameId) as GameState;
  }

  async castVote(gameId: string, userId: string, suspectId: string): Promise<GameState> {
    const gameState = await storage.getGameState(gameId);
    if (!gameState) {
      throw new Error("Game not found");
    }

    if (gameState.phase !== "voting") {
      throw new Error("Not in voting phase");
    }

    if (!gameState.mystery?.suspects.find(s => s.id === suspectId)) {
      throw new Error("Invalid suspect");
    }

    await storage.updateParticipant(gameId, userId, { vote: suspectId });
    
    const updatedGameState = await storage.getGameState(gameId) as GameState;
    
    // Check if all players have voted
    const allVoted = updatedGameState.participants.every(p => p.vote);
    if (allVoted) {
      // Move to reveal phase
      await this.revealMurderer(gameId);
    }

    return await storage.getGameState(gameId) as GameState;
  }

  private async revealMurderer(gameId: string): Promise<void> {
    const gameState = await storage.getGameState(gameId);
    if (!gameState || !gameState.mystery) return;

    // Clear timer
    this.clearPhaseTimer(gameId);

    // Calculate scores
    const correctVotes = gameState.participants.filter(
      p => p.vote === gameState.mystery!.murderer.suspectId
    );

    // Award points to correct guessers
    for (const participant of correctVotes) {
      await storage.updateParticipant(gameId, participant.userId, {
        score: (participant.score || 0) + 100
      });
    }

    await storage.updateGame(gameId, {
      phase: "reveal",
      timeRemaining: null,
    });
  }

  private startPhaseTimer(gameId: string, phase: GamePhase): void {
    const duration = this.PHASE_DURATIONS[phase as keyof typeof this.PHASE_DURATIONS];
    if (!duration) return;

    // Clear existing timer
    this.clearPhaseTimer(gameId);

    const timer = setTimeout(() => {
      this.handlePhaseTimeout(gameId, phase);
    }, duration * 1000);

    this.gameTimers.set(gameId, timer);

    // Update time remaining every second
    const updateInterval = setInterval(async () => {
      const game = await storage.getGame(gameId);
      if (!game || game.phase !== phase) {
        clearInterval(updateInterval);
        return;
      }

      const timeRemaining = Math.max(0, (game.timeRemaining || 0) - 1);
      await storage.updateGame(gameId, { timeRemaining });

      if (timeRemaining === 0) {
        clearInterval(updateInterval);
      }
    }, 1000);
  }

  private clearPhaseTimer(gameId: string): void {
    const timer = this.gameTimers.get(gameId);
    if (timer) {
      clearTimeout(timer);
      this.gameTimers.delete(gameId);
    }
  }

  private async handlePhaseTimeout(gameId: string, phase: GamePhase): Promise<void> {
    const gameState = await storage.getGameState(gameId);
    if (!gameState) return;

    switch (phase) {
      case "investigation":
        await storage.updateGame(gameId, {
          phase: "discussion",
          timeRemaining: this.PHASE_DURATIONS.discussion,
        });
        this.startPhaseTimer(gameId, "discussion");
        break;

      case "discussion":
        await storage.updateGame(gameId, {
          phase: "voting",
          timeRemaining: this.PHASE_DURATIONS.voting,
        });
        this.startPhaseTimer(gameId, "voting");
        break;

      case "voting":
        await this.revealMurderer(gameId);
        break;
    }
  }

  private generateRoomCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async deleteGame(gameId: string): Promise<void> {
    this.clearPhaseTimer(gameId);
    await storage.deleteGame(gameId);
  }

  async getGameState(gameId: string): Promise<GameState | undefined> {
    return await storage.getGameState(gameId);
  }
}

export const gameService = new GameService();
