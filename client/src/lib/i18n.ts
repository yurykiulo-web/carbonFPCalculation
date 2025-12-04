import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app.title": "EcoTrack",
      "app.tagline": "Professional Carbon Footprint Calculator",
      "nav.home": "Home",
      "nav.calculator": "Calculator",
      "nav.about": "About",
      "hero.title": "Calculate Your Environmental Impact",
      "hero.subtitle": "Measure and manage your Scope I, II, and III emissions with our ISO-compliant calculation engine.",
      "hero.cta": "Start Calculation",
      "calc.title": "Carbon Footprint Calculator",
      "calc.step1": "Scope 1: Direct",
      "calc.step2": "Scope 2: Indirect",
      "calc.step3": "Scope 3: Value Chain",
      "calc.fuel": "Fuel Consumption",
      "calc.fuel.placeholder": "Liters of Diesel/Petrol",
      "calc.electricity": "Electricity Usage",
      "calc.electricity.placeholder": "Kilowatt-hours (kWh)",
      "calc.travel": "Business Travel",
      "calc.travel.placeholder": "Kilometers traveled",
      "calc.waste": "Waste Generated",
      "calc.waste.placeholder": "Kilograms of waste",
      "results.title": "Calculation Results",
      "results.total": "Total Carbon Footprint",
      "results.download": "Download PDF Report",
      "footer.hosting": "Securely hosted with 99.9% uptime SLA.",
      "footer.support": "5-Year Technical Support Included.",
      "stats.users": "Active Users",
      "stats.calcs": "Calculations Performed"
    }
  },
  es: {
    translation: {
      "app.title": "EcoTrack",
      "app.tagline": "Calculadora Profesional de Huella de Carbono",
      "nav.home": "Inicio",
      "nav.calculator": "Calculadora",
      "nav.about": "Acerca de",
      "hero.title": "Calcula tu Impacto Ambiental",
      "hero.subtitle": "Mide y gestiona tus emisiones de Alcance I, II y III con nuestro motor compatible con ISO.",
      "hero.cta": "Iniciar Cálculo",
      "calc.title": "Calculadora de Huella de Carbono",
      "calc.step1": "Alcance 1: Directo",
      "calc.step2": "Alcance 2: Indirecto",
      "calc.step3": "Alcance 3: Cadena de Valor",
      "calc.fuel": "Consumo de Combustible",
      "calc.fuel.placeholder": "Litros de Diesel/Gasolina",
      "calc.electricity": "Consumo Eléctrico",
      "calc.electricity.placeholder": "Kilovatios-hora (kWh)",
      "calc.travel": "Viajes de Negocios",
      "calc.travel.placeholder": "Kilómetros viajados",
      "calc.waste": "Residuos Generados",
      "calc.waste.placeholder": "Kilogramos de residuos",
      "results.title": "Resultados del Cálculo",
      "results.total": "Huella de Carbono Total",
      "results.download": "Descargar Reporte PDF",
      "footer.hosting": "Alojamiento seguro con SLA del 99.9%.",
      "footer.support": "5 Años de Soporte Técnico Incluido.",
      "stats.users": "Usuarios Activos",
      "stats.calcs": "Cálculos Realizados"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;