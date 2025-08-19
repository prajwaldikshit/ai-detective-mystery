import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGame } from '@/hooks/useGame';
import { Mystery, GameEvidence } from '@shared/schema';
import { motion } from 'framer-motion';
import { Book, Utensils, Bed, Sprout, SlidersVertical, Home } from 'lucide-react';

interface GameBoardProps {
  mystery: Mystery;
  discoveredEvidence: GameEvidence[];
  onClueDiscovered: (clue: any) => void;
}

const roomIcons: Record<string, any> = {
  library: Book,
  kitchen: Utensils,
  bedroom: Bed,
  garden: Sprout,
  basement: SlidersVertical,
  study: Home,
};

const roomColors = [
  'neon-cyan',
  'neon-purple', 
  'neon-green',
  'neon-gold',
  'red-500',
  'gray-500'
];

export function GameBoard({ mystery, discoveredEvidence, onClueDiscovered }: GameBoardProps) {
  const { exploreRoom } = useGame();

  const handleRoomClick = (roomId: string) => {
    exploreRoom(roomId);
  };

  const getDiscoveredEvidenceCount = (roomId: string): number => {
    const room = mystery.rooms.find(r => r.id === roomId);
    if (!room) return 0;
    
    return room.evidence.filter(evidenceId => 
      discoveredEvidence.some(de => de.evidenceId === evidenceId)
    ).length;
  };

  const getTotalEvidenceCount = (roomId: string): number => {
    const room = mystery.rooms.find(r => r.id === roomId);
    return room?.evidence.length || 0;
  };

  return (
    <Card className="bg-noir-slate/60 backdrop-blur border border-neon-purple/20">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-neon-purple mb-6 flex items-center" data-testid="text-crime-scene-title">
          <Home className="mr-3 h-5 w-5" />
          Crime Scene: {mystery.setting}
        </h3>
        
        <div className="relative bg-noir-dark rounded-lg p-8 border border-gray-700 mb-6">
          <div className="text-center text-gray-300 mb-6" data-testid="text-crime-scene-description">
            {mystery.crimeScene}
          </div>
          
          {/* Interactive Room Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mystery.rooms.map((room, index) => {
              const Icon = roomIcons[room.id.toLowerCase()] || Home;
              const color = roomColors[index % roomColors.length];
              const discoveredCount = getDiscoveredEvidenceCount(room.id);
              const totalCount = getTotalEvidenceCount(room.id);
              
              return (
                <motion.div
                  key={room.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => handleRoomClick(room.id)}
                    className={`w-full h-24 bg-${color}/20 hover:bg-${color}/40 border-2 border-${color}/50 hover:border-${color} transition-all duration-300 p-4 hover-glow group flex flex-col items-center justify-center`}
                    data-testid={`button-room-${room.id}`}
                  >
                    <Icon className={`text-${color} text-xl mb-2 group-hover:scale-110 transition-transform`} />
                    <div className="text-sm font-semibold capitalize">{room.name}</div>
                    <div className="text-xs opacity-75 mt-1">
                      {discoveredCount > 0 ? (
                        <Badge variant="secondary" className="text-xs">
                          {discoveredCount}/{totalCount} clues
                        </Badge>
                      ) : totalCount > 0 ? (
                        <span className="text-gray-400">Unexplored</span>
                      ) : (
                        <span className="text-gray-500">Empty</span>
                      )}
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mystery Context */}
        <div className="bg-noir-dark rounded-lg p-4 border-l-4 border-neon-red">
          <h4 className="font-semibold text-neon-red mb-2">The Case:</h4>
          <p className="text-sm text-gray-300 mb-2" data-testid="text-mystery-title">
            <strong>{mystery.title}</strong>
          </p>
          <p className="text-sm text-gray-400" data-testid="text-victim-info">
            Victim: <strong className="text-white">{mystery.victim.name}</strong> - {mystery.victim.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
