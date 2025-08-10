import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  MapPin, 
  Mountain, 
  Building, 
  Users, 
  Star,
  Plus,
  Search,
  Edit,
  Trash
} from 'lucide-react';
import { getUserProfile } from '@/lib/queries';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('destinations');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState({
    destinations: [],
    activities: [],
    hotels: [],
    places: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    checkAdminAccess();
  }, [user, navigate]);

  const checkAdminAccess = async () => {
    try {
      const profile = await getUserProfile(user!.id);
      setUserProfile(profile);
      
      if (!profile || profile.role !== 'admin') {
        toast({
          title: "Access denied",
          description: "You don't have permission to access the admin dashboard.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      await loadData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [destinations, activities, hotels, places] = await Promise.all([
        supabase.from('destinations').select('*').order('created_at', { ascending: false }),
        supabase.from('activities').select('*, destinations(name)').order('created_at', { ascending: false }),
        supabase.from('hotels').select('*, destinations(name)').order('created_at', { ascending: false }),
        supabase.from('places').select('*, destinations(name)').order('created_at', { ascending: false })
      ]);

      setData({
        destinations: destinations.data || [],
        activities: activities.data || [],
        hotels: hotels.data || [],
        places: places.data || []
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error loading data",
        description: "Please refresh the page and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (table: string, id: string) => {
    try {
      const { error } = await supabase
        .from(table as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Item deleted",
        description: "The item has been successfully deleted."
      });

      await loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error deleting item",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderTable = (items: any[], type: string) => {
    const filteredItems = items.filter(item =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={`Search ${type}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add {type.slice(0, -1)}
          </Button>
        </div>

        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="travel-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      {item.featured && <Badge>Featured</Badge>}
                      {item.rating && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          {item.rating}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      {item.country && (
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {item.country}
                        </span>
                      )}
                      {item.destinations?.name && (
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {item.destinations.name}
                        </span>
                      )}
                      {item.price && (
                        <span className="font-semibold text-primary">
                          ${item.price}
                        </span>
                      )}
                      {item.price_per_night && (
                        <span className="font-semibold text-primary">
                          ${item.price_per_night}/night
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteItem(type, item.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No {type} found</p>
          </div>
        )}
      </div>
    );
  };

  if (!user || !userProfile || userProfile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Checking permissions...</h2>
          <p className="text-muted-foreground">Please wait while we verify your access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your travel content</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Site
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="travel-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Destinations</p>
                  <p className="text-2xl font-bold">{data.destinations.length}</p>
                </div>
                <MapPin className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="travel-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Activities</p>
                  <p className="text-2xl font-bold">{data.activities.length}</p>
                </div>
                <Mountain className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="travel-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hotels</p>
                  <p className="text-2xl font-bold">{data.hotels.length}</p>
                </div>
                <Building className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="travel-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Places</p>
                  <p className="text-2xl font-bold">{data.places.length}</p>
                </div>
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Management */}
        <Card className="travel-card">
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="destinations">Destinations</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="hotels">Hotels</TabsTrigger>
                <TabsTrigger value="places">Places</TabsTrigger>
              </TabsList>
              
              <TabsContent value="destinations" className="mt-6">
                {renderTable(data.destinations, 'destinations')}
              </TabsContent>
              
              <TabsContent value="activities" className="mt-6">
                {renderTable(data.activities, 'activities')}
              </TabsContent>
              
              <TabsContent value="hotels" className="mt-6">
                {renderTable(data.hotels, 'hotels')}
              </TabsContent>
              
              <TabsContent value="places" className="mt-6">
                {renderTable(data.places, 'places')}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;