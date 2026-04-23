
import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader2, Sparkles, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';

const AIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: `Welcome to EstateGPT, ${user?.full_name?.split(' ')[0] || 'friend'}! 🚀 I'm your advanced AI Real Estate Assistant. I can help you analyze land investments, find specific plots, or answer market questions. What are we looking for today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = { id: Date.now(), type: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai', { message: text });

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: data.response,
        properties: data.properties || []
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        text: "System overload. Please try again in a moment."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Plots under ₹50 Lakhs",
    "Agricultural land in Austin",
    "Commercial space for sale",
    "Investment advice for 2024",
    "Residential plots with water access"
  ];

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col max-w-5xl mx-auto px-4 sm:px-6">
        <header className="py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-gold flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
              <Bot className="w-7 h-7 text-slate-dark" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif font-bold tracking-tight">EstateGPT</h1>
                <span className="bg-secondary/10 text-secondary text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-secondary/20 tracking-widest">v2.0 Beta</span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-secondary" />
                Next-gen AI real estate intelligence
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setMessages([messages[0]])} 
            className="text-muted-foreground hover:text-red-500 hover:bg-red-50 flex gap-2 rounded-xl"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Context</span>
          </Button>
        </header>

        <div className="flex-1 bg-card/40 backdrop-blur-sm border rounded-3xl shadow-elegant overflow-hidden flex flex-col mb-4">
          <ScrollArea className="flex-1 px-4 sm:px-6">
            <div className="space-y-8 py-8">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} msg={msg} />
              ))}
              
              {loading && (
                <div className="flex gap-3 animate-in fade-in duration-300">
                  <div className="w-10 h-10 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm">
                    <Bot className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="bg-card border border-border p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground italic">Analyzing market data...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {messages.length === 1 && (
            <div className="px-6 pb-4">
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-3 tracking-widest ml-1">Quick Insights</p>
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    className="whitespace-nowrap px-4 py-2 rounded-xl bg-card border border-border text-xs font-semibold hover:border-secondary hover:text-secondary transition-all shadow-sm hover:shadow-md active:scale-95"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <ChatInput 
            input={input} 
            setInput={setInput} 
            handleSend={handleSend} 
            loading={loading} 
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistant;

