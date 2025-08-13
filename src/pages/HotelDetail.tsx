import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Star, MapPin, DollarSign, Hotel, Wifi, Car, Coffee } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ReviewSection } from '@/components/ReviewSection';

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<any>(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHotel = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('hotels')
          .select(`
            *,
            destinations (
              name,
              country
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setHotel(data);
        
        // Load reviews for this hotel
        await loadReviews(id);
      } catch (error) {
        console.error('Error loading hotel:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHotel();
  }, [id]);

  const loadReviews = async (hotelId?: string) => {
    const reviewId = hotelId || id;
    if (!reviewId) return;
    
    try {
      const { data } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('item_id', reviewId)
        .eq('item_type', 'hotel')
        .order('created_at', { ascending: false });
      
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-xl mb-6" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">Hotel not found</h3>
            <p className="text-muted-foreground mb-6">
              The hotel you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{hotel.name}</h1>
            <p className="text-muted-foreground">
              {hotel.destinations?.name}, {hotel.destinations?.country}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="h-64 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center relative overflow-hidden">
              {hotel.image_url ? (
                <img 
                  src={hotel.image_url} 
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Hotel className="w-16 h-16 text-white" />
              )}
            </div>

            {/* Description */}
            <Card className="travel-card">
              <CardHeader>
                <CardTitle>About this hotel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {hotel.description || 'No description available.'}
                </p>
              </CardContent>
            </Card>

            {/* Amenities */}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <Card className="travel-card">
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {hotel.amenities.map((amenity: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-primary/10 flex items-center justify-center">
                          {amenity.toLowerCase().includes('wifi') && <Wifi className="w-3 h-3 text-primary" />}
                          {amenity.toLowerCase().includes('parking') && <Car className="w-3 h-3 text-primary" />}
                          {amenity.toLowerCase().includes('breakfast') && <Coffee className="w-3 h-3 text-primary" />}
                          {!amenity.toLowerCase().includes('wifi') && 
                           !amenity.toLowerCase().includes('parking') && 
                           !amenity.toLowerCase().includes('breakfast') && 
                           <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card className="travel-card">
              <CardHeader>
                <CardTitle>Reviews & Experiences</CardTitle>
                <CardDescription>What guests say about this hotel</CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewSection
                  itemId={hotel.id}
                  itemType="hotel"
                  reviews={reviews}
                  onReviewAdded={() => loadReviews()}
                  loading={false}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Info */}
            <Card className="travel-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Hotel Details</CardTitle>
                  {hotel.rating > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {hotel.rating}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {/* Star Rating */}
                  {hotel.star_rating && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Star Rating</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: hotel.star_rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current text-yellow-500" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price per night */}
                  {hotel.price_per_night && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Price per night</span>
                      <div className="flex items-center gap-1 text-lg font-semibold text-primary">
                        <DollarSign className="w-4 h-4" />
                        {hotel.price_per_night}
                      </div>
                    </div>
                  )}
                </div>

                <Button className="w-full" size="lg">
                  Book This Hotel
                </Button>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="travel-card">
              <CardHeader>
                <CardTitle className="text-lg">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{hotel.destinations?.name}</p>
                    <p className="text-sm text-muted-foreground">{hotel.destinations?.country}</p>
                    {hotel.address && (
                      <p className="text-sm text-muted-foreground mt-1">{hotel.address}</p>
                    )}
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

export default HotelDetail;