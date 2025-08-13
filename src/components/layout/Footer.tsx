import { Heart, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-muted/50 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Wander Voice</h3>
            <p className="text-sm text-muted-foreground">
              {t('footer.brand.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/plan" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.plan')}
                </a>
              </li>
              <li>
                <a href="/my-trips" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.myTrips')}
                </a>
              </li>
              <li>
                <a href="/profile" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.profile')}
                </a>
              </li>
              <li>
                <a href="/settings" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.settings')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">{t('footer.contact')}</h4>
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
            <h4 className="font-medium text-foreground">{t('footer.followUs')}</h4>
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
              <h5 className="text-sm font-medium text-foreground mb-2">{t('footer.policies')}</h5>
              <ul className="space-y-1 text-xs">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    {t('footer.terms')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    {t('footer.privacy')}
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
              {t('footer.copyright')}
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>{t('footer.madeWith')}</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>{t('footer.inThailand')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};