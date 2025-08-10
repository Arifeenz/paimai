import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Star, Calendar, Users, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ReviewSection } from './ReviewSection';

interface DestinationPopupProps {
  destination: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DestinationPopup = ({ destination, open, onOpenChange }: DestinationPopupProps) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && destination?.id) {
      loadReviews();
    }
  }, [open, destination?.id]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .eq('item_id', destination.id)
        .eq('item_type', 'destination')
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
    navigate(`/destination/${destination.id}`);
  };

  if (!destination) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {destination.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Image */}
          {destination.image_url && (
            <div className="w-full h-48 rounded-lg overflow-hidden">
              <img 
                src={destination.image_url} 
                alt={destination.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{destination.country}</span>
            </div>
            {destination.featured && (
              <Badge variant="secondary" className="w-fit">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-muted-foreground">{destination.description}</p>

          {/* Reviews Section */}
          <ReviewSection
            itemId={destination.id}
            itemType="destination"
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