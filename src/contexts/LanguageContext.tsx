import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define supported languages
export type Language = 'es' | 'en';

// Define translations structure
interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

// Define our translations
const translations: Translations = {
  // Header translations
  navHome: {
    en: 'Home',
    es: 'Inicio'
  },
  navTrack: {
    en: 'Track',
    es: 'Rastrear'
  },
  trackService: {
    en: 'Track Service',
    es: 'Rastrear Servicio'
  },
  // Footer translations
  companyName: {
    en: 'Costa Rica Batteries',
    es: 'Baterías Costa Rica'
  },
  footerDesc: {
    en: 'Real-time tracking service for roadside assistance and towing.',
    es: 'Servicio de rastreo en tiempo real para asistencia en carretera y grúas.'
  },
  navigation: {
    en: 'Navigation',
    es: 'Navegación'
  },
  drivers: {
    en: 'Drivers',
    es: 'Conductores'
  },
  onTrip: {
    en: 'I\'m on a trip',
    es: 'Estoy en viaje'
  },
  tripHistory: {
    en: 'Trip history',
    es: 'Historial de viajes'
  },
  shareLocation: {
    en: 'Share location',
    es: 'Compartir ubicación'
  },
  contact: {
    en: 'Contact',
    es: 'Contacto'
  },
  emergency: {
    en: 'Emergency:',
    es: 'Emergencias:'
  },
  terms: {
    en: 'Terms and Conditions',
    es: 'Términos y Condiciones'
  },
  privacy: {
    en: 'Privacy',
    es: 'Privacidad'
  },
  adminArea: {
    en: 'Admin Area',
    es: 'Área Administrativa'
  },
  driversArea: {
    en: 'Drivers Area',
    es: 'Área de Conductores'
  },
  allRightsReserved: {
    en: 'All rights reserved.',
    es: 'Todos los derechos reservados.'
  },
  langSwitchTooltip: {
    en: 'Switch to Spanish',
    es: 'Cambiar a inglés'
  },
  langChanged: {
    en: 'Language changed to English',
    es: 'Idioma cambiado a español'
  }
};

// Create the context type
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'es',
  setLanguage: () => {},
  t: () => '',
});

// Create a provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  // Initialize language from localStorage on component mount
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language | null;
    if (savedLang && (savedLang === 'es' || savedLang === 'en')) {
      setLanguage(savedLang);
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Create a hook to use the language context
export const useLanguage = () => useContext(LanguageContext);
