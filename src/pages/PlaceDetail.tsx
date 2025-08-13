import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Star, MapPin, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ReviewSection } from '@/components/ReviewSection';

const PlaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState<any>(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlace = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('places')
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
        setPlace(data);
        
        // Load reviews for this place
        await loadReviews(id);
      } catch (error) {
        console.error('Error loading place:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlace();
  }, [id]);

  const loadReviews = async (placeId?: string) => {
    const reviewId = placeId || id;
    if (!reviewId) return;
    
    try {
      const { data } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('item_id', reviewId)
        .eq('item_type', 'place')
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

  if (!place) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">Place not found</h3>
            <p className="text-muted-foreground mb-6">
              The place you're looking for doesn't exist.
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
            <h1 className="text-3xl font-bold">{place.name}</h1>
            <p className="text-muted-foreground">
              {place.destinations?.name}, {place.destinations?.country}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="h-64 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center relative overflow-hidden">
              {place.image_url ? (
                <img 
                  src={place.image_url} 
                  alt={place.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building className="w-16 h-16 text-white" />
              )}
            </div>

            {/* Description */}
            <Card className="travel-card">
              <CardHeader>
                <CardTitle>About this place</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {place.description || 'No description available.'}
                </p>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="travel-card">
              <CardHeader>
                <CardTitle>Reviews & Experiences</CardTitle>
                <CardDescription>What people say about this place</CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewSection
                  itemId={place.id}
                  itemType="place"
                  reviews={reviews}
                  onReviewAdded={() => loadReviews()}
                  loading={false}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Place Info */}
            <Card className="travel-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Place Details</CardTitle>
                  {place.rating > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {place.rating}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {/* Category */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <Badge className="capitalize">{place.category}</Badge>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  Get Directions
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
                    <p className="font-medium">{place.destinations?.name}</p>
                    <p className="text-sm text-muted-foreground">{place.destinations?.country}</p>
                    {place.address && (
                      <p className="text-sm text-muted-foreground mt-1">{place.address}</p>
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

export default PlaceDetail;