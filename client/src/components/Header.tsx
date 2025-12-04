import { useTranslation } from 'react-i18next';
import { Leaf, Globe, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";

export function Header() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLocation("/login");
  };

  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Leaf className="h-6 w-6" />
          <span>{t('app.title')}</span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a href="#" className="text-foreground/60 hover:text-foreground transition-colors">{t('nav.home')}</a>
          <a href="#calculator" className="text-foreground/60 hover:text-foreground transition-colors">{t('nav.calculator')}</a>
          <a href="#about" className="text-foreground/60 hover:text-foreground transition-colors">{t('nav.about')}</a>
        </nav>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toggleLanguage('en')}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleLanguage('es')}>Español</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {isAuthenticated ? (
            <Button className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground">
              {t('hero.cta')}
            </Button>
          )}
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}