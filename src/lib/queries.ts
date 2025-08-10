import { supabase } from '@/integrations/supabase/client';

// Destinations
export const getDestinations = async () => {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .order('featured', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getFeaturedDestinations = async () => {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .eq('featured', true)
    .limit(6);
  
  if (error) throw error;
  return data;
};

// Activities
export const getActivities = async (destinationId?: string) => {
  let query = supabase
    .from('activities')
    .select(`
      *,
      destinations (
        name,
        country
      )
    `)
    .order('rating', { ascending: false });
  
  if (destinationId) {
    query = query.eq('destination_id', destinationId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getActivitiesByCategory = async (category: string) => {
  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      destinations (
        name,
        country
      )
    `)
    .eq('category', category)
    .order('rating', { ascending: false })
    .limit(10);
  
  if (error) throw error;
  return data;
};

// Hotels
export const getHotels = async (destinationId?: string) => {
  let query = supabase
    .from('hotels')
    .select(`
      *,
      destinations (
        name,
        country
      )
    `)
    .order('rating', { ascending: false });
  
  if (destinationId) {
    query = query.eq('destination_id', destinationId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Places
export const getPlaces = async (destinationId?: string) => {
  let query = supabase
    .from('places')
    .select(`
      *,
      destinations (
        name,
        country
      )
    `)
    .order('rating', { ascending: false });
  
  if (destinationId) {
    query = query.eq('destination_id', destinationId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Restaurants
export const getRestaurants = async (destinationId?: string) => {
  let query = (supabase as any)
    .from('restaurants')
    .select('*')
    .order('rating', { ascending: false });
  
  if (destinationId) {
    query = query.eq('destination_id', destinationId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Search across all content
export const searchContent = async (query: string) => {
  const searchTerm = `%${query}%`;
  
  const [destinations, activities, hotels, places, restaurants] = await Promise.all([
    supabase
      .from('destinations')
      .select('*')
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},country.ilike.${searchTerm}`)
      .limit(5),
    supabase
      .from('activities')
      .select(`
        *,
        destinations (name, country)
      `)
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5),
    supabase
      .from('hotels')
      .select(`
        *,
        destinations (name, country)
      `)
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5),
    supabase
      .from('places')
      .select(`
        *,
        destinations (name, country)
      `)
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5),
    (supabase as any)
      .from('restaurants')
      .select('*')
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5)
  ]);

  return {
    destinations: destinations.data || [],
    activities: activities.data || [],
    hotels: hotels.data || [],
    places: places.data || [],
    restaurants: restaurants.data || []
  };
};

// User Profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

// Itineraries
export const getUserItineraries = async () => {
  const { data, error } = await supabase
    .from('itineraries')
    .select(`
      *,
      destinations (name, country)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getItinerary = async (id: string) => {
  const { data, error } = await supabase
    .from('itineraries')
    .select(`
      *,
      destinations (name, country),
      itinerary_items (
        *,
        activities (*),
        hotels (*),
        places (*)
      )
    `)
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const createItinerary = async (itinerary: {
  name: string;
  destination_id?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  style?: string;
  user_id: string;  // เพิ่ม user_id เป็น required field
}) => {
  const { data, error } = await supabase
    .from('itineraries')
    .insert(itinerary)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateItinerary = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('itineraries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteItinerary = async (id: string) => {
  const { error } = await supabase
    .from('itineraries')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Admin CRUD functions
export const createItem = async (table: string, data: any) => {
  const { data: result, error } = await supabase
    .from(table as any)
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result;
};

export const updateItem = async (table: string, id: string, data: any) => {
  const { data: result, error } = await supabase
    .from(table as any)
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
};

export const deleteItem = async (table: string, id: string) => {
  const { error } = await supabase
    .from(table as any)
    .delete()
    .eq('id', id);

  if (error) throw error;
};