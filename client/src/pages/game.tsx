import { useParams, useLocation } from 'wouter';
import { useGame } from '@/hooks/useGame';
import type { GameState, Mystery } from '@shared/schema';
import { GameBoard } from '@/components/game/GameBoard';
import { SuspectPanel } from '@/components/game/SuspectPanel';
import { EvidenceLog } from '@/components/game/EvidenceLog';
import { ChatPanel } from '@/components/game/ChatPanel';
import { VotingModal } from '@/components/game/VotingModal';
import { RevealModal } from '@/components/game/RevealModal';
import { ClueModal } from '@/components/game/ClueModal';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

// Sample demo mystery data
const createDemoGameState = (): GameState => ({
  id: 'demo',
  roomCode: 'DEMO01',
  hostId: 'demo-user',
  phase: 'investigation' as const,
  mystery: {
    id: 'demo-mystery',
    title: 'The Midnight Manor Murder',
    setting: 'Victorian Manor House',
    victim: {
      name: 'Lord Blackwood',
      description: 'Wealthy estate owner in his 60s',
      background: 'Recently changed his will, causing family tensions'
    },
    crimeScene: 'Lord Blackwood was found dead in his study, apparently poisoned during his evening brandy.',
    suspects: [
      {
        id: 'suspect-1',
        name: 'Lady Margaret Blackwood',
        role: 'Wife',
        description: 'Elegant woman in her 50s, recently discovered husband\'s affair',
        motive: 'Inheritance and revenge for husband\'s infidelity',
        alibi: 'Claims she was in the garden reading',
        imageUrl: ''
      },
      {
        id: 'suspect-2', 
        name: 'Dr. Harrison Wells',
        role: 'Family Doctor',
        description: 'The family physician for 20 years, recently in debt',
        motive: 'Lord Blackwood threatened to expose his gambling debts',
        alibi: 'Says he was checking on a patient in town',
        imageUrl: ''
      },
      {
        id: 'suspect-3',
        name: 'James Blackwood',
        role: 'Son and Heir',
        description: 'Rebellious son who was recently disinherited',
        motive: 'Father cut him out of the will after a business scandal',
        alibi: 'Claims he was at the local pub until midnight',
        imageUrl: ''
      },
      {
        id: 'suspect-4',
        name: 'Mrs. Eleanor Price',
        role: 'Housekeeper',
        description: 'Loyal servant for 30 years, knows all family secrets',
        motive: 'Lord Blackwood discovered she was stealing money',
        alibi: 'Says she was cleaning the kitchen after dinner',
        imageUrl: ''
      }
    ],
    evidence: [
      {
        id: 'evidence-1',
        title: 'Poisoned Brandy Glass',
        description: 'Crystal glass containing traces of arsenic found on the desk',
        room: 'Study',
        significance: 'critical' as const,
        isRedHerring: false
      },
      {
        id: 'evidence-2',
        title: 'Threatening Letter',
        description: 'Anonymous letter threatening Lord Blackwood found in his desk drawer',
        room: 'Study',
        significance: 'high' as const,
        isRedHerring: false
      },
      {
        id: 'evidence-3',
        title: 'Medical Prescription',
        description: 'Prescription bottle for heart medication, recently refilled',
        room: 'Study',
        significance: 'medium' as const,
        isRedHerring: false
      },
      {
        id: 'evidence-4',
        title: 'Muddy Footprints',
        description: 'Fresh muddy footprints leading from the garden to the study',
        room: 'Study',
        significance: 'medium' as const,
        isRedHerring: true
      }
    ],
    rooms: [
      {
        id: 'study',
        name: 'Study',
        description: 'Dark wood-paneled room with a large desk and fireplace',
        evidence: ['evidence-1', 'evidence-2', 'evidence-3', 'evidence-4'],
        hasBeenExplored: true
      },
      {
        id: 'library',
        name: 'Library',
        description: 'Vast collection of books with comfortable reading chairs',
        evidence: [],
        hasBeenExplored: false
      },
      {
        id: 'kitchen',
        name: 'Kitchen',
        description: 'Large Victorian kitchen with modern cooking equipment',
        evidence: [],
        hasBeenExplored: false
      },
      {
        id: 'garden',
        name: 'Garden',
        description: 'Beautifully maintained garden with herb and flower beds',
        evidence: [],
        hasBeenExplored: false
      }
    ],
    murderer: {
      suspectId: 'suspect-2',
      method: 'Poisoned the brandy with arsenic from medical supplies',
      confession: 'I had no choice! He was going to ruin me, expose my debts to everyone. I used my medical knowledge to make it look natural...',
      alternateEnding: 'Without the detectives\' sharp minds, Dr. Wells would have gotten away with the perfect murder, covering it up as a heart attack.'
    },
    difficulty: 'medium' as const
  },
  participants: [
    {
      id: 'demo-participant',
      gameId: 'demo',
      userId: 'demo-user',
      username: 'Detective Demo',
      isReady: true,
      vote: null,
      score: 0
    }
  ],
  messages: [
    {
      id: 'demo-message-1',
      gameId: 'demo',
      userId: 'demo-user',
      username: 'Detective Demo',
      message: 'This is what the team chat looks like during investigation!',
      timestamp: new Date()
    }
  ],
  discoveredEvidence: [
    {
      id: 'demo-discovered-1',
      gameId: 'demo',
      userId: 'demo-user',
      evidenceId: 'evidence-1',
      room: 'Study',
      discoveredAt: new Date()
    },
    {
      id: 'demo-discovered-2',
      gameId: 'demo',
      userId: 'demo-user',
      evidenceId: 'evidence-2',
      room: 'Study', 
      discoveredAt: new Date()
    }
  ],
  timeRemaining: 480, // 8 minutes remaining
  votes: {},
  phaseStartTime: Date.now()
});

export default function Game() {
  const { gameId } = useParams();
  const [, navigate] = useLocation();
  const { gameState: realGameState, connected } = useGame();
  const [selectedClue, setSelectedClue] = useState<any>(null);
  
  // Use demo data if gameId is 'demo', otherwise use real game state
  const gameState = gameId === 'demo' ? createDemoGameState() : realGameState;

  useEffect(() => {
    if (!gameState && connected && gameId !== 'demo') {
      // If no game state and connected, redirect to home (unless it's demo mode)
      navigate('/');
    }
  }, [gameState, connected, navigate, gameId]);

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

  if (!gameState.mystery) {
    return (
      <div className="min-h-screen bg-noir-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-neon-gold text-2xl mb-4">Generating mystery...</div>
          <div className="text-gray-400">Our AI is crafting the perfect crime for you to solve...</div>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseDescription = (phase: string): string => {
    switch (phase) {
      case 'investigation':
        return 'Gather evidence and question suspects';
      case 'discussion':
        return 'Share findings and theories with your team';
      case 'voting':
        return 'Vote for who you think is the murderer';
      case 'reveal':
        return 'The truth is revealed!';
      default:
        return '';
    }
  };

  const getPhaseProgress = (): number => {
    if (!gameState.mystery) return 0;
    
    const totalEvidence = gameState.mystery.evidence.filter(e => !e.isRedHerring).length;
    const discoveredEvidence = gameState.discoveredEvidence.length;
    return Math.min(100, (discoveredEvidence / totalEvidence) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-noir-dark via-noir-slate to-noir-dark text-gray-100">
      {/* Game Status Header */}
      <div className="bg-noir-slate/80 backdrop-blur border-b border-neon-cyan/20 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-6">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="hover:bg-noir-lighter"
                data-testid="button-back-home"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Exit Game
              </Button>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-gold capitalize" data-testid="text-current-phase">
                  {gameState.phase} Phase
                </div>
                <div className="text-sm text-gray-400">
                  {getPhaseDescription(gameState.phase)}
                </div>
              </div>
              
              {gameState.timeRemaining > 0 && (
                <>
                  <div className="h-12 w-px bg-gray-600"></div>
                  <div className="text-center">
                    <div className="text-lg text-neon-cyan flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Time Remaining
                    </div>
                    <div className="text-2xl font-mono font-bold text-neon-red" data-testid="text-time-remaining">
                      {formatTime(gameState.timeRemaining)}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Progress Bar */}
            {gameState.phase === 'investigation' && (
              <div className="flex-1 max-w-md">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Investigation Progress</span>
                  <span data-testid="text-evidence-count">
                    {gameState.discoveredEvidence.length}/{gameState.mystery.evidence.filter(e => !e.isRedHerring).length} Evidence Found
                  </span>
                </div>
                <Progress 
                  value={getPhaseProgress()} 
                  className="h-3 bg-noir-dark border border-neon-cyan/30"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Game Content */}
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Game Board */}
            <div className="xl:col-span-2">
              <GameBoard 
                mystery={gameState.mystery}
                discoveredEvidence={gameState.discoveredEvidence}
                onClueDiscovered={setSelectedClue}
              />
            </div>

            {/* Suspects Panel */}
            <div className="xl:col-span-1">
              <SuspectPanel 
                suspects={gameState.mystery.suspects}
                phase={gameState.phase}
                votes={gameState.votes}
                participants={gameState.participants}
              />
            </div>

            {/* Evidence & Chat Panel */}
            <div className="xl:col-span-1 space-y-6">
              <EvidenceLog 
                evidence={gameState.mystery.evidence}
                discoveredEvidence={gameState.discoveredEvidence}
                onEvidenceClick={(evidence) => setSelectedClue(evidence)}
              />
              
              <ChatPanel 
                messages={gameState.messages}
                onSendMessage={() => {}} // Handled by ChatPanel internally
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <VotingModal 
        isOpen={gameState.phase === 'voting'}
        suspects={gameState.mystery.suspects}
        votes={gameState.votes}
        participants={gameState.participants}
        timeRemaining={gameState.timeRemaining}
        onVote={() => {}} // Handled by VotingModal internally
      />

      <RevealModal 
        isOpen={gameState.phase === 'reveal'}
        mystery={gameState.mystery}
        participants={gameState.participants}
        votes={gameState.votes}
        onPlayAgain={() => navigate('/')}
        onBackToHome={() => navigate('/')}
      />

      <ClueModal 
        isOpen={!!selectedClue}
        clue={selectedClue}
        mystery={gameState.mystery}
        onClose={() => setSelectedClue(null)}
      />
    </div>
  );
}
