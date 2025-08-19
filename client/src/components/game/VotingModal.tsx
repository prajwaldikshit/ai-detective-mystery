import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useGame } from '@/hooks/useGame';
import { Suspect, GameParticipant } from '@shared/schema';
import { motion } from 'framer-motion';
import { Gavel, Clock } from 'lucide-react';

interface VotingModalProps {
  isOpen: boolean;
  suspects: Suspect[];
  votes: Record<string, string>;
  participants: GameParticipant[];
  timeRemaining: number;
  onVote: (suspectId: string) => void;
}

export function VotingModal({ 
  isOpen, 
  suspects, 
  votes, 
  participants, 
  timeRemaining 
}: VotingModalProps) {
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
  const { castVote } = useGame();
  const currentUserId = participants[0]?.userId; // Assuming first participant is current user

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getVoteCount = (suspectId: string): number => {
    return Object.values(votes).filter(vote => vote === suspectId).length;
  };

  const hasUserVoted = (): boolean => {
    return currentUserId ? currentUserId in votes : false;
  };

  const getUserVote = (): string | null => {
    return currentUserId ? votes[currentUserId] || null : null;
  };

  const handleVote = (suspectId: string) => {
    if (!hasUserVoted()) {
      castVote(suspectId);
      setSelectedSuspect(suspectId);
    }
  };

  const suspectColors = ['neon-cyan', 'neon-purple', 'neon-green', 'neon-gold', 'red-500', 'blue-500'];

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-6xl w-full mx-4 bg-noir-slate border border-neon-gold/30 text-white">
        <div className="p-8">
          <div className="text-center mb-8">
            <motion.h2 
              className="text-4xl font-bold text-neon-gold glow-text mb-4 flex items-center justify-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Gavel className="mr-3 h-8 w-8" />
              Cast Your Vote
            </motion.h2>
            <p className="text-xl text-gray-300">Time to decide who you think is the murderer!</p>
            
            <motion.div 
              className="mt-4 text-2xl font-mono text-neon-red flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Clock className="mr-2 h-6 w-6" />
              <span data-testid="text-voting-timer">{formatTime(timeRemaining)}</span>
            </motion.div>
          </div>

          {/* Voting Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {suspects.map((suspect, index) => {
              const color = suspectColors[index % suspectColors.length];
              const voteCount = getVoteCount(suspect.id);
              const userVote = getUserVote();
              const isSelected = userVote === suspect.id;
              const hasVoted = hasUserVoted();
              
              return (
                <motion.div
                  key={suspect.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Button
                    onClick={() => handleVote(suspect.id)}
                    disabled={hasVoted}
                    className={`group w-full h-auto bg-noir-dark p-6 border-2 transition-all duration-300 card-hover hover-glow ${
                      isSelected 
                        ? `border-${color} bg-${color}/10` 
                        : `border-transparent hover:border-${color}`
                    } ${hasVoted ? 'cursor-not-allowed opacity-75' : ''}`}
                    data-testid={`button-vote-${suspect.id}`}
                  >
                    <div className="text-center">
                      {/* Avatar */}
                      <div className={`w-24 h-24 rounded-full mx-auto mb-4 border-4 ${
                        isSelected ? `border-${color}` : 'border-gray-600'
                      } transition-colors duration-300 bg-${color}/20 flex items-center justify-center text-2xl font-bold text-${color}`}>
                        {suspect.name.charAt(0)}
                      </div>
                      
                      <h3 className={`text-lg font-bold text-${color} mb-2`}>
                        {suspect.name}
                      </h3>
                      <p className="text-sm text-gray-400 mb-3">
                        {suspect.role}
                      </p>
                      
                      <Card className="bg-noir-slate mb-4">
                        <CardContent className="p-3">
                          <div className="text-xs text-red-400 mb-2">Motive:</div>
                          <div className="text-sm text-white">{suspect.motive}</div>
                        </CardContent>
                      </Card>
                      
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-sm text-gray-400">Votes:</span>
                        <Badge className={`bg-${color}/20 text-${color}`}>
                          {voteCount}
                        </Badge>
                        {voteCount > 0 && (
                          <div className="flex space-x-1 ml-2">
                            {Array.from({ length: voteCount }).map((_, i) => (
                              <div key={i} className={`w-2 h-2 bg-${color} rounded-full`} />
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {isSelected && (
                        <div className="mt-3">
                          <Badge className="bg-neon-green text-noir-dark">
                            Your Vote
                          </Badge>
                        </div>
                      )}
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Voting Summary */}
          <motion.div 
            className="bg-noir-dark rounded-xl p-6 border border-neon-cyan/20 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {hasUserVoted() ? (
              <div>
                <div className="text-lg text-gray-300 mb-2">
                  Your Vote: <span className="text-neon-cyan font-bold">
                    {suspects.find(s => s.id === getUserVote())?.name || 'Unknown'}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  Waiting for other players to vote... ({Object.keys(votes).length}/{participants.length} votes cast)
                </div>
              </div>
            ) : (
              <div>
                <div className="text-lg text-gray-300 mb-2">
                  Select a suspect to cast your vote
                </div>
                <div className="text-sm text-gray-400">
                  {Object.keys(votes).length}/{participants.length} players have voted
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
