
import React from 'react';
import { Bot, User, MapPin, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ChatMessage = ({ msg }) => {
  const navigate = useNavigate();
  const isBot = msg.type === 'bot';

  return (
    <div className={`flex gap-3 ${!isBot ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`
        w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm border
        ${!isBot ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'}
      `}>
        {!isBot ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-secondary" />}
      </div>

      <div className={`space-y-3 max-w-[85%] lg:max-w-[75%]`}>
        <div className={`
          p-4 rounded-2xl shadow-sm text-sm leading-relaxed
          ${!isBot
            ? 'bg-primary text-primary-foreground rounded-tr-none'
            : 'bg-card border border-border shadow-elegant rounded-tl-none text-foreground'}
        `}>
          {msg.text}
        </div>

        {msg.properties && msg.properties.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {msg.properties.map(property => (
              <Card
                key={property._id}
                onClick={() => navigate(`/property/${property._id}`)}
                className="overflow-hidden border-border/50 hover:border-secondary/50 cursor-pointer transition-all hover:shadow-xl group bg-card/50 backdrop-blur-sm"
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img
                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400'}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Badge variant="secondary" className="bg-black/60 text-white hover:bg-black/60 text-[10px]">
                      {property.land_type}
                    </Badge>
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-sm line-clamp-1 group-hover:text-secondary transition-colors mb-1">
                    {property.title}
                  </h4>
                  <div className="flex items-center text-[11px] text-muted-foreground mb-2">
                    <MapPin className="w-3 h-3 mr-1 text-secondary" />
                    <span className="truncate">{property.location}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                    <span className="font-extrabold text-secondary text-sm">
                      {formatPrice(property.price)}
                    </span>
                    <div className="flex items-center text-[10px] bg-secondary/10 text-secondary px-2 py-1 rounded-full border border-secondary/20">
                      View Details
                      <ExternalLink className="w-2.5 h-2.5 ml-1" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
