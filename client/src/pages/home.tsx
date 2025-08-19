import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/hooks/useGame';
import { motion } from 'framer-motion';
import { Search, Plus, DoorOpen, Trophy, User, Users, Target, Play } from 'lucide-react';

export default function Home() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const { createGame, joinGame, authenticate, gameState, loading, connected } = useGame();

  // Auto-navigate when game state changes
  useEffect(() => {
    if (gameState) {
      navigate(`/lobby/${gameState.id}`);
    }
  }, [gameState, navigate]);

  const handleCreateGame = async () => {
    if (!username.trim()) return;
    const userId = `user_${Date.now()}_${Math.random()}`;
    authenticate(userId, username.trim());
    await createGame(userId, username.trim());
  };

  const handleJoinGame = () => {
    if (!username.trim() || !roomCode.trim()) return;
    const userId = `user_${Date.now()}_${Math.random()}`;
    authenticate(userId, username.trim());
    // Small delay to ensure authentication completes
    setTimeout(() => {
      joinGame(roomCode.toUpperCase());
    }, 100);
  };

  const handleProfileClick = () => {
    // Placeholder for profile functionality
    alert('Profile feature coming soon! This will show your game stats and achievements.');
  };

  const handleLeaderboardClick = () => {
    // Placeholder for leaderboard functionality
    alert('Leaderboard feature coming soon! This will show top detective rankings.');
  };

  const handleDemoClick = () => {
    // Navigate to demo page with sample mystery data
    navigate('/game/demo');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-noir-dark via-noir-slate to-noir-dark text-gray-100">
      {/* Navigation Header */}
      <nav className="bg-noir-slate/80 backdrop-blur border-b border-neon-cyan/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Search className="text-2xl text-neon-cyan glow-text" />
              <span className="text-xl font-bold text-neon-gold glow-text">AI Detective Mystery</span>
            </motion.div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleProfileClick}
                variant="ghost" 
                className="hover:bg-noir-lighter"
                data-testid="button-profile"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
              <Button 
                onClick={handleLeaderboardClick}
                variant="ghost" 
                className="bg-neon-purple hover:bg-neon-purple/80 hover-glow"
                data-testid="button-leaderboard"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Leaderboard
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-noir-dark via-noir-slate to-noir-dark opacity-90"></div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.h1 
            className="text-6xl md:text-7xl font-bold mb-8 glow-text text-neon-cyan"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            AI Detective Mystery
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Solve murders with friends in this AI-powered multiplayer investigation game. 
            Question suspects, gather evidence, and catch the killer before time runs out.
          </motion.p>
          
          {/* Username Input */}
          <motion.div 
            className="max-w-md mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Input
              type="text"
              placeholder="Enter your detective name..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-noir-dark border-neon-cyan/30 text-white placeholder-gray-400 h-12 text-center text-lg focus:border-neon-cyan"
              data-testid="input-username"
            />
          </motion.div>

          {!showJoinForm ? (
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button
                onClick={handleCreateGame}
                disabled={!username.trim() || loading || !connected}
                className="group px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-xl font-semibold text-lg hover-glow transition-all duration-300 transform hover:scale-105"
                data-testid="button-create-game"
              >
                <Plus className="mr-3 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                Create New Game
              </Button>
              
              <Button
                onClick={() => setShowJoinForm(true)}
                variant="outline"
                className="px-8 py-4 bg-noir-lighter border-2 border-neon-gold rounded-xl font-semibold text-lg hover:bg-neon-gold hover:text-noir-dark transition-all duration-300 transform hover:scale-105"
                data-testid="button-show-join"
              >
                <DoorOpen className="mr-3 h-5 w-5" />
                Join Game
              </Button>
              
              <Button
                onClick={handleDemoClick}
                variant="outline"
                className="px-8 py-4 bg-noir-darker border-2 border-neon-green rounded-xl font-semibold text-lg hover:bg-neon-green hover:text-noir-dark transition-all duration-300 transform hover:scale-105"
                data-testid="button-demo"
              >
                <Play className="mr-3 h-5 w-5" />
                View Demo
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              className="max-w-md mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-noir-slate/60 backdrop-blur border border-neon-gold/20">
                <CardContent className="p-6 space-y-4">
                  <Input
                    type="text"
                    placeholder="Enter room code (e.g. ABC123)"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="bg-noir-dark border-neon-gold/30 text-white placeholder-gray-400 text-center font-mono tracking-wider"
                    maxLength={6}
                    data-testid="input-room-code"
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={handleJoinGame}
                      disabled={!username.trim() || !roomCode.trim() || loading || !connected}
                      className="flex-1 bg-neon-gold hover:bg-neon-gold/80 text-noir-dark font-semibold"
                      data-testid="button-join-game"
                    >
                      Join Game
                    </Button>
                    <Button
                      onClick={() => setShowJoinForm(false)}
                      variant="ghost"
                      className="px-4"
                      data-testid="button-cancel-join"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Connection Status */}
          {!connected && (
            <div className="mt-6">
              <Badge variant="destructive">
                Connecting to server...
              </Badge>
            </div>
          )}

          {/* Quick Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Card className="bg-noir-slate/60 backdrop-blur border border-neon-cyan/20 card-hover">
              <CardContent className="p-6 text-center">
                <div className="text-3xl text-neon-cyan mb-2" data-testid="text-cases-solved">2,847</div>
                <div className="text-gray-400">Cases Solved</div>
              </CardContent>
            </Card>
            
            <Card className="bg-noir-slate/60 backdrop-blur border border-neon-purple/20 card-hover">
              <CardContent className="p-6 text-center">
                <div className="text-3xl text-neon-purple mb-2" data-testid="text-active-players">156</div>
                <div className="text-gray-400">Active Players</div>
              </CardContent>
            </Card>
            
            <Card className="bg-noir-slate/60 backdrop-blur border border-neon-green/20 card-hover">
              <CardContent className="p-6 text-center">
                <div className="text-3xl text-neon-green mb-2" data-testid="text-success-rate">94%</div>
                <div className="text-gray-400">Success Rate</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
