import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mountain, Star, Clock, DollarSign, ExternalLink, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ReviewSection } from './ReviewSection';

interface ActivityPopupProps {
  activity: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ActivityPopup = ({ activity, open, onOpenChange }: ActivityPopupProps) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && activity?.id) {
      loadReviews();
    }
  }, [open, activity?.id]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles!reviews_user_id_fkey (full_name)
        `)
        .eq('item_id', activity.id)
        .eq('item_type', 'activity')
        .order('created_at', { ascending: false })
        .limit(3);
      
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    onOpenChange(false);
    navigate(`/activity/${activity.id}`);
  };

  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mountain className="w-5 h-5 text-primary" />
            {activity.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Image */}
          {activity.image_url && (
            <div className="w-full h-48 rounded-lg overflow-hidden">
              <img 
                src={activity.image_url} 
                alt={activity.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Badge>{activity.category}</Badge>
            </div>
            {activity.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{activity.rating}</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activity.duration_hours && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{activity.duration_hours}h</span>
              </div>
            )}
            {activity.price && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">${activity.price}</span>
              </div>
            )}
            {activity.destinations?.name && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{activity.destinations.name}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-muted-foreground">{activity.description}</p>

          {/* Reviews Section */}
          <ReviewSection
            itemId={activity.id}
            itemType="activity"
            reviews={reviews}
            onReviewAdded={loadReviews}
            loading={loading}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleViewDetails} className="flex-1">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Full Details
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};