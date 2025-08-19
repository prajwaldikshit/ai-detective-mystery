import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mystery, GameParticipant } from '@shared/schema';
import { motion } from 'framer-motion';
import { Home, RotateCcw, Trophy, CheckCircle, XCircle } from 'lucide-react';

interface RevealModalProps {
  isOpen: boolean;
  mystery: Mystery;
  participants: GameParticipant[];
  votes: Record<string, string>;
  onPlayAgain: () => void;
  onBackToHome: () => void;
}

export function RevealModal({ 
  isOpen, 
  mystery, 
  participants, 
  votes, 
  onPlayAgain, 
  onBackToHome 
}: RevealModalProps) {
  const murderer = mystery.suspects.find(s => s.id === mystery.murderer.suspectId);
  
  const getCorrectGuessers = (): GameParticipant[] => {
    return participants.filter(p => votes[p.userId] === mystery.murderer.suspectId);
  };

  const getIncorrectGuessers = (): Array<{ participant: GameParticipant; guessedSuspect: string }> => {
    return participants
      .filter(p => votes[p.userId] && votes[p.userId] !== mystery.murderer.suspectId)
      .map(p => ({
        participant: p,
        guessedSuspect: mystery.suspects.find(s => s.id === votes[p.userId])?.name || 'Unknown'
      }));
  };

  const correctGuessers = getCorrectGuessers();
  const incorrectGuessers = getIncorrectGuessers();

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl w-full mx-4 bg-gradient-to-br from-noir-slate to-noir-dark border-2 border-neon-gold text-white">
        <div className="p-8">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-4xl font-bold text-neon-gold glow-text mb-4">Case Solved!</h2>
            <p className="text-xl text-gray-300">The AI reveals the truth...</p>
          </motion.div>

          {/* Murderer Reveal */}
          <motion.div 
            className="bg-noir-dark rounded-xl p-8 border-2 border-red-500 mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-center">
              <div className="text-2xl text-red-500 mb-4">The Murderer Was...</div>
              <div className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-red-500 bg-red-500/20 flex items-center justify-center text-4xl font-bold text-red-500">
                {murderer?.name.charAt(0)}
              </div>
              <h3 className="text-3xl font-bold text-red-500 mb-4" data-testid="text-murderer-name">
                {murderer?.name}
              </h3>
              <div className="max-w-2xl mx-auto">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-neon-gold mb-2">Method:</h4>
                  <p className="text-gray-300" data-testid="text-murder-method">
                    {mystery.murderer.method}
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-neon-purple mb-2">Confession:</h4>
                  <p className="text-lg text-gray-300 leading-relaxed italic" data-testid="text-murderer-confession">
                    "{mystery.murderer.confession}"
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Player Results */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card className="bg-noir-dark border-l-4 border-neon-green">
              <CardContent className="p-6">
                <h4 className="text-lg font-bold text-neon-green mb-4 flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Correct Guesses
                </h4>
                {correctGuessers.length === 0 ? (
                  <div className="text-gray-400 text-center py-4">
                    No one guessed correctly!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {correctGuessers.map((participant, index) => (
                      <div key={participant.id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-neon-green rounded-full flex items-center justify-center text-sm font-bold text-noir-dark">
                          {participant.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="flex-1" data-testid={`text-correct-guesser-${index}`}>
                          {participant.username}
                        </span>
                        <Badge className="bg-neon-green text-noir-dark">
                          +100 points
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-noir-dark border-l-4 border-red-500">
              <CardContent className="p-6">
                <h4 className="text-lg font-bold text-red-500 mb-4 flex items-center">
                  <XCircle className="mr-2 h-5 w-5" />
                  Incorrect Guesses
                </h4>
                {incorrectGuessers.length === 0 ? (
                  <div className="text-gray-400 text-center py-4">
                    Everyone guessed correctly!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {incorrectGuessers.map(({ participant, guessedSuspect }, index) => (
                      <div key={participant.id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                          {participant.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <span data-testid={`text-incorrect-guesser-${index}-name`}>
                            {participant.username}
                          </span>
                          <div className="text-xs text-gray-400">
                            Voted: {guessedSuspect}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Alternate Ending */}
          {correctGuessers.length === 0 && (
            <motion.div 
              className="bg-noir-dark rounded-xl p-6 border border-neon-purple/30 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <h4 className="text-lg font-bold text-neon-purple mb-3">Alternate Ending</h4>
              <p className="text-gray-300 italic" data-testid="text-alternate-ending">
                {mystery.murderer.alternateEnding}
              </p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <Button
              onClick={onPlayAgain}
              className="px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple font-semibold hover-glow transition-all duration-300 transform hover:scale-105"
              data-testid="button-play-again"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Play Again
            </Button>
            
            <Button
              onClick={onBackToHome}
              variant="outline"
              className="px-6 py-3 bg-noir-lighter border-2 border-neon-gold font-semibold hover:bg-neon-gold hover:text-noir-dark transition-all duration-300 transform hover:scale-105"
              data-testid="button-back-home"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            
            <Button
              variant="outline"
              className="px-6 py-3 bg-noir-lighter border-2 border-neon-green font-semibold hover:bg-neon-green hover:text-noir-dark transition-all duration-300 transform hover:scale-105"
              data-testid="button-leaderboard"
            >
              <Trophy className="mr-2 h-4 w-4" />
              View Leaderboard
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
