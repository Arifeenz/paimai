import { Heart, Facebook, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Wander Voice</h3>
            <p className="text-sm text-muted-foreground">
              ค้นหาสถานที่ท่องเที่ยวและกิจกรรมที่น่าสนใจ พร้อมวางแผนการเดินทางอย่างง่ายดาย
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">ลิงค์ด่วน</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/plan" className="text-muted-foreground hover:text-primary transition-colors">
                  วางแผนการเดินทาง
                </a>
              </li>
              <li>
                <a href="/my-trips" className="text-muted-foreground hover:text-primary transition-colors">
                  ทริปของฉัน
                </a>
              </li>
              <li>
                <a href="/profile" className="text-muted-foreground hover:text-primary transition-colors">
                  โปรไฟล์
                </a>
              </li>
              <li>
                <a href="/settings" className="text-muted-foreground hover:text-primary transition-colors">
                  ตั้งค่า
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">ติดต่อเรา</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>info@wandervoice.com</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>02-123-4567</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>กรุงเทพมหานคร ประเทศไทย</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">ติดตามเรา</h4>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/paimaiyala"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="w-5 h-5" />
                <span className="text-sm">Facebook</span>
              </a>
            </div>
            <div className="pt-4">
              <h5 className="text-sm font-medium text-foreground mb-2">นโยบาย</h5>
              <ul className="space-y-1 text-xs">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    ข้อกำหนดการใช้งาน
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    นโยบายความเป็นส่วนตัว
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Wander Voice. สงวนลิขสิทธิ์ทุกประการ
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>in Thailand</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};