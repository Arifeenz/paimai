import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getUserItineraries, getUserReviews } from '@/lib/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  MapPin, 
  Calendar, 
  Star, 
  Clock, 
  Plus,
  Plane,
  MessageCircle,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

interface Itinerary {
  id: string;
  name: string;
  created_at: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  style?: string;
  destinations?: {
    name: string;
    country: string;
  };
}

interface Review {
  id: string;
  comment: string;
  rating: number;
  created_at: string;
  item_type: string;
  item_id: string;
  profiles?: {
    full_name: string;
  };
}

const MyTrips = () => {
  const { user } = useAuth();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trips');

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const [itinerariesData, reviewsData] = await Promise.all([
          getUserItineraries(),
          getUserReviews()
        ]);
        
        setItineraries(itinerariesData || []);
        setReviews(reviewsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>เข้าสู่ระบบก่อน</CardTitle>
            <CardDescription>
              คุณต้องเข้าสู่ระบบเพื่อดูข้อมูลการเดินทางของคุณ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/auth">
              <Button className="w-full">เข้าสู่ระบบ</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const TripsContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">แผนการเดินทางของฉัน</h2>
          <p className="text-muted-foreground">จัดการและดูแผนการเดินทางทั้งหมดของคุณ</p>
        </div>
        <Link to="/plan">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            สร้างแผนใหม่
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : itineraries.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Plane className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">ยังไม่มีแผนการเดินทาง</h3>
            <p className="text-muted-foreground mb-4">เริ่มต้นสร้างแผนการเดินทางแรกของคุณ</p>
            <Link to="/plan">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                สร้างแผนการเดินทาง
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itineraries.map((trip) => (
            <Card key={trip.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link to={`/trip/${trip.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{trip.name}</span>
                    <Badge variant="secondary">{trip.style || 'Mixed'}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {trip.destinations ? (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {trip.destinations.name}, {trip.destinations.country}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">ไม่ได้ระบุปลายทาง</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {trip.start_date && trip.end_date ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(trip.start_date), 'dd/MM/yyyy')} - {format(new Date(trip.end_date), 'dd/MM/yyyy')}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        ยังไม่ได้กำหนดวันที่
                      </div>
                    )}
                    {trip.budget && (
                      <div className="flex items-center gap-2">
                        <span>💰</span>
                        งบประมาณ: ฿{trip.budget.toLocaleString()}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      สร้างเมื่อ {format(new Date(trip.created_at), 'dd/MM/yyyy')}
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const ReviewsContent = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">รีวิวของฉัน</h2>
        <p className="text-muted-foreground">ดูรีวิวที่คุณเคยเขียนไว้</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">ยังไม่มีรีวิว</h3>
            <p className="text-muted-foreground mb-4">เริ่มเขียนรีวิวสถานที่ที่คุณไปมา</p>
            <Link to="/">
              <Button>
                <TrendingUp className="w-4 h-4 mr-2" />
                เริ่มสำรวจ
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      รีวิว{review.item_type === 'destination' ? 'ปลายทาง' : 
                             review.item_type === 'activity' ? 'กิจกรรม' : 
                             review.item_type === 'hotel' ? 'โรงแรม' : 
                             review.item_type === 'restaurant' ? 'ร้านอาหาร' : 'สถานที่'}
                    </CardTitle>
                    <CardDescription>
                      เมื่อ {format(new Date(review.created_at), 'dd/MM/yyyy HH:mm')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
            <TabsTrigger value="trips">แผนการเดินทาง</TabsTrigger>
            <TabsTrigger value="reviews">รีวิวของฉัน</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trips">
            <TripsContent />
          </TabsContent>
          
          <TabsContent value="reviews">
            <ReviewsContent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyTrips;