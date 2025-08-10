import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { getFeaturedDestinations, getActivitiesByCategory } from '@/lib/queries';
import { MapPin, Plane, Search, Star, Users, Camera, Utensils, Mountain } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredDestinations, setFeaturedDestinations] = useState([]);
  const [popularActivities, setPopularActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [destinations, activities] = await Promise.all([
          getFeaturedDestinations(),
          getActivitiesByCategory('adventure')
        ]);
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

  const categories = [
    { icon: Mountain, name: 'Adventure', color: 'bg-accent' },
    { icon: Camera, name: 'Attractions', color: 'bg-primary' },
    { icon: Utensils, name: 'Food', color: 'bg-secondary' },
    { icon: Users, name: 'Cultural', color: 'bg-muted' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 travel-gradient opacity-90" />
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Discover Your Next
            <span className="block text-gradient">Adventure</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            AI-powered travel planning made simple. Find amazing destinations, create perfect itineraries.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Where do you want to go?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/70"
              />
            </div>
            <Button type="submit" size="lg" className="h-14 px-8 bg-white text-primary hover:bg-white/90">
              <Plane className="mr-2 w-5 h-5" />
              Explore
            </Button>
          </form>
          
          {!user && (
            <div className="mt-8">
              <Button 
                onClick={() => navigate('/auth')} 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Sign in to save trips
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Category Shortcuts */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What are you looking for?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card 
                  key={category.name} 
                  className="cursor-pointer hover:scale-105 transition-transform travel-card"
                  onClick={() => navigate(`/category/${category.name.toLowerCase()}`)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Top Destinations</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="travel-card">
                  <div className="h-48 bg-muted animate-pulse rounded-t-xl" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredDestinations.map((destination: any) => (
                <Card 
                  key={destination.id} 
                  className="cursor-pointer hover:scale-105 transition-transform travel-card"
                  onClick={() => navigate(`/destination/${destination.id}`)}
                >
                  <div className="h-48 bg-gradient-to-br from-primary to-secondary rounded-t-xl flex items-center justify-center">
                    {destination.image_url ? (
                      <img 
                        src={destination.image_url} 
                        alt={destination.name}
                        className="w-full h-full object-cover rounded-t-xl"
                      />
                    ) : (
                      <MapPin className="w-12 h-12 text-white" />
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{destination.name}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{destination.country}</p>
                    <p className="text-sm line-clamp-2">{destination.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Activities */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Recommended Adventures</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="travel-card">
                  <div className="h-40 bg-muted animate-pulse rounded-t-xl" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2 mb-2" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularActivities.slice(0, 6).map((activity: any) => (
                <Card 
                  key={activity.id} 
                  className="cursor-pointer hover:scale-105 transition-transform travel-card"
                  onClick={() => navigate(`/activity/${activity.id}`)}
                >
                  <div className="h-40 bg-gradient-to-br from-secondary to-accent rounded-t-xl flex items-center justify-center">
                    {activity.image_url ? (
                      <img 
                        src={activity.image_url} 
                        alt={activity.name}
                        className="w-full h-full object-cover rounded-t-xl"
                      />
                    ) : (
                      <Mountain className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg">{activity.name}</h3>
                      {activity.rating > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          {activity.rating}
                        </Badge>
                      )}
                    </div>
                    <Badge className="mb-3">{activity.category}</Badge>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {activity.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {activity.destinations?.name}
                      </span>
                      {activity.price && (
                        <span className="font-semibold text-primary">
                          ${activity.price}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
