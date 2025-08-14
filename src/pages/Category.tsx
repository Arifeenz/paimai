import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getActivitiesByCategory, getDestinations, getHotels, getPlaces, getRestaurants, getTransportation, getActivities } from '@/lib/queries';
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
          case 'places-activities':
            // Combine places and activities data
            const [places, activities] = await Promise.all([
              getPlaces(),
              getActivities()
            ]);
            data = [...(places || []), ...(activities || [])];
            break;
          case 'restaurants':
            // Get all restaurants
            data = await getRestaurants();
            break;
          case 'hotels':
            // Get all hotels
            data = await getHotels();
            break;
          case 'transportation':
            // Get all transportation
            data = await getTransportation();
            break;
          // Keep old category support for backwards compatibility
          case 'places':
            data = await getActivities();
            console.log('Places data loaded:', data);
            break;
          case 'activities':
            const allActivities = await getActivitiesByCategory('');
            data = allActivities;
            break;
          case 'adventure':
            data = await getActivitiesByCategory('adventure');
            break;
          case 'sightseeing':
            const sightseeingPlaces = await getPlaces();
            data = sightseeingPlaces.filter((place: any) => place.category === 'attraction');
            break;
          case 'food':
            const [restaurants, foodActivities] = await Promise.all([
              getRestaurants(),
              getActivitiesByCategory('food')
            ]);
            data = [...restaurants, ...foodActivities];
            break;
          case 'cultural':
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
          case 'nature':
            data = await getActivitiesByCategory('nature');
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
      case 'places-activities': return 'ที่เที่ยวและกิจกรรม';
      case 'restaurants': return 'อาหารและเครื่องดื่ม';
      case 'hotels': return 'ที่พัก';
      case 'transportation': return 'การเดินทาง';
      // Keep old category support
      case 'places': return 'สถานที่ท่องเที่ยว';
      case 'activities': return 'กิจกรรมและประสบการณ์';
      case 'adventure': return 'กิจกรรมผจญภัย';
      case 'sightseeing': return 'สถานที่ท่องเที่ยว';
      case 'food': return 'อาหารและร้านอาหาร';
      case 'cultural': return 'ประสบการณ์วัฒนธรรม';
      case 'nature': return 'ธรรมชาติ';
      default: return 'หมวดหมู่';
    }
  };

  const getCategoryDescription = () => {
    switch (category?.toLowerCase()) {
      case 'places-activities': return 'สถานที่ต้องชมและกิจกรรมที่น่าสนใจทั้งหมด';
      case 'restaurants': return 'ร้านอาหารและประสบการณ์การรับประทานอาหาร';
      case 'hotels': return 'ที่พักสบายและโรงแรมคุณภาพ';
      case 'transportation': return 'บริการการเดินทาง เช่ารถ และขนส่ง';
      // Keep old category support
      case 'places': return 'สถานที่ต้องชมและสถานที่ท่องเที่ยวที่น่าสนใจ';
      case 'activities': return 'กิจกรรมและประสบการณ์ที่น่าตื่นเต้น';
      case 'adventure': return 'กิจกรรมที่ท้าทายและการผจญภัยกลางแจ้ง';
      case 'sightseeing': return 'สถานที่ต้องชมและสถานที่ท่องเที่ยว';
      case 'food': return 'อาหารท้องถิ่นและประสบการณ์การรับประทานอาหาร';
      case 'cultural': return 'สถานที่ทางวัฒนธรรมและประสบการณ์ดั้งเดิม';
      case 'nature': return 'ธรรมชาติและสถานที่ผ่อนคลาย';
      default: return 'สำรวจหมวดหมู่นี้';
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
            <h3 className="text-xl font-semibold mb-2">ไม่พบรายการ</h3>
            <p className="text-muted-foreground mb-6">
              เราไม่พบรายการ {getCategoryTitle()} ในขณะนี้
            </p>
            <Button onClick={() => navigate('/')}>
              กลับหน้าแรก
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
                  } else if (category === 'restaurants' || item.price_range || item.opening_hours) {
                    navigate(`/restaurant/${item.id}`);
                  } else if (category === 'transportation' || item.capacity || item.features) {
                    navigate(`/transportation/${item.id}`);
                  } else if (category === 'activities' || category === 'places-activities' || item.duration_hours || item.price) {
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
                         <span>{item.duration_hours} ชั่วโมง</span>
                       </div>
                     )}
                     
                     {/* Price */}
                     {(item.price || item.price_per_night || item.price_range) && (
                       <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                         <DollarSign className="w-3 h-3" />
                         <span>
                           {item.price_range || `฿${item.price || item.price_per_night}`}
                           {item.price_per_night ? '/คืน' : ''}
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