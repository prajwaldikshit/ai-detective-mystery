import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Suspect, GamePhase, GameParticipant } from '@shared/schema';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface SuspectPanelProps {
  suspects: Suspect[];
  phase: GamePhase;
  votes: Record<string, string>;
  participants: GameParticipant[];
}

const suspectColors = ['neon-cyan', 'neon-purple', 'neon-green', 'neon-gold', 'red-500', 'blue-500'];

export function SuspectPanel({ suspects, phase, votes, participants }: SuspectPanelProps) {
  const getVoteCount = (suspectId: string): number => {
    return Object.values(votes).filter(vote => vote === suspectId).length;
  };

  const getVoterNames = (suspectId: string): string[] => {
    return Object.entries(votes)
      .filter(([_, vote]) => vote === suspectId)
      .map(([userId]) => {
        const participant = participants.find(p => p.userId === userId);
        return participant?.username || 'Unknown';
      });
  };

  return (
    <Card className="bg-noir-slate/60 backdrop-blur border border-neon-gold/20">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-neon-gold mb-6 flex items-center" data-testid="text-suspects-title">
          <Users className="mr-3 h-5 w-5" />
          Suspects
        </h3>
        
        <div className="space-y-4">
          {suspects.map((suspect, index) => {
            const color = suspectColors[index % suspectColors.length];
            const voteCount = getVoteCount(suspect.id);
            const voters = getVoterNames(suspect.id);
            
            return (
              <motion.div
                key={suspect.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className={`bg-noir-dark border-l-4 border-${color} hover:bg-noir-lighter transition-colors duration-200 cursor-pointer card-hover`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-12 h-12 rounded-full border-2 border-${color} bg-${color}/20 flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-${color} font-bold text-lg`}>
                          {suspect.name.charAt(0)}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className={`font-semibold text-${color} mb-1`} data-testid={`text-suspect-${index}-name`}>
                          {suspect.name}
                        </div>
                        <div className="text-sm text-gray-400 mb-1" data-testid={`text-suspect-${index}-role`}>
                          {suspect.role}
                        </div>
                        <div className="text-xs text-red-400 mb-2" data-testid={`text-suspect-${index}-motive`}>
                          Motive: {suspect.motive}
                        </div>
                        
                        {/* Voting Information */}
                        {phase === 'voting' || phase === 'reveal' ? (
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-400">Votes:</span>
                              <Badge variant="secondary" className={`text-${color}`}>
                                {voteCount}
                              </Badge>
                            </div>
                            {voteCount > 0 && (
                              <div className="flex space-x-1">
                                {voters.map((voter, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 bg-${color} rounded-full`}
                                    title={voter}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ) : null}

                        {/* Show alibi during investigation/discussion */}
                        {(phase === 'investigation' || phase === 'discussion') && (
                          <div className="mt-2 p-2 bg-noir-slate rounded text-xs">
                            <span className="text-gray-400">Alibi:</span>
                            <div className="text-gray-300 mt-1">{suspect.alibi}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
