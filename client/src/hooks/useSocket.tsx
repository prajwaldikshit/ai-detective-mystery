import { useEffect, useRef, useCallback, useState } from 'react';
import { GameState } from '@shared/schema';

export interface SocketMessage {
  type: string;
  [key: string]: any;
}

export interface UseSocketReturn {
  socket: WebSocket | null;
  connected: boolean;
  error: string | null;
  authenticate: (userId: string, username: string) => void;
  sendMessage: (message: SocketMessage) => void;
}

export function useSocket(onMessage?: (message: SocketMessage) => void): UseSocketReturn {
  const socketRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      socketRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (onMessage) {
            onMessage(message);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      socketRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setConnected(false);

        // Attempt reconnection if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      socketRef.current.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Connection error');
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to connect');
    }
  }, [onMessage]);

  const sendMessage = useCallback((message: SocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message:', message);
    }
  }, []);

  const authenticate = useCallback((userId: string, username: string) => {
    sendMessage({
      type: 'authenticate',
      userId,
      username
    });
  }, [sendMessage]);

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [connect]);

  return {
    socket: socketRef.current,
    connected,
    error,
    authenticate,
    sendMessage
  };
}
