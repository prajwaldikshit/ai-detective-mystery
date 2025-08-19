import { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGame } from '@/hooks/useGame';
import { motion } from 'framer-motion';
import { Copy, Play, ArrowLeft, Users, Clock, Shield } from 'lucide-react';
import { useState } from 'react';

export default function Lobby() {
  const { gameId } = useParams();
  const [, navigate] = useLocation();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const { gameState, setReady, startGame, connected } = useGame();

  // Navigate to game when it starts
  useEffect(() => {
    if (gameState?.phase === 'investigation') {
      navigate(`/game/${gameState.id}`);
    }
  }, [gameState?.phase, gameState?.id, navigate]);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-noir-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-neon-cyan text-2xl mb-4">Loading game...</div>
          {!connected && (
            <Badge variant="destructive">Connecting to server...</Badge>
          )}
        </div>
      </div>
    );
  }

  const currentUser = gameState.participants[0]; // Assuming first participant is current user for now
  const isHost = currentUser?.userId === gameState.hostId;
  const allReady = gameState.participants.every(p => p.isReady);
  const canStart = gameState.participants.length >= 2 && allReady && isHost;

  const copyRoomCode = () => {
    navigator.clipboard.writeText(gameState.roomCode);
  };

  const handleSetReady = () => {
    setReady(!currentUser?.isReady);
  };

  const handleStartGame = () => {
    startGame(difficulty);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-noir-dark via-noir-slate to-noir-dark text-gray-100">
      {/* Header */}
      <div className="bg-noir-slate/80 backdrop-blur border-b border-neon-cyan/20 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="hover:bg-noir-lighter"
            data-testid="button-back-home"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-neon-gold glow-text mb-2">Waiting Room</div>
            <div className="inline-flex items-center bg-noir-dark px-6 py-3 rounded-lg border border-neon-cyan/30">
              <span className="text-gray-400 mr-3">Room Code:</span>
              <span className="text-2xl font-mono text-neon-cyan font-bold" data-testid="text-room-code">
                {gameState.roomCode}
              </span>
              <Button
                onClick={copyRoomCode}
                size="sm"
                variant="ghost"
                className="ml-3 text-neon-purple hover:text-neon-purple/80"
                data-testid="button-copy-code"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="w-20" /> {/* Spacer for center alignment */}
        </div>
      </div>

      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Players Grid */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {gameState.participants.map((participant, index) => (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className={`bg-noir-dark border-2 text-center card-hover ${
                  participant.isReady 
                    ? 'border-neon-green/30' 
                    : 'border-gray-600'
                }`}>
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-4 border-2 flex items-center justify-center text-2xl font-bold ${
                      participant.isReady 
                        ? 'border-neon-green bg-neon-green/20 text-neon-green'
                        : 'border-gray-600 bg-gray-700 text-gray-400'
                    }`}>
                      {participant.username.charAt(0).toUpperCase()}
                    </div>
                    <div className={`font-semibold ${
                      participant.isReady ? 'text-neon-green' : 'text-gray-400'
                    }`} data-testid={`text-player-${index}`}>
                      {participant.username}
                      {participant.userId === gameState.hostId && (
                        <Badge className="ml-2 bg-neon-gold text-noir-dark">Host</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {participant.isReady ? 'Ready' : 'Not Ready'}
                    </div>
                    {participant.isReady && (
                      <div className="w-2 h-2 bg-neon-green rounded-full mx-auto mt-2 animate-pulse"></div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 4 - gameState.participants.length) }).map((_, index) => (
              <motion.div
                key={`empty-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: (gameState.participants.length + index) * 0.1 }}
              >
                <Card className="bg-noir-darker border-2 border-dashed border-gray-600 text-center opacity-50">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="text-gray-500" />
                    </div>
                    <div className="text-gray-500">Waiting...</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Game Settings & Controls */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Difficulty Settings (Host Only) */}
            {isHost && (
              <Card className="bg-noir-slate/60 backdrop-blur border border-neon-purple/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-neon-purple mb-4 flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Difficulty Level
                  </h3>
                  <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                    <SelectTrigger className="bg-noir-dark border-neon-purple/30" data-testid="select-difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy - Simple clues, obvious motives</SelectItem>
                      <SelectItem value="medium">Medium - Moderate complexity</SelectItem>
                      <SelectItem value="hard">Hard - Complex web of lies</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {/* Game Info */}
            <Card className="bg-noir-slate/60 backdrop-blur border border-neon-cyan/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-neon-cyan mb-4 flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Game Info
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Players:</span>
                    <span className="text-white">{gameState.participants.length}/6</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phase Duration:</span>
                    <span className="text-white">Investigation: 10m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Discussion:</span>
                    <span className="text-white">5m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Voting:</span>
                    <span className="text-white">2m</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Control Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button
              onClick={handleSetReady}
              variant={currentUser?.isReady ? "default" : "outline"}
              className={`px-8 py-3 font-semibold transition-all duration-300 ${
                currentUser?.isReady 
                  ? 'bg-neon-green hover:bg-neon-green/80' 
                  : 'border-neon-green text-neon-green hover:bg-neon-green hover:text-noir-dark'
              }`}
              data-testid="button-toggle-ready"
            >
              {currentUser?.isReady ? 'Ready!' : 'Mark as Ready'}
            </Button>

            {isHost && (
              <Button
                onClick={handleStartGame}
                disabled={!canStart}
                className="px-8 py-3 bg-gradient-to-r from-neon-green to-neon-cyan font-semibold hover-glow transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                data-testid="button-start-game"
              >
                <Play className="mr-3 h-4 w-4" />
                Start Investigation
              </Button>
            )}
          </motion.div>

          {/* Status Messages */}
          {!allReady && (
            <motion.div 
              className="text-center mt-6 text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Waiting for all players to ready up...
            </motion.div>
          )}

          {gameState.participants.length < 2 && (
            <motion.div 
              className="text-center mt-4 text-yellow-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Need at least 2 players to start the game
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
