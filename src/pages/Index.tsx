import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { getFeaturedDestinations, getPopularActivities } from '@/lib/queries';
import { MapPin, Plane, Search, Star, Users, Camera, Utensils, Mountain, Grid3X3 } from 'lucide-react';
import { DestinationPopup } from '@/components/DestinationPopup';
import { ActivityPopup } from '@/components/ActivityPopup';
import VideoSlide from '@/components/VideoSlide';

const Index = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredDestinations, setFeaturedDestinations] = useState([]);
  const [popularActivities, setPopularActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDestinationPopup, setShowDestinationPopup] = useState(false);
  const [showActivityPopup, setShowActivityPopup] = useState(false);
  useEffect(() => {
    const loadData = async () => {
      try {
        const [destinations, activities] = await Promise.all([getFeaturedDestinations(), getPopularActivities()]);
        setFeaturedDestinations(destinations || []);
        setPopularActivities(activities || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  const handleDestinationClick = (destination: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDestination(destination);
    setShowDestinationPopup(true);
  };
  const handleActivityClick = (activity: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedActivity(activity);
    setShowActivityPopup(true);
  };

  // Sample video data (ในความเป็นจริงอาจจะดึงมาจาก API หรือ database)
  const sampleVideos = [{
    id: '1',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: 'Amazing Sunset at Phi Phi Island',
    description: 'Experience the breathtaking sunset views at one of Thailand\'s most beautiful islands',
    thumbnail: 'https://picsum.photos/400/600?random=1',
    likes: 1205,
    duration: '0:15'
  }, {
    id: '2',
    url: 'https://www.w3schools.com/html/movie.mp4',
    title: 'Street Food Adventure in Bangkok',
    description: 'Discover the amazing flavors of authentic Thai street food',
    thumbnail: 'https://picsum.photos/400/600?random=2',
    likes: 892,
    duration: '0:22'
  }, {
    id: '3',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: 'Temple Hopping in Chiang Mai',
    description: 'Explore the ancient temples and rich culture of Northern Thailand',
    thumbnail: 'https://picsum.photos/400/600?random=3',
    likes: 1456,
    duration: '0:18'
  }];
  const categories = [{
    icon: Camera,
    name: t('category.places'),
    slug: 'places',
    color: 'bg-blue-500'
  }, {
    icon: Utensils,
    name: t('category.restaurants'),
    slug: 'restaurants',
    color: 'bg-orange-500'
  }, {
    icon: Users,
    name: t('category.hotels'),
    slug: 'hotels',
    color: 'bg-green-500'
  }, {
    icon: Plane,
    name: t('category.transportation'),
    slug: 'transportation',
    color: 'bg-purple-500'
  }];
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 travel-gradient opacity-90" />
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            {t('home.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            {t('home.hero.subtitle')}
          </p>
          
          {/* Trip Planning Button */}
          <div className="max-w-2xl mx-auto">
            <Button 
              size="lg" 
              className="h-14 px-8 bg-white text-primary hover:bg-white/90 w-full text-lg"
              onClick={() => navigate('/plan')}
            >
              <Plane className="mr-3 w-6 h-6" />
              {t('home.planTrip.button')}
            </Button>
          </div>
          
          {!user && <div className="mt-8">
              
            </div>}
        </div>
      </section>

      {/* Category Icon */}
      

      {/* Question Section */}
      <section className="px-4 bg-muted/30 py-[30px]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('home.categories.question')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <Card key={category.name} className="cursor-pointer hover:scale-105 transition-transform travel-card" onClick={() => navigate(`/category/${category.slug}`)}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-base">{category.name}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Video Slide Section */}
      <section className="px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('home.videos.title')}</h2>
          <div className="flex justify-center">
            <VideoSlide videos={sampleVideos} />
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="px-4 bg-muted/30 py-[30px]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('home.destinations.title')}</h2>
          {loading ? <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <Card key={i} className="travel-card">
                  <div className="h-48 bg-muted animate-pulse rounded-t-xl" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                  </CardContent>
                </Card>)}
            </div> : <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredDestinations.map((destination: any) => <Card key={destination.id} className="cursor-pointer hover:scale-105 transition-transform travel-card" onClick={e => handleDestinationClick(destination, e)}>
                  <div className="h-48 bg-gradient-to-br from-primary to-secondary rounded-t-xl flex items-center justify-center">
                    {destination.image_url ? <img src={destination.image_url} alt={destination.name} className="w-full h-full object-cover rounded-t-xl" /> : <MapPin className="w-12 h-12 text-white" />}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{destination.name}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{destination.country}</p>
                    <p className="text-sm line-clamp-2">{destination.description}</p>
                  </CardContent>
                </Card>)}
            </div>}
        </div>
      </section>

      {/* Popular Activities */}
      <section className="px-4 py-[30px]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('home.activities.title')}</h2>
          {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <Card key={i} className="travel-card">
                  <div className="h-40 bg-muted animate-pulse rounded-t-xl" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2 mb-2" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/3" />
                  </CardContent>
                </Card>)}
            </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularActivities.slice(0, 6).map((activity: any) => <Card key={activity.id} className="cursor-pointer hover:scale-105 transition-transform travel-card" onClick={e => handleActivityClick(activity, e)}>
                  <div className="h-40 bg-gradient-to-br from-secondary to-accent rounded-t-xl flex items-center justify-center">
                    {activity.image_url ? <img src={activity.image_url} alt={activity.name} className="w-full h-full object-cover rounded-t-xl" /> : <Mountain className="w-8 h-8 text-white" />}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg">{activity.name}</h3>
                      {activity.rating > 0 && <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          {activity.rating}
                        </Badge>}
                    </div>
                    <Badge className="mb-3">{activity.category}</Badge>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {activity.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {activity.destinations?.name}
                      </span>
                      {activity.price && <span className="font-semibold text-primary">
                          ฿{activity.price}
                        </span>}
                    </div>
                  </CardContent>
                </Card>)}
            </div>}
        </div>
      </section>

      {/* Popups */}
      <DestinationPopup destination={selectedDestination} open={showDestinationPopup} onOpenChange={setShowDestinationPopup} />
      
      <ActivityPopup activity={selectedActivity} open={showActivityPopup} onOpenChange={setShowActivityPopup} />
    </div>;
};
export default Index;