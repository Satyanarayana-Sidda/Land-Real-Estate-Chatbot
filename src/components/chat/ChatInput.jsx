
import React from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ChatInput = ({ input, setInput, handleSend, loading }) => {
  return (
    <div className="p-4 bg-background/80 backdrop-blur-md border-t border-border/50 sticky bottom-0">
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="flex gap-2 relative max-w-4xl mx-auto"
      >
        <div className="relative flex-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask EstateGPT anything..."
            className="pr-24 h-12 rounded-2xl border-border/50 focus-visible:ring-secondary/30 bg-muted/30 shadow-inner"
            disabled={loading}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
             <div className={`transition-opacity duration-300 ${input.length > 5 ? 'opacity-100' : 'opacity-0'}`}>
                <Sparkles className="w-4 h-4 text-secondary/50 animate-pulse" />
             </div>
          </div>
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={loading || !input.trim()}
          className="rounded-2xl h-12 px-6 gradient-gold text-slate-dark font-bold hover:opacity-90 transition-all shadow-md active:scale-95"
        >
          <Send className="w-4 h-4 mr-2" />
          Send
        </Button>
      </form>
      <p className="text-[10px] text-center mt-2 text-muted-foreground">
        EstateGPT may provide information about property listings. Always verify details before investing.
      </p>
    </div>
  );
};

export default ChatInput;
