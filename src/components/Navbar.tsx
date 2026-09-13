import React from 'react';
import { Coffee, BookUser, BarChart3, Package, Settings, AlertTriangle, Volume2, VolumeX, Languages } from 'lucide-react';
import { useStall } from '../context/StallContext';
import { playSoundboxChime } from '../utils/soundAndUpi';

export type TabType = 'pos' | 'khata' | 'sales' | 'inventory' | 'settings';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { settings, updateSettings, lowStockItems, customers, language, setLanguage, t } = useStall();

  const totalOutstandingUdhar = customers.reduce((sum, c) => sum + Math.max(0, c.currentBalance), 0);

  const toggleSound = () => {
    updateSettings({ soundAlerts: !settings.soundAlerts });
  };

  const handleTestSoundbox = () => {
    playSoundboxChime(50, language);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'hi' ? 'en' : 'hi');
  };

  return (
    <header className="w-full min-w-full sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      {/* Top Identity Bar */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3 min-w-0">
        {/* Brand & Logo */}
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer min-w-0 shrink"
          onClick={() => onSelectTab('settings')}
          title="Edit Stall Profile & Logo in Settings"
        >
          {settings.logoUrl ? (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-0.5 flex items-center justify-center overflow-hidden border border-amber-400/50 shadow-md shrink-0">
              <img
                src={settings.logoUrl}
                alt={settings.stallName}
                className="w-full h-full object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-900/30 shrink-0">
              <Coffee className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-extrabold text-sm sm:text-lg tracking-tight text-white leading-tight truncate">
                {settings.stallName || t('appTitle')}
              </h1>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30 shrink-0">
                {t('tapriPosBadge')}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-stone-400 truncate max-w-[130px] sm:max-w-sm mt-0.5">
              {settings.stallTagline || t('appTagline')}
            </p>
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* 1-Tap Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title={language === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span className={language === 'hi' ? 'text-amber-300 font-extrabold' : 'text-stone-400'}>हिंदी</span>
            <span className="text-stone-600 text-[10px]">/</span>
            <span className={language === 'en' ? 'text-amber-300 font-extrabold' : 'text-stone-400'}>EN</span>
          </button>

          {/* Low stock indicator */}
          {lowStockItems.length > 0 && (
            <button
              onClick={() => onSelectTab('inventory')}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
              title={`${lowStockItems.length} items low on stock`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span className="hidden sm:inline">{t('stockAlert')}:</span>
              <span>{lowStockItems.length}</span>
            </button>
          )}

          {/* Soundbox Test Chime */}
          <button
            onClick={handleTestSoundbox}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 text-xs font-medium transition-colors cursor-pointer"
            title="Test Soundbox Voice & Chime"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('soundbox')}</span>
          </button>

          {/* Mute/Unmute */}
          <button
            onClick={toggleSound}
            className={`p-1.5 sm:p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
              settings.soundAlerts
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-stone-800 border-stone-700 text-stone-400'
            }`}
            title={settings.soundAlerts ? t('soundboxOn') : t('soundboxOff')}
            aria-label="Toggle Sound"
          >
            {settings.soundAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Navigation tabs - Completely hidden scrollbar */}
      <div
        className="w-full border-t border-stone-800/80 bg-stone-950/60 backdrop-blur-xs overflow-x-auto scrollbar-none no-scrollbar select-none touch-pan-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-start sm:justify-center gap-1 sm:gap-2 w-max sm:w-auto min-w-full sm:min-w-0">
          {/* POS Tab */}
          <button
            onClick={() => onSelectTab('pos')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'pos'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-white/5'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>{t('tabPos')}</span>
          </button>

          {/* Khata Tab */}
          <button
            onClick={() => onSelectTab('khata')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'khata'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-white/5'
            }`}
          >
            <BookUser className="w-4 h-4" />
            <span>{t('tabKhata')}</span>
            {totalOutstandingUdhar > 0 && (
              <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-stone-950">
                ₹{totalOutstandingUdhar}
              </span>
            )}
          </button>

          {/* Daily Sales */}
          <button
            onClick={() => onSelectTab('sales')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'sales'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{t('tabSales')}</span>
          </button>

          {/* Inventory Tab */}
          <button
            onClick={() => onSelectTab('inventory')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'inventory'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-white/5'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t('tabInventory')}</span>
            {lowStockItems.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>

          {/* Settings Tab */}
          <button
            onClick={() => onSelectTab('settings')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'settings'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{t('tabSettings')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

