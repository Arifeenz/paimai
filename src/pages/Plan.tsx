import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, MapPin, Plus, Save, ArrowLeft, Search, Hotel } from 'lucide-react';
import { createItinerary, getUserItineraries } from '@/lib/queries';
import { toast } from '@/hooks/use-toast';
import { useItinerary } from '@/contexts/ItineraryContext';

const Plan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getItemsByDay, removeItemFromItinerary } = useItinerary();
  const [itineraryName, setItineraryName] = useState('My Trip');
  const [days, setDays] = useState([
    { id: 1, items: [] }
  ]);
  const [userItineraries, setUserItineraries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    loadUserItineraries();
  }, [user, navigate]);

  const loadUserItineraries = async () => {
    try {
      const itineraries = await getUserItineraries();
      setUserItineraries(itineraries || []);
    } catch (error) {
      console.error('Error loading itineraries:', error);
    }
  };

  const addDay = () => {
    setDays(prev => [...prev, { id: prev.length + 1, items: [] }]);
  };

  const saveItinerary = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save itineraries.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const newItinerary = await createItinerary({
        name: itineraryName,
        style: 'mixed'
      });

      toast({
        title: "Itinerary saved!",
        description: "Your trip has been saved successfully."
      });

      navigate(`/trip/${newItinerary.id}`);
    } catch (error) {
      console.error('Error saving itinerary:', error);
      toast({
        title: "Error saving itinerary",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFindActivities = () => {
    navigate('/category/adventure');
  };

  const handleFindFood = () => {
    navigate('/category/food');
  };

  const handleFindHotels = () => {
    // Could navigate to a hotels category or open a search dialog
    toast({
      title: "Hotel search",
      description: "Use the AI assistant to find hotels for your trip!"
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Trip Planner</h1>
          </div>
          <Button onClick={saveItinerary} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            Save Itinerary
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Itinerary Builder */}
          <div className="lg:col-span-2">
            <Card className="travel-card">
              <CardHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="itinerary-name">Itinerary Name</Label>
                    <Input
                      id="itinerary-name"
                      value={itineraryName}
                      onChange={(e) => setItineraryName(e.target.value)}
                      placeholder="My Amazing Trip"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {days.map((day) => (
                  <div key={day.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Day {day.id}
                      </h3>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                    
                    {getItemsByDay(day.id).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No activities planned for this day</p>
                        <p className="text-sm">Use the AI assistant to find activities!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getItemsByDay(day.id).map((item: any) => (
                          <div key={item.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                  {item.type}
                                </span>
                                {item.data.price && (
                                  <span className="text-xs text-muted-foreground">
                                    ${item.data.price}
                                  </span>
                                )}
                                {item.data.price_range && (
                                  <span className="text-xs text-muted-foreground">
                                    {item.data.price_range}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeItemFromItinerary(item.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                <Button onClick={addDay} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Day
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="travel-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleFindActivities}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Find Activities
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleFindFood}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Find Restaurants
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleFindHotels}
                >
                  <Hotel className="w-4 h-4 mr-2" />
                  Find Hotels
                </Button>
              </CardContent>
            </Card>

            {/* Your Itineraries */}
            <Card className="travel-card">
              <CardHeader>
                <CardTitle>Your Itineraries</CardTitle>
              </CardHeader>
              <CardContent>
                {userItineraries.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No saved itineraries yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {userItineraries.slice(0, 3).map((itinerary: any) => (
                      <div
                        key={itinerary.id}
                        className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => navigate(`/trip/${itinerary.id}`)}
                      >
                        <h4 className="font-medium text-sm">{itinerary.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {itinerary.destinations?.name || 'Multiple destinations'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plan;