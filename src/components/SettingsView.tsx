import React, { useState, useRef } from 'react';
import {
  Settings,
  Store,
  QrCode,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Edit2,
  Save,
  Coffee,
  Image as ImageIcon,
  Sparkles,
  Cookie,
  Flame,
  Leaf,
  Layers,
} from 'lucide-react';
import { useStall } from '../context/StallContext';
import { MenuItem, ItemCategory } from '../types';
import { formatINR, playSoundboxChime } from '../utils/soundAndUpi';

const PRESET_LOGOS = [
  { name: 'Chai Glass', url: '/icon-192.svg' },
  { name: 'Hot Cup', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23b45309" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12Z"/><path d="M6 2v2"/><path d="M17 11h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/></svg>' },
  { name: 'Kadak Flame', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="%23f59e0b" stroke="%23b45309" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>' },
  { name: 'Clay Kulhad', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="%2378350f" stroke="%23d97706" stroke-width="1.5"><path d="M6 7 L8 19 C8.2 20 9 21 10 21 L14 21 C15 21 15.8 20 16 19 L18 7 Z"/></svg>' },
];

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    menu,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    exportDatabase,
    importDatabase,
    resetToDefaults,
    language,
    setLanguage,
    t,
  } = useStall();

  // Settings form local state
  const [stallName, setStallName] = useState(settings.stallName);
  const [stallTagline, setStallTagline] = useState(settings.stallTagline);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [phone, setPhone] = useState(settings.phone);
  const [upiId, setUpiId] = useState(settings.upiId);
  const [upiMerchantName, setUpiMerchantName] = useState(settings.upiMerchantName);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);

  // Menu item add/edit state
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [menuFilterCategory, setMenuFilterCategory] = useState<string>('all');
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [menuName, setMenuName] = useState('');
  const [menuLocalName, setMenuLocalName] = useState('');
  const [menuPrice, setMenuPrice] = useState<number>(15);
  const [menuCategory, setMenuCategory] = useState<ItemCategory>('tea');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      stallName: stallName.trim(),
      stallTagline: stallTagline.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      upiId: upiId.trim(),
      upiMerchantName: upiMerchantName.trim() || stallName.trim(),
      logoUrl: logoUrl.trim(),
    });

    setSavedSettingsSuccess(true);
    setTimeout(() => setSavedSettingsSuccess(false), 2500);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      alert(language === 'hi' ? 'कृपया 2.5MB से छोटी फोटो अपलोड करें' : 'Please upload an image smaller than 2.5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setLogoUrl(dataUrl);
        updateSettings({ logoUrl: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddOrEditMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuName.trim()) return;

    if (editingMenuItem) {
      updateMenuItem(editingMenuItem.id, {
        name: menuName.trim(),
        localName: menuLocalName.trim() || undefined,
        price: Number(menuPrice),
        category: menuCategory,
      });
      setEditingMenuItem(null);
    } else {
      addMenuItem({
        name: menuName.trim(),
        localName: menuLocalName.trim() || undefined,
        price: Number(menuPrice),
        category: menuCategory,
        iconName: 'Coffee',
        isAvailable: true,
      });
    }

    setMenuName('');
    setMenuLocalName('');
    setMenuPrice(15);
    setMenuCategory('tea');
    setShowAddMenuModal(false);
  };

  const startEditMenu = (item: MenuItem) => {
    setEditingMenuItem(item);
    setMenuName(item.name);
    setMenuLocalName(item.localName || '');
    setMenuPrice(item.price);
    setMenuCategory(item.category);
    setShowAddMenuModal(true);
  };

  const handleExport = () => {
    const jsonStr = exportDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chaikhata_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDatabase(content);
        if (success) {
          alert(language === 'hi' ? 'डेटा बैकअप सफलतापूर्वक लोड हो गया!' : 'Database restored successfully from backup!');
          window.location.reload();
        } else {
          alert(language === 'hi' ? 'गलत बैकअप फ़ाइल।' : 'Invalid backup JSON file.');
        }
      }
    };
    reader.readAsText(file);
  };

  const filteredMenuItems = menuFilterCategory === 'all'
    ? menu
    : menu.filter((m) => m.category === menuFilterCategory);

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6 space-y-6 w-full min-w-0">
      {/* App Language Switcher Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
            <span>🌐</span>
            <span>{t('appLanguageTitle')}</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            {t('appLanguageSubtitle')}
          </p>
        </div>
        <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setLanguage('hi')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              language === 'hi'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>🇮🇳</span>
            <span>हिंदी (बोलचाल)</span>
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              language === 'en'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>🇬🇧</span>
            <span>English</span>
          </button>
        </div>
      </div>

      {/* Stall Profile & UPI Settings Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-stone-950">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base">{t('stallProfileTitle')}</h2>
              <p className="text-xs text-stone-400">{t('settingsSubtitle')}</p>
            </div>
          </div>
          {savedSettingsSuccess && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {language === 'hi' ? 'सुरक्षित हुआ!' : 'Saved!'}
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-6">
          {/* Logo Upload Section */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-extrabold text-stone-900 block">
                  {t('stallProfileTitle')}
                </label>
                <p className="text-xs text-stone-500">
                  {language === 'hi'
                    ? 'अपनी दुकान की फोटो, लोगो लगाएं या तैयार देसी टपरी बैज चुनें'
                    : 'Upload your shop photo, logo, or choose a traditional Indian tapri emblem'}
                </p>
              </div>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setLogoUrl('');
                    updateSettings({ logoUrl: '' });
                  }}
                  className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                >
                  {t('removeLogoBtn')}
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
              {/* Logo Preview */}
              <div className="w-20 h-20 rounded-2xl bg-white border-2 border-dashed border-amber-300 flex items-center justify-center p-1 overflow-hidden shadow-xs shrink-0">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Stall Logo Preview"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-center text-stone-400">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1 text-amber-500/60" />
                    <span className="text-[10px] font-bold">
                      {language === 'hi' ? 'कोई लोगो नहीं' : 'No Logo'}
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Input & Presets */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('uploadLogoBtn')}</span>
                  </button>

                  <span className="text-xs text-stone-400">{t('tapriBadgesTitle')}</span>
                  {PRESET_LOGOS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setLogoUrl(preset.url);
                        updateSettings({ logoUrl: preset.url });
                      }}
                      className="px-2.5 py-1 bg-white border border-stone-200 hover:border-amber-400 rounded-lg text-xs font-semibold text-stone-700 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <img src={preset.url} alt={preset.name} className="w-4 h-4 object-contain" />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-stone-500">
                  {language === 'hi'
                    ? 'समर्थित फॉर्मेट: PNG, JPG, WebP, SVG। आपके फोन की सुरक्षित मेमोरी में सेव रहेगा।'
                    : 'Supported formats: PNG, JPG, WebP, SVG. Stored securely in your device browser memory.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">{t('stallName')}</label>
              <input
                type="text"
                required
                value={stallName}
                onChange={(e) => setStallName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">{t('stallTagline')}</label>
              <input
                type="text"
                value={stallTagline}
                onChange={(e) => setStallTagline(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">{t('ownerName')}</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">{t('contactNumber')}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {/* UPI Settings Highlight Box */}
          <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200 space-y-3">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
              <QrCode className="w-4 h-4 text-indigo-700" />
              <span>{t('upiSettingsTitle')}</span>
            </div>
            <p className="text-xs text-indigo-800/80">
              {t('upiSettingsSubtitle')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-indigo-950 block mb-1">
                  {t('upiIdLabel')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210@paytm, name@okhdfcbank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-indigo-950 block mb-1">
                  {t('upiMerchantNameLabel')}
                </label>
                <input
                  type="text"
                  placeholder={language === 'hi' ? 'दुकानदार का नाम' : "Appears on customer's GPay/PhonePe screen"}
                  value={upiMerchantName}
                  onChange={(e) => setUpiMerchantName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
              <div>
                <span className="text-xs font-bold text-stone-900 block">
                  {t('autoDeductToggle')}
                </span>
                <span className="text-[11px] text-stone-500">
                  {t('autoDeductDesc')}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateSettings({ autoDeductInventory: !settings.autoDeductInventory })
                }
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.autoDeductInventory ? 'bg-amber-600' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.autoDeductInventory ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
              <div>
                <span className="text-xs font-bold text-stone-900 block">
                  {t('soundboxToggle')}
                </span>
                <span className="text-[11px] text-stone-500">
                  {t('soundboxDesc')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => playSoundboxChime(30)}
                  className="px-2.5 py-1 text-xs font-bold text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 cursor-pointer"
                >
                  {t('testVoiceBtn')}
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ soundAlerts: !settings.soundAlerts })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    settings.soundAlerts ? 'bg-amber-600' : 'bg-stone-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.soundAlerts ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{t('saveSettingsBtn')}</span>
          </button>
        </form>
      </div>

      {/* Menu Management Section */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-stone-900 text-base">{t('menuManagementTitle')}</h3>
            <p className="text-xs text-stone-500">{t('menuManagementSubtitle')}</p>
          </div>
          <button
            onClick={() => {
              setEditingMenuItem(null);
              setMenuName('');
              setMenuLocalName('');
              setMenuPrice(10);
              setMenuCategory('biscuits');
              setShowAddMenuModal(true);
            }}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addNewMenuItemBtn')}</span>
          </button>
        </div>

        {/* Filter by Category */}
        <div
          className="w-full min-w-0 px-4 py-3 border-b border-stone-100 flex gap-1.5 overflow-x-auto scrollbar-none no-scrollbar select-none touch-pan-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {[
            { id: 'all', label: language === 'hi' ? 'सब सामान' : 'All' },
            { id: 'tea', label: language === 'hi' ? 'चाय ☕' : 'Chai ☕' },
            { id: 'biscuits', label: language === 'hi' ? 'बिस्कुट 🍪' : 'Biscuits 🍪' },
            { id: 'candies', label: language === 'hi' ? 'टॉफी 🍬' : 'Candies 🍬' },
            { id: 'tobacco', label: language === 'hi' ? 'सिगरेट 🚬' : 'Cigarettes 🚬' },
            { id: 'pan_masala', label: language === 'hi' ? 'पान मसाला 🍃' : 'Pan Masala 🍃' },
            { id: 'bakery', label: language === 'hi' ? 'बेकरी 🥪' : 'Bakery 🥪' },
            { id: 'snacks', label: language === 'hi' ? 'नाश्ता / समोसा 🥟' : 'Snacks 🥟' },
            { id: 'beverages', label: language === 'hi' ? 'ठंडा / ड्रिंक्स 🥤' : 'Drinks 🥤' },
            { id: 'packaged', label: language === 'hi' ? 'पैक्ड सामान 📦' : 'Packaged 📦' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setMenuFilterCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                menuFilterCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Menu list */}
        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredMenuItems.map((item) => {
            const displayName = language === 'hi' && item.localName ? item.localName : item.name;
            const subName = language === 'hi' && item.localName ? item.name : item.localName;

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-white flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{displayName}</span>
                    <span className="text-[10px] uppercase font-bold text-stone-500 bg-stone-200 px-1.5 py-0.2 rounded">
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>
                  {subName && (
                    <p className="text-xs text-stone-500 font-medium">{subName}</p>
                  )}
                  <span className="text-sm font-extrabold text-amber-900 mt-1 block">
                    {formatINR(item.price)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEditMenu(item)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200 cursor-pointer"
                    title={language === 'hi' ? 'बदलाव करें' : 'Edit Item'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      const confirmMsg = language === 'hi'
                        ? `क्या आप "${displayName}" को मेन्यू से हटाना चाहते हैं?`
                        : `Delete ${item.name} from menu?`;
                      if (window.confirm(confirmMsg)) {
                        deleteMenuItem(item.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                    title={language === 'hi' ? 'हटाएं' : 'Delete Item'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Backup & System Reset */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
        <div>
          <h3 className="font-bold text-stone-900 text-sm">{t('backupTitle')}</h3>
          <p className="text-xs text-stone-500">
            {t('backupSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 sm:gap-3 items-center">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-stone-600" />
            <span>{t('downloadBackup')}</span>
          </button>

          <label className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-stone-600" />
            <span>{t('restoreBackup')}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              const confirmReset = language === 'hi'
                ? 'क्या आप पूरा डेटा रीसेट करके शुरुआती डेमो स्थिति में लाना चाहते हैं?'
                : 'Are you sure you want to reset all data back to factory defaults?';
              if (window.confirm(confirmReset)) {
                resetToDefaults();
              }
            }}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs rounded-xl flex items-center gap-2 sm:ml-auto cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('resetDemoData')}</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Menu Item Modal */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base">
                {editingMenuItem
                  ? (language === 'hi' ? 'सामान का रेट बदलें' : 'Edit Product Rate')
                  : (language === 'hi' ? 'नया सामान मेन्यू में जोड़ें' : 'Add Counter Product')}
              </h3>
              <button
                onClick={() => setShowAddMenuModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddOrEditMenuItem} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  {language === 'hi' ? 'सामान का नाम (अंग्रेज़ी में) *' : 'Item Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parle-G, Gold Flake, Vimal, Pulse Candy"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  {language === 'hi' ? 'हिंदी नाम (बोलचाल में)' : 'Hindi / Local Name'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. पारले-जी, विमल पान मसाला, गोल्ड फ्लेक"
                  value={menuLocalName}
                  onChange={(e) => setMenuLocalName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {language === 'hi' ? 'बिक्री मूल्य (₹) *' : 'Price (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={0.5}
                    step={0.5}
                    value={menuPrice}
                    onChange={(e) => setMenuPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {language === 'hi' ? 'कैटेगरी / प्रकार' : 'Category'}
                  </label>
                  <select
                    value={menuCategory}
                    onChange={(e) => setMenuCategory(e.target.value as ItemCategory)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-hidden"
                  >
                    <option value="tea">{language === 'hi' ? 'चाय ☕' : 'Chai ☕'}</option>
                    <option value="biscuits">{language === 'hi' ? 'बिस्कुट व रस्क 🍪' : 'Biscuits & Rusk 🍪'}</option>
                    <option value="candies">{language === 'hi' ? 'टॉफी व कैंडी 🍬' : 'Candies & Toffees 🍬'}</option>
                    <option value="pan_masala">{language === 'hi' ? 'पान मसाला 🍃' : 'Pan Masala 🍃'}</option>
                    <option value="tobacco">{language === 'hi' ? 'सिगरेट व माचिस 🚬' : 'Cigarettes & Matches 🚬'}</option>
                    <option value="bakery">{language === 'hi' ? 'बेकरी व बन मस्का 🥪' : 'Bakery & Bun Maska 🥪'}</option>
                    <option value="snacks">{language === 'hi' ? 'समोसा व नाश्ता 🥟' : 'Samosa & Snacks 🥟'}</option>
                    <option value="coffee">{language === 'hi' ? 'कॉफी ☕' : 'Coffee ☕'}</option>
                    <option value="beverages">{language === 'hi' ? 'कोल्ड ड्रिंक्स 🥤' : 'Cold Drinks 🥤'}</option>
                    <option value="packaged">{language === 'hi' ? 'पैक्ड आइटम 📦' : 'Packaged Items 📦'}</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMenuModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingMenuItem
                    ? (language === 'hi' ? 'रेट बदलें' : 'Update Item')
                    : (language === 'hi' ? 'मेन्यू में जोड़ें' : 'Save to Menu')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
