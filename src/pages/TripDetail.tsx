import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Star, MapPin, Calendar, Users, Edit, Trash2, Plus, Clock, DollarSign } from 'lucide-react';
import { getItinerary, deleteItinerary } from '@/lib/queries';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const loadItinerary = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await getItinerary(id);
        setItinerary(data);
      } catch (error) {
        console.error('Error loading itinerary:', error);
        toast({
          title: "Error loading trip",
          description: "Could not load trip details.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadItinerary();
  }, [id, user, navigate]);

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this trip?')) return;

    try {
      await deleteItinerary(id);
      toast({
        title: "Trip deleted",
        description: "Your trip has been deleted successfully."
      });
      navigate('/plan');
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      toast({
        title: "Error deleting trip",
        description: "Could not delete trip. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-32 w-full rounded-xl mb-6" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">Trip not found</h3>
            <p className="text-muted-foreground mb-6">
              The trip you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/plan')}>
              Back to Plan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const itineraryItems = itinerary.itinerary_items || [];
  const groupedByDay = itineraryItems.reduce((acc: any, item: any) => {
    const day = item.day_number || 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/plan')}
              className="rounded-full"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{itinerary.name}</h1>
              <p className="text-muted-foreground">
                {itinerary.destinations?.name ? `${itinerary.destinations.name}, ${itinerary.destinations.country}` : 'Custom Itinerary'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate(`/plan?edit=${id}`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trip Itinerary */}
          <div className="lg:col-span-2">
            <Card className="travel-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Trip Itinerary
                </CardTitle>
                <CardDescription>
                  Your planned activities and accommodations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.keys(groupedByDay).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No activities planned yet</p>
                    <p className="text-sm">Add activities using the AI assistant!</p>
                  </div>
                ) : (
                  Object.keys(groupedByDay).sort((a, b) => parseInt(a) - parseInt(b)).map((day) => (
                    <div key={day} className="border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Day {day}
                      </h3>
                      
                      <div className="space-y-3">
                        {groupedByDay[day].map((item: any) => {
                          const itemData = item.activities || item.hotels || item.places || item.restaurants || {};
                          return (
                            <div key={item.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <div className="flex-1">
                                <h4 className="font-medium">{itemData.name || 'Unknown Item'}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {itemData.description || 'No description available'}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {item.item_type}
                                  </Badge>
                                  {itemData.rating && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Star className="w-3 h-3 fill-current" />
                                      {itemData.rating}
                                    </div>
                                  )}
                                  {(itemData.price || itemData.price_per_night || itemData.price_range) && (
                                    <div className="flex items-center gap-1 text-xs text-primary">
                                      <DollarSign className="w-3 h-3" />
                                      {itemData.price_range || `$${itemData.price || itemData.price_per_night}`}
                                      {itemData.price_per_night ? '/night' : ''}
                                    </div>
                                  )}
                                </div>
                                {item.notes && (
                                  <p className="text-xs text-muted-foreground mt-1 italic">
                                    Note: {item.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Trip Info Sidebar */}
          <div className="space-y-6">
            {/* Trip Details */}
            <Card className="travel-card">
              <CardHeader>
                <CardTitle className="text-lg">Trip Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {itinerary.start_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Start Date</span>
                      <span className="text-sm font-medium">
                        {new Date(itinerary.start_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {itinerary.end_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">End Date</span>
                      <span className="text-sm font-medium">
                        {new Date(itinerary.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {itinerary.budget && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Budget</span>
                      <span className="text-sm font-medium">${itinerary.budget}</span>
                    </div>
                  )}

                  {itinerary.style && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Style</span>
                      <Badge className="text-xs capitalize">{itinerary.style}</Badge>
                    </div>
                  )}
                </div>

                <Button className="w-full" onClick={() => navigate(`/plan?edit=${id}`)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add More Activities
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="travel-card">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Activities</span>
                    <span className="text-sm font-medium">{itineraryItems.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Days Planned</span>
                    <span className="text-sm font-medium">{Object.keys(groupedByDay).length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm font-medium">
                      {new Date(itinerary.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;