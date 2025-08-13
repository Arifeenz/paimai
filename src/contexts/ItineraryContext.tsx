import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ItineraryItem {
  id: string;
  name: string;
  description: string;
  type: 'destination' | 'activity' | 'hotel' | 'place' | 'restaurant';
  data: any;
  dayNumber: number;
  order: number;
}

interface ItineraryContextType {
  currentItinerary: ItineraryItem[];
  addItemToItinerary: (item: any, type: string, dayNumber?: number) => void;
  removeItemFromItinerary: (itemId: string) => void;
  moveItemToDay: (itemId: string, newDayNumber: number) => void;
  reorderItems: (itemId: string, dayNumber: number, newIndex: number) => void;
  clearItinerary: () => void;
  getItemsByDay: (dayNumber: number) => ItineraryItem[];
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

export const useItinerary = () => {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
};

interface ItineraryProviderProps {
  children: ReactNode;
}

export const ItineraryProvider: React.FC<ItineraryProviderProps> = ({ children }) => {
  const [currentItinerary, setCurrentItinerary] = useState<ItineraryItem[]>([]);

  const addItemToItinerary = (item: any, type: string, dayNumber: number = 1) => {
    const newItem: ItineraryItem = {
      id: `${type}-${item.id}-${Date.now()}`,
      name: item.name,
      description: item.description || '',
      type: type as ItineraryItem['type'],
      data: item,
      dayNumber,
      order: Date.now() // Use timestamp as initial order
    };

    setCurrentItinerary(prev => [...prev, newItem]);
  };

  const removeItemFromItinerary = (itemId: string) => {
    setCurrentItinerary(prev => prev.filter(item => item.id !== itemId));
  };

  const clearItinerary = () => {
    setCurrentItinerary([]);
  };

  const moveItemToDay = (itemId: string, newDayNumber: number) => {
    setCurrentItinerary(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, dayNumber: newDayNumber, order: Date.now() }
          : item
      )
    );
  };

  const reorderItems = (itemId: string, dayNumber: number, newIndex: number) => {
    setCurrentItinerary(prev => {
      const items = [...prev];
      const itemIndex = items.findIndex(item => item.id === itemId);
      if (itemIndex === -1) return prev;

      const [movedItem] = items.splice(itemIndex, 1);
      movedItem.dayNumber = dayNumber;
      
      // Get items for the target day and sort by order
      const dayItems = items.filter(item => item.dayNumber === dayNumber).sort((a, b) => a.order - b.order);
      const otherItems = items.filter(item => item.dayNumber !== dayNumber);
      
      // Insert at new position
      dayItems.splice(newIndex, 0, movedItem);
      
      // Update order for all items in the day
      dayItems.forEach((item, index) => {
        item.order = index;
      });
      
      return [...otherItems, ...dayItems];
    });
  };

  const getItemsByDay = (dayNumber: number) => {
    return currentItinerary
      .filter(item => item.dayNumber === dayNumber)
      .sort((a, b) => a.order - b.order);
  };

  return (
    <ItineraryContext.Provider value={{
      currentItinerary,
      addItemToItinerary,
      removeItemFromItinerary,
      moveItemToDay,
      reorderItems,
      clearItinerary,
      getItemsByDay
    }}>
      {children}
    </ItineraryContext.Provider>
  );
};