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
    'nav.signUp': 'สมัครสมาชิก',
    'nav.signOut': 'ออกจากระบบ',
    
    // Home page
    'home.hero.title': 'ค้นหาจุดหมายปลายทางในฝันของคุณ',
    'home.hero.subtitle': 'สำรวจสถานที่ท่องเที่ยวที่น่าทึ่งทั่วประเทศไทย',
    'home.planTrip.button': 'เริ่มวางแผนการเดินทาง',
    'home.categories.title': 'หมวดหมู่',
    'home.categories.question': 'คุณกำลังมองหาอะไร?',
    'home.videos.title': 'วิดีโอแนะนำ',
    'home.destinations.title': 'จุดหมายปลายทางยอดนิยม',
    'home.activities.title': 'กิจกรรมแนะนำ',
    
    // Categories
    'category.places': 'ที่เที่ยวและกิจกรรม',
    'category.restaurants': 'อาหารและเครื่องดื่ม',
    'category.hotels': 'ที่พัก',
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
    'common.search': 'ค้นหา',
    'common.filter': 'กรอง',
    'common.sort': 'เรียง',
    'common.save': 'บันทึก',
    'common.cancel': 'ยกเลิก',
    'common.edit': 'แก้ไข',
    'common.delete': 'ลบ',
    'common.add': 'เพิ่ม',
    'common.create': 'สร้าง',
    'common.update': 'อัปเดต',
    'common.submit': 'ส่ง',
    'common.back': 'กลับ',
    'common.next': 'ถัดไป',
    'common.previous': 'ก่อนหน้า',
    'common.price': 'ราคา',
    'common.location': 'สถานที่',
    'common.description': 'รายละเอียด',
    'common.duration': 'ระยะเวลา',
    'common.rating': 'คะแนน',
    'common.reviews': 'รีวิว',
    'common.popular': 'ยอดนิยม',
    'common.featured': 'แนะนำ',
    'common.new': 'ใหม่',
    'common.all': 'ทั้งหมด',
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
    'nav.signUp': 'Sign Up',
    'nav.signOut': 'Sign Out',
    
    // Home page
    'home.hero.title': 'Find Your Dream Destination',
    'home.hero.subtitle': 'Explore amazing tourist attractions across Thailand',
    'home.planTrip.button': 'Start Planning Your Trip',
    'home.categories.title': 'Categories',
    'home.categories.question': 'What are you looking for?',
    'home.videos.title': 'Featured Videos',
    'home.destinations.title': 'Popular Destinations',
    'home.activities.title': 'Recommended Activities',
    
    // Categories
    'category.places': 'Places & Activities',
    'category.restaurants': 'Food & Drinks',
    'category.hotels': 'Accommodation',
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
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.submit': 'Submit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.price': 'Price',
    'common.location': 'Location',
    'common.description': 'Description',
    'common.duration': 'Duration',
    'common.rating': 'Rating',
    'common.reviews': 'Reviews',
    'common.popular': 'Popular',
    'common.featured': 'Featured',
    'common.new': 'New',
    'common.all': 'All',
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