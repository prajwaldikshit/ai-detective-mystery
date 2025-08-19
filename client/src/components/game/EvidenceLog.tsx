import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Evidence, GameEvidence } from '@shared/schema';
import { motion } from 'framer-motion';
import { ClipboardList, AlertTriangle } from 'lucide-react';

interface EvidenceLogProps {
  evidence: Evidence[];
  discoveredEvidence: GameEvidence[];
  onEvidenceClick: (evidence: Evidence) => void;
}

export function EvidenceLog({ evidence, discoveredEvidence, onEvidenceClick }: EvidenceLogProps) {
  const getDiscoveredEvidence = (): Evidence[] => {
    return evidence.filter(e => 
      discoveredEvidence.some(de => de.evidenceId === e.id)
    );
  };

  const getSignificanceColor = (significance: string): string => {
    switch (significance) {
      case 'critical': return 'neon-red';
      case 'high': return 'neon-gold';
      case 'medium': return 'neon-purple';
      case 'low': return 'neon-cyan';
      default: return 'gray-400';
    }
  };

  const discoveredItems = getDiscoveredEvidence();

  return (
    <Card className="bg-noir-slate/60 backdrop-blur border border-neon-green/20">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-neon-green mb-4 flex items-center" data-testid="text-evidence-log-title">
          <ClipboardList className="mr-3 h-5 w-5" />
          Evidence Log
        </h3>
        
        <ScrollArea className="h-64">
          {discoveredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <AlertTriangle className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No evidence discovered yet.</p>
              <p className="text-sm mt-1">Explore rooms to find clues!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {discoveredItems.map((evidenceItem, index) => {
                const color = getSignificanceColor(evidenceItem.significance);
                const discoveryInfo = discoveredEvidence.find(de => de.evidenceId === evidenceItem.id);
                
                return (
                  <motion.div
                    key={evidenceItem.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => onEvidenceClick(evidenceItem)}
                    className="cursor-pointer"
                  >
                    <Card className={`bg-noir-dark border-l-4 border-${color} hover:bg-noir-lighter transition-colors duration-200`}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className={`font-semibold text-sm text-${color} mb-1`} data-testid={`text-evidence-${index}-title`}>
                              {evidenceItem.title}
                            </div>
                            <div className="text-xs text-gray-400 mb-1" data-testid={`text-evidence-${index}-location`}>
                              Found in: {evidenceItem.room}
                            </div>
                            <div className="text-xs text-gray-300 line-clamp-2" data-testid={`text-evidence-${index}-description`}>
                              {evidenceItem.description}
                            </div>
                          </div>
                          
                          <div className="ml-2">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                evidenceItem.significance === 'critical' 
                                  ? 'bg-red-500/20 text-red-400'
                                  : evidenceItem.significance === 'high'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}
                            >
                              {evidenceItem.significance}
                            </Badge>
                          </div>
                        </div>
                        
                        {discoveryInfo && discoveryInfo.discoveredAt && (
                          <div className="text-xs text-gray-500 mt-2">
                            Discovered: {new Date(discoveryInfo.discoveredAt).toLocaleTimeString()}
                          </div>
                        )}
                        
                        {evidenceItem.isRedHerring && (
                          <div className="mt-2">
                            <Badge variant="destructive" className="text-xs">
                              Red Herring
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
