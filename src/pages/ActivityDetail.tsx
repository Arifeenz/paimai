import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Star, MapPin, Clock, DollarSign, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ReviewSection } from '@/components/ReviewSection';

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<any>(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivity = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('activities')
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
        setActivity(data);
        
        // Load reviews for this activity
        await loadReviews(id);
      } catch (error) {
        console.error('Error loading activity:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [id]);

  const loadReviews = async (activityId?: string) => {
    const reviewId = activityId || id;
    if (!reviewId) return;
    
    try {
      const { data } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles!reviews_user_id_fkey (full_name)
        `)
        .eq('item_id', reviewId)
        .eq('item_type', 'activity')
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

  if (!activity) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">Activity not found</h3>
            <p className="text-muted-foreground mb-6">
              The activity you're looking for doesn't exist.
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
            <h1 className="text-3xl font-bold">{activity.name}</h1>
            <p className="text-muted-foreground">
              {activity.destinations?.name}, {activity.destinations?.country}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="h-64 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center relative overflow-hidden">
              {activity.image_url ? (
                <img 
                  src={activity.image_url} 
                  alt={activity.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <MapPin className="w-16 h-16 text-white" />
              )}
            </div>

            {/* Description */}
            <Card className="travel-card">
              <CardHeader>
                <CardTitle>About this activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {activity.description || 'No description available.'}
                </p>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="travel-card">
              <CardHeader>
                <CardTitle>Reviews & Experiences</CardTitle>
                <CardDescription>What people say about this activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewSection
                  itemId={activity.id}
                  itemType="activity"
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
                  <CardTitle className="text-lg">Activity Details</CardTitle>
                  {activity.rating > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {activity.rating}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {/* Category */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <Badge className="capitalize">{activity.category}</Badge>
                  </div>

                  {/* Duration */}
                  {activity.duration_hours && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Duration</span>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-3 h-3" />
                        {activity.duration_hours} hours
                      </div>
                    </div>
                  )}

                  {/* Price */}
                  {activity.price && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <div className="flex items-center gap-1 text-lg font-semibold text-primary">
                        <DollarSign className="w-4 h-4" />
                        {activity.price}
                      </div>
                    </div>
                  )}
                </div>

                <Button className="w-full" size="lg">
                  Book This Activity
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
                    <p className="font-medium">{activity.destinations?.name}</p>
                    <p className="text-sm text-muted-foreground">{activity.destinations?.country}</p>
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

export default ActivityDetail;