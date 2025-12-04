import { useTranslation } from 'react-i18next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Calculator } from '@/components/Calculator';
import heroImage from '@assets/generated_images/eco-friendly_modern_architecture_hero_background.png';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          </div>
          
          <div className="container relative z-10 text-center text-white space-y-6 max-w-3xl px-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-light animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
              {t('hero.subtitle')}
            </p>
            <div className="pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <a 
                href="#calculator" 
                className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-primary/25 inline-block"
              >
                {t('hero.cta')}
              </a>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* Calculator Section */}
        <section id="calculator" className="py-24 container">
          <Calculator />
        </section>

        {/* Info Section */}
        <section id="about" className="py-24 bg-secondary/30">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-primary">Scope 1</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Direct emissions from owned or controlled sources. This includes fuel combustion from company vehicles, heating equipment, and fugitive emissions.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-primary">Scope 2</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Indirect emissions from the generation of purchased energy. For most organizations, this is primarily electricity consumption for offices and facilities.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-primary">Scope 3</h3>
                <p className="text-muted-foreground leading-relaxed">
                  All indirect emissions (not included in scope 2) that occur in the value chain of the reporting company, including both upstream and downstream emissions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}