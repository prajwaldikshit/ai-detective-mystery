import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { gameService } from "./services/gameService";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  username?: string;
  gameId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server on /ws path to avoid Vite HMR conflicts
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const gameConnections = new Map<string, Set<AuthenticatedWebSocket>>();

  // Broadcast to all clients in a game
  function broadcastToGame(gameId: string, message: any) {
    const connections = gameConnections.get(gameId);
    if (connections) {
      const messageStr = JSON.stringify(message);
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageStr);
        }
      });
    }
  }

  // WebSocket connection handling
  wss.on('connection', (ws: AuthenticatedWebSocket) => {
    console.log('WebSocket connection established');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'authenticate':
            ws.userId = message.userId;
            ws.username = message.username;
            ws.send(JSON.stringify({ type: 'authenticated', success: true }));
            break;

          case 'join-game':
            if (!ws.userId || !ws.username) {
              ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
              return;
            }

            try {
              const gameState = await gameService.joinGame(message.roomCode, ws.userId, ws.username);
              ws.gameId = gameState.id;
              
              // Add to game connections
              if (!gameConnections.has(gameState.id)) {
                gameConnections.set(gameState.id, new Set());
              }
              gameConnections.get(gameState.id)!.add(ws);

              // Broadcast updated game state to all players
              broadcastToGame(gameState.id, {
                type: 'game-state-updated',
                gameState
              });
            } catch (error) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: (error as Error).message 
              }));
            }
            break;

          case 'set-ready':
            if (!ws.gameId || !ws.userId) {
              ws.send(JSON.stringify({ type: 'error', message: 'Not in game' }));
              return;
            }

            try {
              const gameState = await gameService.setPlayerReady(ws.gameId, ws.userId, message.isReady);
              broadcastToGame(ws.gameId, {
                type: 'game-state-updated',
                gameState
              });
            } catch (error) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: (error as Error).message 
              }));
            }
            break;

          case 'start-game':
            if (!ws.gameId || !ws.userId) {
              ws.send(JSON.stringify({ type: 'error', message: 'Not in game' }));
              return;
            }

            try {
              const gameState = await gameService.startGame(ws.gameId, ws.userId, message.difficulty);
              broadcastToGame(ws.gameId, {
                type: 'game-started',
                gameState
              });
            } catch (error) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: (error as Error).message 
              }));
            }
            break;

          case 'explore-room':
            if (!ws.gameId || !ws.userId) {
              ws.send(JSON.stringify({ type: 'error', message: 'Not in game' }));
              return;
            }

            try {
              const result = await gameService.exploreRoom(ws.gameId, ws.userId, message.roomId);
              
              // Send room description to requesting player
              ws.send(JSON.stringify({
                type: 'room-explored',
                roomId: message.roomId,
                description: result.description,
                evidence: result.evidence
              }));

              // If evidence was discovered, broadcast to all players
              if (result.evidence) {
                broadcastToGame(ws.gameId, {
                  type: 'evidence-discovered',
                  evidence: result.evidence,
                  discoveredBy: ws.username,
                  gameState: result.gameState
                });
              }
            } catch (error) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: (error as Error).message 
              }));
            }
            break;

          case 'send-message':
            if (!ws.gameId || !ws.userId || !ws.username) {
              ws.send(JSON.stringify({ type: 'error', message: 'Not in game' }));
              return;
            }

            try {
              const gameState = await gameService.sendMessage(ws.gameId, ws.userId, ws.username, message.message);
              broadcastToGame(ws.gameId, {
                type: 'message-sent',
                gameState
              });
            } catch (error) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: (error as Error).message 
              }));
            }
            break;

          case 'cast-vote':
            if (!ws.gameId || !ws.userId) {
              ws.send(JSON.stringify({ type: 'error', message: 'Not in game' }));
              return;
            }

            try {
              const gameState = await gameService.castVote(ws.gameId, ws.userId, message.suspectId);
              broadcastToGame(ws.gameId, {
                type: 'vote-cast',
                gameState
              });
            } catch (error) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: (error as Error).message 
              }));
            }
            break;
        }
      } catch (error) {
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Invalid message format' 
        }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      // Remove from game connections
      if (ws.gameId) {
        const connections = gameConnections.get(ws.gameId);
        if (connections) {
          connections.delete(ws);
          if (connections.size === 0) {
            gameConnections.delete(ws.gameId);
          }
        }
      }
    });
  });

  // REST API Routes
  app.post('/api/games/create', async (req, res) => {
    try {
      const { userId, username } = req.body;
      
      if (!userId || !username) {
        return res.status(400).json({ message: 'userId and username required' });
      }

      const gameState = await gameService.createGame(userId, username);
      res.json(gameState);
    } catch (error) {
      console.error('Create game error:', error);
      res.status(500).json({ message: 'Failed to create game' });
    }
  });

  app.get('/api/games/:gameId', async (req, res) => {
    try {
      const { gameId } = req.params;
      const gameState = await gameService.getGameState(gameId);
      
      if (!gameState) {
        return res.status(404).json({ message: 'Game not found' });
      }

      res.json(gameState);
    } catch (error) {
      console.error('Get game error:', error);
      res.status(500).json({ message: 'Failed to get game' });
    }
  });

  app.get('/api/games/room/:roomCode', async (req, res) => {
    try {
      const { roomCode } = req.params;
      const game = await gameService.getGameState(roomCode);
      
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }

      res.json(game);
    } catch (error) {
      console.error('Get game by room code error:', error);
      res.status(500).json({ message: 'Failed to get game' });
    }
  });

  return httpServer;
}
