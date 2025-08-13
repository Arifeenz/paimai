import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'th' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  th: {
    // Navigation
    'nav.home': 'หน้าแรก',
    'nav.plan': 'วางแผนการเดินทาง',
    'nav.myTrips': 'ทริปของฉัน',
    'nav.profile': 'โปรไฟล์',
    'nav.settings': 'ตั้งค่า',
    'nav.admin': 'แอดมิน',
    'nav.auth': 'เข้าสู่ระบบ',
    
    // Home page
    'home.hero.title': 'ค้นหาการผจญภัยครั้งต่อไปของคุณ',
    'home.hero.subtitle': 'ค้นพบสถานที่ที่น่าทึ่ง กิจกรรมที่น่าตื่นเต้น และสร้างความทรงจำที่ไม่รู้ลืม',
    'home.search.placeholder': 'ค้นหาสถานที่ท่องเที่ยว กิจกรรม หรือประสบการณ์...',
    'home.search.button': 'ค้นหา',
    'home.categories.title': 'หมวดหมู่การท่องเที่ยว',
    'home.videos.title': 'เรื่องราวการเดินทาง',
    'home.destinations.title': 'จุดหมายปลายทางยอดนิยม',
    'home.activities.title': 'กิจกรรมยอดนิยม',
    
    // Categories
    'category.destinations': 'จุดหมายปลายทาง',
    'category.activities': 'กิจกรรม', 
    'category.restaurants': 'ร้านอาหาร',
    'category.hotels': 'โรงแรม',
    'category.places': 'สถานที่',
    'category.transportation': 'การเดินทาง',
    
    // Footer
    'footer.brand.description': 'ค้นหาสถานที่ท่องเที่ยวและกิจกรรมที่น่าสนใจ พร้อมวางแผนการเดินทางอย่างง่ายดาย',
    'footer.quickLinks': 'ลิงค์ด่วน',
    'footer.contact': 'ติดต่อเรา',
    'footer.followUs': 'ติดตามเรา',
    'footer.policies': 'นโยบาย',
    'footer.terms': 'ข้อกำหนดการใช้งาน',
    'footer.privacy': 'นโยบายความเป็นส่วนตัว',
    'footer.copyright': '© 2024 Wander Voice. สงวนลิขสิทธิ์ทุกประการ',
    'footer.madeWith': 'Made with',
    'footer.inThailand': 'in Thailand',
    
    // Common
    'common.loading': 'กำลังโหลด...',
    'common.error': 'เกิดข้อผิดพลาด',
    'common.viewDetails': 'ดูรายละเอียด',
    'common.close': 'ปิด',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.plan': 'Plan Trip',
    'nav.myTrips': 'My Trips',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.admin': 'Admin',
    'nav.auth': 'Sign In',
    
    // Home page
    'home.hero.title': 'Discover Your Next Adventure',
    'home.hero.subtitle': 'Find amazing places, exciting activities, and create unforgettable memories',
    'home.search.placeholder': 'Search for destinations, activities, or experiences...',
    'home.search.button': 'Search',
    'home.categories.title': 'Travel Categories',
    'home.videos.title': 'Travel Stories',
    'home.destinations.title': 'Featured Destinations',
    'home.activities.title': 'Popular Activities',
    
    // Categories
    'category.destinations': 'Destinations',
    'category.activities': 'Activities',
    'category.restaurants': 'Restaurants',
    'category.hotels': 'Hotels',
    'category.places': 'Places',
    'category.transportation': 'Transportation',
    
    // Footer
    'footer.brand.description': 'Discover amazing travel destinations and activities, plan your journey with ease',
    'footer.quickLinks': 'Quick Links',
    'footer.contact': 'Contact Us',
    'footer.followUs': 'Follow Us',
    'footer.policies': 'Policies',
    'footer.terms': 'Terms of Service',
    'footer.privacy': 'Privacy Policy',
    'footer.copyright': '© 2024 Wander Voice. All rights reserved',
    'footer.madeWith': 'Made with',
    'footer.inThailand': 'in Thailand',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error occurred',
    'common.viewDetails': 'View Details',
    'common.close': 'Close',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return saved || 'th';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.th] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};