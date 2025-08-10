import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Mic, MicOff, Send, X, Plus } from 'lucide-react';
import { searchContent } from '@/lib/queries';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useItinerary } from '@/contexts/ItineraryContext';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  results?: SearchResults;
}

interface SearchResults {
  destinations: any[];
  activities: any[];
  hotels: any[];
  places: any[];
  restaurants: any[];
}

const VoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const navigate = useNavigate();
  const { addItemToItinerary } = useItinerary();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'th-TH,en-US';
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleSearch(transcript);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice recognition error",
          description: "Please try again or type your message.",
          variant: "destructive"
        });
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    } else {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const results = await searchContent(query);
      const totalResults = results.destinations.length + results.activities.length + 
                          results.hotels.length + results.places.length + results.restaurants.length;

      let assistantContent = '';
      if (totalResults > 0) {
        assistantContent = `I found ${totalResults} results for "${query}". Here are some options for you:`;
      } else {
        assistantContent = `I couldn't find any results for "${query}". Try searching for destinations like "Thailand", activities like "diving", or hotels.`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        results: totalResults > 0 ? results : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error while searching. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(inputValue);
  };

  const addToItinerary = (item: any, type: string) => {
    // Add to itinerary context
    addItemToItinerary(item, type, 1);
    
    toast({
      title: "Added to itinerary",
      description: `${item.name} has been added to your trip plan.`
    });
    
    // Navigate to plan page so user can see the item was added
    setTimeout(() => {
      navigate('/plan');
    }, 1000);
  };

  const renderResultCard = (item: any, type: string) => (
    <Card key={`${type}-${item.id}`} className="mb-3 travel-card">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-sm">{item.name}</h4>
          <Badge variant="outline" className="text-xs">
            {type}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {item.description || `${type} in ${item.destinations?.name || item.country}`}
        </p>
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            {item.destinations?.name || item.country}
            {item.price && <span className="ml-2 font-semibold">${item.price}</span>}
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => addToItinerary(item, type)}
            className="h-6 px-2 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (!isOpen) {
    return (
      <Button
        className="floating-action w-14 h-14"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center md:justify-end p-4">
      <Card className="w-full md:w-96 h-[80vh] md:h-[600px] md:mr-4 md:mb-4 flex flex-col">
        <CardHeader className="border-b p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">AI Travel Assistant</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">
                Ask me about destinations, activities, hotels, or anything travel-related!
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className="mb-4">
              <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  {message.content}
                </div>
              </div>
              
              {message.results && (
                <div className="mt-3 ml-4">
                  {message.results.destinations.map(item => renderResultCard(item, 'destination'))}
                  {message.results.activities.map(item => renderResultCard(item, 'activity'))}
                  {message.results.hotels.map(item => renderResultCard(item, 'hotel'))}
                  {message.results.places.map(item => renderResultCard(item, 'place'))}
                  {message.results.restaurants.map(item => renderResultCard(item, 'restaurant'))}
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-muted p-3 rounded-lg text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </ScrollArea>
        
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about destinations, activities..."
                className="flex-1 text-sm"
                disabled={isLoading}
              />
              <Button type="submit" size="sm" disabled={isLoading || !inputValue.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex justify-center">
              <Button
                type="button"
                variant={isListening ? "destructive" : "outline"}
                size="sm"
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading}
                className="w-full"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Voice Search
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default VoiceAssistant;