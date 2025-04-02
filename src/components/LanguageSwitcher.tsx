import React from 'react';
import { Globe } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    const newLang = language === 'es' ? 'en' : 'es';
    setLanguage(newLang);
    
    // Display a toast with the language change
    toast.success(t('langChanged'));
  };

  return (
    <button 
      onClick={toggleLanguage}
      className={`flex items-center gap-2 px-3 py-2 rounded-full bg-secondary text-sm font-medium transition-all hover:bg-secondary/80 active:scale-[0.98] ${className}`}
      aria-label={t('langSwitchTooltip')}
    >
      <Globe size={16} />
      <span>{language === 'es' ? 'EN' : 'ES'}</span>
    </button>
  );
};

export default LanguageSwitcher;
