import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ItineraryItem {
  id: string;
  name: string;
  description: string;
  type: 'destination' | 'activity' | 'hotel' | 'place' | 'restaurant';
  data: any;
  dayNumber: number;
}

interface ItineraryContextType {
  currentItinerary: ItineraryItem[];
  addItemToItinerary: (item: any, type: string, dayNumber?: number) => void;
  removeItemFromItinerary: (itemId: string) => void;
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
      dayNumber
    };

    setCurrentItinerary(prev => [...prev, newItem]);
  };

  const removeItemFromItinerary = (itemId: string) => {
    setCurrentItinerary(prev => prev.filter(item => item.id !== itemId));
  };

  const clearItinerary = () => {
    setCurrentItinerary([]);
  };

  const getItemsByDay = (dayNumber: number) => {
    return currentItinerary.filter(item => item.dayNumber === dayNumber);
  };

  return (
    <ItineraryContext.Provider value={{
      currentItinerary,
      addItemToItinerary,
      removeItemFromItinerary,
      clearItinerary,
      getItemsByDay
    }}>
      {children}
    </ItineraryContext.Provider>
  );
};