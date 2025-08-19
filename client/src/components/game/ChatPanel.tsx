import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGame } from '@/hooks/useGame';
import { GameMessage } from '@shared/schema';
import { motion } from 'framer-motion';
import { MessageCircle, Send } from 'lucide-react';

interface ChatPanelProps {
  messages: GameMessage[];
  onSendMessage: (message: string) => void;
}

export function ChatPanel({ messages }: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState('');
  const { sendChatMessage } = useGame();

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendChatMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPlayerColor = (username: string): string => {
    const colors = ['neon-cyan', 'neon-purple', 'neon-green', 'neon-gold', 'red-400', 'blue-400'];
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const formatTimestamp = (timestamp: Date): string => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="bg-noir-slate/60 backdrop-blur border border-neon-cyan/20">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-neon-cyan mb-4 flex items-center" data-testid="text-chat-title">
          <MessageCircle className="mr-3 h-5 w-5" />
          Team Chat
        </h3>
        
        {/* Chat Messages */}
        <ScrollArea className="h-64 mb-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MessageCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No messages yet.</p>
              <p className="text-sm mt-1">Share your theories with the team!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message, index) => {
                const playerColor = getPlayerColor(message.username);
                const playerInitial = message.username.charAt(0).toUpperCase();
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="bg-noir-dark">
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 bg-${playerColor} rounded-full flex items-center justify-center text-xs font-bold text-noir-dark flex-shrink-0`}>
                            {playerInitial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm">
                              <span className={`font-semibold text-${playerColor}`} data-testid={`text-message-${index}-sender`}>
                                {message.username}
                              </span>
                              <span className="text-gray-300 ml-2" data-testid={`text-message-${index}-content`}>
                                {message.message}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1" data-testid={`text-message-${index}-time`}>
                              {message.timestamp ? formatTimestamp(message.timestamp) : ''}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        {/* Chat Input */}
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Share your theories..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-noir-dark border border-gray-600 text-white placeholder-gray-400 focus:border-neon-cyan focus:outline-none transition-colors duration-200"
            data-testid="input-chat-message"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-neon-cyan hover:bg-neon-cyan/80 transition-colors duration-200 disabled:opacity-50"
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
