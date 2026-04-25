import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  lang?: 'ar' | 'en';
  setLang?: (lang: 'ar' | 'en') => void;
}

export const LanguageSwitcher = ({ lang, setLang }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();

  const activeLang = (lang ?? i18n.resolvedLanguage ?? i18n.language).startsWith('en') ? 'en' : 'ar';

  const changeLanguage = async (targetLang: 'ar' | 'en') => {
    if (targetLang === activeLang) {
      return;
    }

    setLang?.(targetLang);
    await i18n.changeLanguage(targetLang);

    const rtl = targetLang === 'ar';
    document.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = targetLang;
    localStorage.setItem('dashboard-lang', targetLang);
  };

  const toggleSwitch = () => {
    const newLang = activeLang === 'ar' ? 'en' : 'ar';
    void changeLanguage(newLang);
  };

  const switchTo = (target: 'ar' | 'en') => {
    void changeLanguage(target);
  };

  const isArabic = activeLang === 'ar';

  return (
    <div className="flex items-center gap-3 select-none" dir="ltr">
      
      {/* English Label */}
      <button 
        onClick={() => switchTo('en')}
        className={`text-sm font-bold transition-colors duration-300 ${
          !isArabic ? 'text-[#2596be] scale-110' : 'text-gray-400 hover:text-gray-500'
        }`}
      >
        EN
      </button>

      {/* The Switch Track */}
      <div 
        onClick={toggleSwitch}
        className={`
          relative w-14 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 shadow-inner
          ${isArabic ? 'bg-[#2596be]' : 'bg-gray-300'} 
        `}
      >
        {/* The Sliding Knob */}
        <motion.div
          className="w-5 h-5 bg-white rounded-full shadow-md"
          layout
          initial={false}
          animate={{
            x: isArabic ? 28 : 0 // Adjusted for w-14 width
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />
      </div>

      {/* Arabic Label */}
      <button 
        onClick={() => switchTo('ar')}
        className={`text-sm font-bold transition-colors duration-300 ${
          isArabic ? 'text-[#2596be] scale-110' : 'text-gray-400 hover:text-gray-500'
        }`}
      >
        AR
      </button>
    </div>
  );
};
