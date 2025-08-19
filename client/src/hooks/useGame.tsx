import { useState, useCallback, useEffect } from 'react';
import { GameState, GamePhase } from '@shared/schema';
import { useSocket, SocketMessage } from './useSocket';
import { useToast } from './use-toast';

export interface UseGameReturn {
  gameState: GameState | null;
  loading: boolean;
  error: string | null;
  connected: boolean;
  
  // Actions
  authenticate: (userId: string, username: string) => void;
  createGame: (userId: string, username: string) => Promise<void>;
  joinGame: (roomCode: string) => void;
  setReady: (isReady: boolean) => void;
  startGame: (difficulty?: 'easy' | 'medium' | 'hard') => void;
  exploreRoom: (roomId: string) => void;
  sendChatMessage: (message: string) => void;
  castVote: (suspectId: string) => void;
}

export function useGame(): UseGameReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSocketMessage = useCallback((message: SocketMessage) => {
    console.log('Received socket message:', message.type);
    
    switch (message.type) {
      case 'authenticated':
        if (message.success) {
          setError(null);
        }
        break;

      case 'game-state-updated':
      case 'game-started':
      case 'message-sent':
      case 'vote-cast':
        setGameState(message.gameState);
        break;

      case 'evidence-discovered':
        if (message.gameState) {
          setGameState(message.gameState);
        }
        
        toast({
          title: "New Evidence Discovered!",
          description: `${message.discoveredBy} found: ${message.evidence?.title}`,
        });
        break;

      case 'room-explored':
        // Room descriptions are handled in individual components
        break;

      case 'error':
        setError(message.message);
        toast({
          title: "Error",
          description: message.message,
          variant: "destructive",
        });
        break;

      default:
        console.log('Unhandled message type:', message.type);
    }
  }, [toast]);

  const { connected, authenticate: socketAuthenticate, sendMessage } = useSocket(handleSocketMessage);

  const authenticate = useCallback((userId: string, username: string) => {
    socketAuthenticate(userId, username);
  }, [socketAuthenticate]);

  const createGame = useCallback(async (userId: string, username: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/games/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create game');
      }

      const newGameState: GameState = await response.json();
      setGameState(newGameState);
      
      toast({
        title: "Game Created!",
        description: `Room code: ${newGameState.roomCode}`,
      });
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      toast({
        title: "Failed to create game",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const joinGame = useCallback((roomCode: string) => {
    sendMessage({
      type: 'join-game',
      roomCode
    });
  }, [sendMessage]);

  const setReady = useCallback((isReady: boolean) => {
    sendMessage({
      type: 'set-ready',
      isReady
    });
  }, [sendMessage]);

  const startGame = useCallback((difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
    sendMessage({
      type: 'start-game',
      difficulty
    });
  }, [sendMessage]);

  const exploreRoom = useCallback((roomId: string) => {
    sendMessage({
      type: 'explore-room',
      roomId
    });
  }, [sendMessage]);

  const sendChatMessage = useCallback((message: string) => {
    if (message.trim()) {
      sendMessage({
        type: 'send-message',
        message: message.trim()
      });
    }
  }, [sendMessage]);

  const castVote = useCallback((suspectId: string) => {
    sendMessage({
      type: 'cast-vote',
      suspectId
    });
  }, [sendMessage]);

  return {
    gameState,
    loading,
    error,
    connected,
    authenticate,
    createGame,
    joinGame,
    setReady,
    startGame,
    exploreRoom,
    sendChatMessage,
    castVote,
  };
}
