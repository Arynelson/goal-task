import { Switch } from '@/components/ui/switch';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const LanguageToggle = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = async (checked: boolean) => {
    const newLanguage = checked ? 'en' : 'pt';
    try {
      await setLanguage(newLanguage);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <Globe className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="font-medium text-card-foreground">{t('language')}</p>
          <p className="text-xs text-muted-foreground">{t('language-preference')}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm ${language === 'pt' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
          PT
        </span>
        <Switch
          checked={language === 'en'}
          onCheckedChange={handleLanguageChange}
        />
        <span className={`text-sm ${language === 'en' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
          EN
        </span>
      </div>
    </div>
  );
};

export default LanguageToggle;