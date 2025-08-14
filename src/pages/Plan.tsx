import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, MapPin, Plus, Save, ArrowLeft, Search, Hotel, CalendarIcon, User, Sparkles } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { createItineraryWithItems, getUserItineraries } from '@/lib/queries';
import { toast } from '@/hooks/use-toast';
import { useItinerary } from '@/contexts/ItineraryContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AiTripPlanner from '@/components/plan/AiTripPlanner';

const Plan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  const { currentItinerary, getItemsByDay, removeItemFromItinerary, moveItemToDay, reorderItems } = useItinerary();
  const [planningMode, setPlanningMode] = useState<'choose' | 'manual' | 'ai'>('choose');
  const [itineraryName, setItineraryName] = useState('My Trip');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [days, setDays] = useState([
    { id: 1, items: [] }
  ]);
  const [userItineraries, setUserItineraries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserItineraries();
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    // Check if we're coming from AI trip generation
    if (location.state?.aiGenerated) {
      setPlanningMode('manual');
      const tripData = location.state.tripData;
      if (tripData) {
        setItineraryName(`${tripData.province} Trip`);
        setStartDate(tripData.startDate);
        setEndDate(tripData.endDate);
      }
    }
  }, [location.state]);

  const loadUserItineraries = async () => {
    try {
      const itineraries = await getUserItineraries();
      setUserItineraries(itineraries || []);
    } catch (error: any) {
      console.error('Error loading itineraries:', error);
      toast({
        title: "ไม่สามารถโหลดแผนการเดินทางได้",
        description: error.message || "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    }
  };

  const addDay = () => {
    setDays(prev => [...prev, { id: prev.length + 1, items: [] }]);
  };

  const saveItinerary = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      // Convert currentItinerary items to database format
      const itineraryItems = currentItinerary
        .filter(item => item.data && item.data.id) // Filter out items without valid IDs
        .map((item, index) => ({
          item_id: item.data.id,
          item_type: item.type,
          day_number: item.dayNumber,
          order_index: index,
          notes: ''
        }));

      const newItinerary = await createItineraryWithItems({
        name: itineraryName,
        style: 'mixed',
        user_id: user.id,
        start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null
      }, itineraryItems);

      toast({
        title: "Itinerary saved!",
        description: "Your trip has been saved successfully."
      });

      navigate(`/trip/${newItinerary.id}`);
    } catch (error: any) {
      console.error('Error saving itinerary:', error);
      toast({
        title: "ไม่สามารถบันทึกแผนการเดินทางได้",
        description: error.message || "กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง",
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
    navigate('/category/hotels');
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceDay = parseInt(result.source.droppableId);
    const destinationDay = parseInt(result.destination.droppableId);
    const itemId = result.draggableId;
    const newIndex = result.destination.index;

    // Find the item in the itinerary context
    const item = currentItinerary.find(item => item.id === itemId);
    if (!item) return;

    // If moving to a different day or reordering within the same day
    if (sourceDay !== destinationDay) {
      moveItemToDay(itemId, destinationDay);
      toast({
        title: "เลื่อนรายการสำเร็จ",
        description: `เลื่อนรายการไปยังวันที่ ${destinationDay} เรียบร้อยแล้ว`,
      });
    } else {
      // Reorder within the same day
      reorderItems(itemId, destinationDay, newIndex);
    }
  };

  if (!user) {
    return null;
  }

  const renderChooseMode = () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-4xl mx-auto p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">
          {language === 'th' ? 'วางแผนการเดินทางของคุณ' : 'Plan Your Trip'}
        </h1>
        <p className="text-muted-foreground text-lg mb-12">
          {language === 'th' 
            ? 'เลือกวิธีการวางแผนที่เหมาะกับคุณ' 
            : 'Choose how you\'d like to plan your trip'
          }
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Manual Planning */}
          <Card className="cursor-pointer hover:scale-105 transition-transform travel-card p-6" onClick={() => setPlanningMode('manual')}>
            <CardContent className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">
                {language === 'th' ? 'วางแผนเอง' : 'Plan Yourself'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'th' 
                  ? 'สร้างแผนการเดินทางด้วยตัวคุณเอง เลือกสถานที่และกิจกรรมที่ต้องการ'
                  : 'Create your own itinerary. Choose places and activities that interest you.'
                }
              </p>
            </CardContent>
          </Card>

          {/* AI Planning */}
          <Card className="cursor-pointer hover:scale-105 transition-transform travel-card p-6" onClick={() => setPlanningMode('ai')}>
            <CardContent className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">
                {language === 'th' ? 'ให้ AI ช่วยจัดทริป' : 'Let AI Plan'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'th' 
                  ? 'ให้ปัญญาประดิษฐ์สร้างแผนการเดินทางที่เหมาะกับคุณ'
                  : 'Let artificial intelligence create a personalized trip plan for you.'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mt-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'th' ? 'กลับ' : 'Back'}
        </Button>
      </div>
    </div>
  );

  if (planningMode === 'choose') {
    return renderChooseMode();
  }

  if (planningMode === 'ai') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-4 py-8">
          <AiTripPlanner onBack={() => setPlanningMode('choose')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => setPlanningMode('choose')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'th' ? 'กลับ' : 'Back'}
            </Button>
            <h1 className="text-3xl font-bold">
              {language === 'th' ? 'วางแผนการเดินทาง' : 'Trip Planner'}
            </h1>
          </div>
          <Button onClick={saveItinerary} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {language === 'th' ? 'บันทึกแผนการเดินทาง' : 'Save Itinerary'}
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
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                            disabled={(date) => startDate ? date < startDate : false}
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <DragDropContext onDragEnd={onDragEnd}>
                  {days.map((day) => (
                    <div key={day.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center">
                          <Calendar className="w-5 h-5 mr-2" />
                          Day {day.id}
                          {startDate && (
                            <span className="ml-2 text-sm text-muted-foreground font-normal">
                              {format(new Date(startDate.getTime() + (day.id - 1) * 24 * 60 * 60 * 1000), "MMM dd")}
                            </span>
                          )}
                        </h3>
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                      
                      <Droppable droppableId={day.id.toString()}>
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={cn(
                              "min-h-[100px] transition-colors",
                              snapshot.isDraggingOver && "bg-muted/50 rounded-lg"
                            )}
                          >
                            {getItemsByDay(day.id).length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No activities planned for this day</p>
                                <p className="text-sm">Use the AI assistant to find activities!</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {getItemsByDay(day.id).map((item: any, index: number) => (
                                  <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={cn(
                                          "flex items-center space-x-3 p-3 bg-muted rounded-lg transition-transform",
                                          snapshot.isDragging && "rotate-2 shadow-lg"
                                        )}
                                      >
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
                                    )}
                                  </Draggable>
                                ))}
                              </div>
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                </DragDropContext>
                
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