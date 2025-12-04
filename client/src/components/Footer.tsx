import { useTranslation } from 'react-i18next';
import { ShieldCheck, HeadphonesIcon, Leaf } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-secondary py-12 mt-20 border-t">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Leaf className="h-6 w-6" />
            <span>EcoTrack</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Empowering organizations to measure, manage, and reduce their environmental impact through precise data analytics.
          </p>
        </div>

        <div>
          <h3 className="font-bold mb-4">Services</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Scope I, II, III Analysis</li>
            <li>Supply Chain Audits</li>
            <li>Sustainability Reporting</li>
            <li>Carbon Offsetting</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">Company</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>About Us</li>
            <li>Methodology</li>
            <li>Contact</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold">Enterprise Guarantee</h3>
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
            <p className="text-sm text-muted-foreground">{t('footer.hosting')}</p>
          </div>
          <div className="flex items-start gap-3">
            <HeadphonesIcon className="h-5 w-5 text-primary mt-0.5" />
            <p className="text-sm text-muted-foreground">{t('footer.support')}</p>
          </div>
        </div>
      </div>
      
      <div className="container mt-12 pt-8 border-t border-border/50 text-center text-xs text-muted-foreground">
        <p>&copy; 2025 EcoTrack Solutions. All rights reserved.</p>
      </div>
    </footer>
  );
}