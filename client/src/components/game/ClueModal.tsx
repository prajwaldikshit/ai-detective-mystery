import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Evidence, Mystery } from '@shared/schema';
import { motion } from 'framer-motion';
import { Search, Plus, Bot, MapPin, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ClueModalProps {
  isOpen: boolean;
  clue: Evidence | null;
  mystery: Mystery | null;
  onClose: () => void;
}

export function ClueModal({ isOpen, clue, mystery, onClose }: ClueModalProps) {
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Mock AI analysis generation (in real app, this would call the OpenAI service)
  useEffect(() => {
    if (clue && isOpen) {
      setAnalysisLoading(true);
      // Simulate AI analysis delay
      setTimeout(() => {
        setAiAnalysis(generateMockAnalysis(clue));
        setAnalysisLoading(false);
      }, 1500);
    }
  }, [clue, isOpen]);

  const generateMockAnalysis = (evidence: Evidence): string => {
    const analyses: Record<string, string> = {
      'critical': 'This evidence appears to be directly connected to the murder. The forensic details suggest this was used in the commission of the crime and may contain DNA or fingerprint evidence that could identify the perpetrator.',
      'high': 'This piece of evidence shows significant relevance to the case. It may provide crucial timeline information or establish motive. Further investigation should focus on how this connects to our suspects.',
      'medium': 'While not immediately decisive, this evidence provides important context to the crime scene. It may support other findings or help eliminate certain possibilities in our investigation.',
      'low': 'This evidence provides background information about the case. While not directly incriminating, it helps establish the circumstances surrounding the murder.'
    };
    
    return analyses[evidence.significance] || 'This evidence requires careful analysis to determine its relevance to the case.';
  };

  const getSignificanceColor = (significance: string): string => {
    switch (significance) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-neon-gold';
      case 'medium': return 'text-neon-purple';
      case 'low': return 'text-neon-cyan';
      default: return 'text-gray-400';
    }
  };

  const getSignificanceBg = (significance: string): string => {
    switch (significance) {
      case 'critical': return 'bg-red-500/20 border-red-500';
      case 'high': return 'bg-yellow-500/20 border-neon-gold';
      case 'medium': return 'bg-purple-500/20 border-neon-purple';
      case 'low': return 'bg-cyan-500/20 border-neon-cyan';
      default: return 'bg-gray-500/20 border-gray-500';
    }
  };

  if (!clue) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full mx-4 bg-noir-slate border border-neon-cyan/30 text-white">
        <div className="p-8">
          <motion.div 
            className="text-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-neon-cyan glow-text">Evidence Discovered!</h3>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className={`bg-noir-dark border-l-4 ${getSignificanceBg(clue.significance).split(' ')[1]} mb-6`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-xl font-bold text-neon-cyan" data-testid="text-clue-title">
                    {clue.title}
                  </h4>
                  <Badge 
                    className={`${getSignificanceBg(clue.significance)} ${getSignificanceColor(clue.significance)} border`}
                  >
                    {clue.significance.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm text-gray-400">Location:</span>
                      <span className="text-white ml-2" data-testid="text-clue-location">
                        {clue.room}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Search className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm text-gray-400">Description:</span>
                      <p className="text-white mt-1" data-testid="text-clue-description">
                        {clue.description}
                      </p>
                    </div>
                  </div>

                  {clue.isRedHerring && (
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <Badge variant="destructive" className="text-xs">
                          Red Herring - Misleading Evidence
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Analysis */}
          <motion.div 
            className="bg-gradient-to-r from-neon-purple/10 to-neon-cyan/10 rounded-xl p-6 border border-neon-purple/30 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h5 className="text-lg font-bold text-neon-purple mb-3 flex items-center">
              <Bot className="mr-2 h-5 w-5" />
              AI Analysis
            </h5>
            
            {analysisLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-purple"></div>
                <span className="ml-3 text-gray-300">Analyzing evidence...</span>
              </div>
            ) : (
              <p className="text-gray-300 leading-relaxed" data-testid="text-ai-analysis">
                {aiAnalysis}
              </p>
            )}
          </motion.div>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button
              onClick={onClose}
              className="px-6 py-3 bg-neon-cyan hover:bg-neon-cyan/80 font-semibold hover-glow transition-all duration-300 transform hover:scale-105"
              data-testid="button-close-clue"
            >
              <Plus className="mr-2 h-4 w-4" />
              Continue Investigation
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
