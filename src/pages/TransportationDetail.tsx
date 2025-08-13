import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Star, MapPin, DollarSign, Car } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ReviewSection } from '@/components/ReviewSection';

const TransportationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transportation, setTransportation] = useState<any>(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransportation = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('transportation')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setTransportation(data);
        
        // Load reviews for this transportation
        await loadReviews(id);
      } catch (error) {
        console.error('Error loading transportation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransportation();
  }, [id]);

  const loadReviews = async (transportationId?: string) => {
    const reviewId = transportationId || id;
    if (!reviewId) return;
    
    try {
      const { data } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('item_id', reviewId)
        .eq('item_type', 'transportation')
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

  if (!transportation) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">Transportation not found</h3>
            <p className="text-muted-foreground mb-6">
              The transportation option you're looking for doesn't exist.
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
            <h1 className="text-3xl font-bold">{transportation.name}</h1>
            <p className="text-muted-foreground">
              {transportation.category}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="h-64 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center relative overflow-hidden">
              {transportation.image_url ? (
                <img 
                  src={transportation.image_url} 
                  alt={transportation.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Car className="w-16 h-16 text-white" />
              )}
            </div>

            {/* Description */}
            <Card className="travel-card">
              <CardHeader>
                <CardTitle>About this transportation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {transportation.description || 'No description available.'}
                </p>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="travel-card">
              <CardHeader>
                <CardTitle>Reviews & Experiences</CardTitle>
                <CardDescription>What people say about this transportation service</CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewSection
                  itemId={transportation.id}
                  itemType="transportation"
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
                  <CardTitle className="text-lg">Transportation Details</CardTitle>
                  {transportation.rating > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {transportation.rating}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {/* Type */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <Badge className="capitalize">{transportation.category}</Badge>
                  </div>

                  {/* Capacity */}
                  {transportation.capacity && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Capacity</span>
                      <span className="text-sm">{transportation.capacity} passengers</span>
                    </div>
                  )}

                  {/* Price */}
                  {transportation.price && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <div className="flex items-center gap-1 text-lg font-semibold text-primary">
                        <DollarSign className="w-4 h-4" />
                        ฿{transportation.price}
                      </div>
                    </div>
                  )}
                </div>

                <Button className="w-full" size="lg">
                  Book Transportation
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
                    <p className="font-medium">{transportation.category}</p>
                    {transportation.contact_info && (
                      <p className="text-sm text-muted-foreground">
                        {transportation.contact_info}
                      </p>
                    )}
                    {transportation.availability_hours && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Available: {transportation.availability_hours}
                      </p>
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

export default TransportationDetail;