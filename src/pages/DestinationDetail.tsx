import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Star, MapPin, Camera, Heart, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getActivities, getHotels, getRestaurants } from '@/lib/queries';
import { ReviewSection } from '@/components/ReviewSection';

const DestinationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState<any>(null);
  const [activities, setActivities] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDestination = async () => {
      if (!id) return;
      
      try {
        // Load destination details
        const { data: destinationData } = await supabase
          .from('destinations')
          .select('*')
          .eq('id', id)
          .single();

        if (destinationData) {
          setDestination(destinationData);

          // Load related activities, hotels, restaurants
          const [activitiesRes, hotelsRes, restaurantsRes, reviewsRes] = await Promise.all([
            getActivities(id),
            getHotels(id),
            getRestaurants(id),
            supabase
              .from('reviews')
              .select(`
                *,
                profiles!reviews_user_id_fkey (full_name)
              `)
              .eq('item_id', id)
              .eq('item_type', 'destination')
              .order('created_at', { ascending: false })
          ]);

          setActivities(activitiesRes || []);
          setHotels(hotelsRes || []);
          setRestaurants(restaurantsRes || []);
          setReviews(reviewsRes.data || []);
        }
      } catch (error) {
        console.error('Error loading destination:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDestination();
  }, [id]);

  const loadReviews = async () => {
    if (!id) return;
    try {
      const { data } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles!reviews_user_id_fkey (full_name)
        `)
        .eq('item_id', id)
        .eq('item_type', 'destination')
        .order('created_at', { ascending: false });
      
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Destination not found</h1>
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Hero Image */}
        <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
          {destination.image_url ? (
            <img
              src={destination.image_url}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <MapPin className="w-16 h-16 text-white" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{destination.name}</h1>
            <p className="text-xl opacity-90">{destination.country}</p>
          </div>
          <div className="absolute top-6 right-6 flex gap-2">
            <Button size="sm" variant="secondary" className="bg-white/20 text-white border-white/20">
              <Heart className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="secondary" className="bg-white/20 text-white border-white/20">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card className="travel-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  About {destination.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {destination.description || `Discover the beauty and culture of ${destination.name}, ${destination.country}. This amazing destination offers countless opportunities for exploration and adventure.`}
                </p>
              </CardContent>
            </Card>

            {/* Activities */}
            {activities.length > 0 && (
              <Card className="travel-card">
                <CardHeader>
                  <CardTitle>Top Activities</CardTitle>
                  <CardDescription>Popular things to do in {destination.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activities.map((activity: any) => (
                      <Card 
                        key={activity.id} 
                        className="cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => navigate(`/activity/${activity.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-sm">{activity.name}</h4>
                            {activity.rating > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                {activity.rating}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {activity.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <Badge className="text-xs">{activity.category}</Badge>
                            {activity.price && (
                              <span className="text-xs font-medium text-primary">${activity.price}</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Hotels */}
            {hotels.length > 0 && (
              <Card className="travel-card">
                <CardHeader>
                  <CardTitle>Recommended Hotels</CardTitle>
                  <CardDescription>Places to stay in {destination.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hotels.map((hotel: any) => (
                      <Card key={hotel.id} className="hover:scale-105 transition-transform">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-sm">{hotel.name}</h4>
                            {hotel.rating > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                {hotel.rating}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {hotel.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">{hotel.address}</span>
                            {hotel.price_per_night && (
                              <span className="text-xs font-medium text-primary">${hotel.price_per_night}/night</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card className="travel-card">
              <CardHeader>
                <CardTitle>Reviews & Experiences</CardTitle>
                <CardDescription>What travelers say about {destination.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewSection
                  itemId={destination.id}
                  itemType="destination"
                  reviews={reviews}
                  onReviewAdded={loadReviews}
                  loading={false}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card className="travel-card">
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{destination.country}</p>
                    <p className="text-xs text-muted-foreground">Country</p>
                  </div>
                </div>
                {destination.featured && (
                  <div className="flex items-center gap-3">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Featured Destination</p>
                      <p className="text-xs text-muted-foreground">Popular choice</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Restaurants */}
            {restaurants.length > 0 && (
              <Card className="travel-card">
                <CardHeader>
                  <CardTitle className="text-lg">Local Restaurants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {restaurants.slice(0, 3).map((restaurant: any) => (
                    <div key={restaurant.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-sm">{restaurant.name}</h4>
                        {restaurant.rating > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            {restaurant.rating}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {restaurant.description}
                      </p>
                      {restaurant.price_range && (
                        <p className="text-xs text-primary mt-1">{restaurant.price_range}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* CTA */}
            <Card className="travel-card">
              <CardContent className="p-6 text-center">
                <Camera className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Plan Your Visit</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a custom itinerary for {destination.name}
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/plan')}
                >
                  Start Planning
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;