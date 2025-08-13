import { supabase } from '@/integrations/supabase/client';

// Destinations
export const getDestinations = async () => {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .order('featured', { ascending: false });
  
  if (error) {
    console.error('Error fetching destinations:', error);
    throw new Error(`ไม่สามารถโหลดรายการปลายทางได้: ${error.message}`);
  }
  return data;
};

export const getFeaturedDestinations = async () => {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .eq('featured', true)
    .limit(6);
  
  if (error) {
    console.error('Error fetching featured destinations:', error);
    throw new Error(`ไม่สามารถโหลดปลายทางแนะนำได้: ${error.message}`);
  }
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
  if (error) {
    console.error('Error fetching activities:', error);
    throw new Error(`ไม่สามารถโหลดกิจกรรมได้: ${error.message}`);
  }
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
  
  if (error) {
    console.error('Error fetching activities by category:', error);
    throw new Error(`ไม่สามารถโหลดกิจกรรมตามหมวดหมู่ได้: ${error.message}`);
  }
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('itineraries')
    .select(`
      *,
      destinations (name, country)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getItinerary = async (id: string) => {
  console.log('Fetching itinerary:', id);
  
  const { data, error } = await supabase
    .from('itineraries')
    .select(`
      *,
      destinations (name, country)
    `)
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching itinerary:', error);
    throw error;
  }

  if (!data) {
    console.log('No itinerary found');
    return null;
  }

  console.log('Itinerary found:', data);

  // Fetch itinerary items separately
  const { data: items, error: itemsError } = await supabase
    .from('itinerary_items')
    .select('*')
    .eq('itinerary_id', id);

  if (itemsError) {
    console.error('Error fetching itinerary items:', itemsError);
    throw itemsError;
  }

  console.log('Itinerary items found:', items);

  // For each item, fetch the actual data based on item_type
  const itemsWithData = await Promise.all(
    (items || []).map(async (item) => {
      let itemData = null;
      
      try {
        switch (item.item_type) {
          case 'activity':
          case 'activities':
            const { data: activity } = await supabase
              .from('activities')
              .select('*')
              .eq('id', item.item_id)
              .maybeSingle();
            itemData = { activities: activity };
            break;
          case 'hotel':
          case 'hotels':
            const { data: hotel } = await supabase
              .from('hotels')
              .select('*')
              .eq('id', item.item_id)
              .maybeSingle();
            itemData = { hotels: hotel };
            break;
          case 'place':
          case 'places':
            const { data: place } = await supabase
              .from('places')
              .select('*')
              .eq('id', item.item_id)
              .maybeSingle();
            itemData = { places: place };
            break;
          case 'restaurant':
          case 'restaurants':
            const { data: restaurant } = await supabase
              .from('restaurants')
              .select('*')
              .eq('id', item.item_id)
              .maybeSingle();
            itemData = { restaurants: restaurant };
            break;
          default:
            console.warn('Unknown item type:', item.item_type);
        }
      } catch (err) {
        console.error(`Error fetching ${item.item_type} data:`, err);
      }

      return {
        ...item,
        ...itemData
      };
    })
  );

  console.log('Items with data:', itemsWithData);

  return {
    ...data,
    itinerary_items: itemsWithData
  };
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

// Add items to itinerary
export const addItemsToItinerary = async (
  itineraryId: string, 
  items: Array<{
    item_id: string;
    item_type: string;
    day_number: number;
    order_index?: number;
    notes?: string;
  }>
) => {
  const itemsToInsert = items.map(item => ({
    ...item,
    itinerary_id: itineraryId,
  }));

  const { data, error } = await supabase
    .from('itinerary_items')
    .insert(itemsToInsert)
    .select();
  
  if (error) throw error;
  return data;
};

// Create itinerary with items
export const createItineraryWithItems = async (
  itinerary: {
    name: string;
    destination_id?: string;
    start_date?: string;
    end_date?: string;
    budget?: number;
    style?: string;
    user_id: string;
  },
  items: Array<{
    item_id: string;
    item_type: string;
    day_number: number;
    order_index?: number;
    notes?: string;
  }>
) => {
  try {
    // Create itinerary first
    const newItinerary = await createItinerary(itinerary);
    
    // Add items if any
    if (items.length > 0) {
      await addItemsToItinerary(newItinerary.id, items);
    }
    
    return newItinerary;
  } catch (error: any) {
    console.error('Error creating itinerary with items:', error);
    if (error.code === '23514') {
      throw new Error('ข้อมูลกิจกรรมไม่ถูกต้อง กรุณาตรวจสอบประเภทของกิจกรรมที่เพิ่ม');
    } else if (error.code === '22P02') {
      throw new Error('รหัสข้อมูลไม่ถูกต้อง กรุณาเลือกกิจกรรมที่มีข้อมูลครบถ้วน');
    } else if (error.code === '23503') {
      throw new Error('ไม่พบข้อมูลที่เกี่ยวข้อง กรุณาตรวจสอบการเชื่อมต่อข้อมูล');
    }
    throw new Error(`ไม่สามารถบันทึกแผนการเดินทางได้: ${error.message}`);
  }
};

// Get user's reviews
export const getUserReviews = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');
  
  console.log('Current user ID:', user.id); // Debug log
  
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      comment,
      rating,
      created_at,
      item_type,
      item_id,
      user_id,
      profiles!inner (full_name)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  console.log('User reviews query result:', { data, error, userFilter: user.id }); // Debug log
  
  if (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
  return data || [];
};

// Get user's recent activity (last viewed items)
export const getUserRecentActivity = async () => {
  // This would typically come from a user_activity table if we had one
  // For now, we'll return user's reviews as recent activity
  return getUserReviews();
};

// Admin CRUD functions for managing travel content
export const createItem = async (table: string, data: any) => {
  const { data: result, error } = await supabase
    .from(table as any)
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error(`Error creating item in ${table}:`, error);
    if (error.code === '23514') {
      throw new Error('ข้อมูลไม่ถูกต้องตามเงื่อนไขที่กำหนด กรุณาตรวจสอบข้อมูลที่กรอก');
    } else if (error.code === '23505') {
      throw new Error('ข้อมูลซ้ำกับที่มีอยู่แล้ว กรุณาใช้ข้อมูลอื่น');
    } else if (error.code === '22P02') {
      throw new Error('รูปแบบข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูลที่กรอก');
    }
    throw new Error(`ไม่สามารถเพิ่มข้อมูลได้: ${error.message}`);
  }
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