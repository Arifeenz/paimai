import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getActivitiesByCategory, getDestinations, getHotels, getPlaces, getRestaurants } from '@/lib/queries';
import { ArrowLeft, Star, MapPin, Clock, DollarSign } from 'lucide-react';

const Category = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoryData = async () => {
      if (!category) return;
      
      setLoading(true);
      try {
        let data = [];
        
        switch (category.toLowerCase()) {
          case 'adventure':
            data = await getActivitiesByCategory('adventure');
            break;
          case 'attractions':
            // Get places that are attractions
            const places = await getPlaces();
            data = places.filter((place: any) => place.category === 'attraction');
            break;
          case 'food':
            // Get restaurants
            data = await getRestaurants();
            break;
          case 'hotels':
            // Get hotels
            data = await getHotels();
            break;
          case 'cultural':
            // Get cultural activities and places
            const [culturalActivities, allPlaces] = await Promise.all([
              getActivitiesByCategory('cultural'),
              getPlaces()
            ]);
            const culturalPlaces = allPlaces.filter((place: any) => 
              place.category === 'attraction' && 
              place.description?.toLowerCase().includes('temple') ||
              place.description?.toLowerCase().includes('museum') ||
              place.description?.toLowerCase().includes('cultural')
            );
            data = [...culturalActivities, ...culturalPlaces];
            break;
          default:
            data = [];
        }
        
        setItems(data || []);
      } catch (error) {
        console.error('Error loading category data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryData();
  }, [category]);

  const getCategoryTitle = () => {
    switch (category?.toLowerCase()) {
      case 'adventure': return 'Adventure Activities';
      case 'attractions': return 'Top Attractions';
      case 'food': return 'Food & Dining';
      case 'cultural': return 'Cultural Experiences';
      case 'hotels': return 'Hotels & Accommodation';
      default: return 'Category';
    }
  };

  const getCategoryDescription = () => {
    switch (category?.toLowerCase()) {
      case 'adventure': return 'Thrilling activities and outdoor adventures';
      case 'attractions': return 'Must-see places and tourist attractions';
      case 'food': return 'Local cuisine and dining experiences';
      case 'cultural': return 'Cultural sites and traditional experiences';
      case 'hotels': return 'Comfortable stays and accommodations';
      default: return 'Explore this category';
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="travel-card">
                <Skeleton className="h-48 rounded-t-xl" />
                <CardContent className="p-6">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{getCategoryTitle()}</h1>
            <p className="text-muted-foreground">{getCategoryDescription()}</p>
          </div>
        </div>

        {/* Items Grid */}
        {items.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground mb-6">
              We couldn't find any {category} items at the moment.
            </p>
            <Button onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item: any) => (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:scale-105 transition-transform travel-card"
                onClick={() => {
                  // Navigate based on item type and category
                  if (category === 'hotels' || item.price_per_night) {
                    navigate(`/hotel/${item.id}`);
                  } else if (item.category && ['adventure', 'cultural', 'sightseeing'].includes(item.category)) {
                    navigate(`/activity/${item.id}`);
                  } else {
                    navigate(`/place/${item.id}`);
                  }
                }}
              >
                <div className="h-48 bg-gradient-to-br from-primary to-secondary rounded-t-xl flex items-center justify-center relative overflow-hidden">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <MapPin className="w-12 h-12 text-white" />
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
                    {item.rating > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                        <Star className="w-3 h-3 fill-current" />
                        {item.rating}
                      </Badge>
                    )}
                  </div>
                  
                  {item.category && (
                    <Badge className="mb-3 capitalize">{item.category}</Badge>
                  )}
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {item.description}
                  </p>
                  
                  <div className="space-y-2">
                    {/* Location */}
                    {(item.destinations?.name || item.address) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">
                          {item.destinations?.name || item.address}
                        </span>
                      </div>
                    )}
                    
                    {/* Duration for activities */}
                    {item.duration_hours && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{item.duration_hours} hours</span>
                      </div>
                    )}
                    
                    {/* Price */}
                    {(item.price || item.price_per_night || item.price_range) && (
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <DollarSign className="w-3 h-3" />
                        <span>
                          {item.price_range || `$${item.price || item.price_per_night}`}
                          {item.price_per_night ? '/night' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;