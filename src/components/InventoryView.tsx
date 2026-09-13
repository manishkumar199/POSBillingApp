import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  PackagePlus,
  History,
  CheckCircle2,
  Plus,
  Search,
  Check,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { useStall } from '../context/StallContext';
import { InventoryItem, InventoryCategory } from '../types';
import { formatINR } from '../utils/soundAndUpi';
import { RestockModal } from './RestockModal';

export const InventoryView: React.FC = () => {
  const {
    inventory,
    lowStockItems,
    restockLogs,
    addInventoryItem,
    settings,
    updateSettings,
    language,
    t,
  } = useStall();

  const [activeTab, setActiveTab] = useState<'stock' | 'logs'>('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedItemForRestock, setSelectedItemForRestock] = useState<InventoryItem | null>(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  // New inventory item form
  const [newItemName, setNewItemName] = useState('');
  const [newItemLocal, setNewItemLocal] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<InventoryCategory>('dairy');
  const [newItemStock, setNewItemStock] = useState<number>(10);
  const [newItemUnit, setNewItemUnit] = useState<'L' | 'kg' | 'g' | 'pcs'>('kg');
  const [newItemMin, setNewItemMin] = useState<number>(2);
  const [newItemCost, setNewItemCost] = useState<number>(50);

  const totalStockValue = inventory.reduce((sum, item) => sum + item.currentStock * item.costPerUnit, 0);

  const filteredInventory = inventory.filter((item) => {
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.localName && item.localName.includes(searchQuery));
    return matchesCat && matchesSearch;
  });

  const handleCreateInventoryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    addInventoryItem({
      name: newItemName.trim(),
      localName: newItemLocal.trim() || undefined,
      category: newItemCategory,
      currentStock: Number(newItemStock) || 0,
      unit: newItemUnit,
      minThreshold: Number(newItemMin) || 1,
      costPerUnit: Number(newItemCost) || 0,
    });

    setNewItemName('');
    setNewItemLocal('');
    setNewItemStock(10);
    setNewItemMin(2);
    setNewItemCost(50);
    setShowAddItemModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-6 w-full min-w-0">
      {/* Top Banner Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Stock Value */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-stone-500">
              {t('totalInventoryValue')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
            {formatINR(totalStockValue)}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {inventory.length} {language === 'hi' ? 'कच्चा माल व सामान दर्ज' : 'ingredients & items tracked'}
          </p>
        </div>

        {/* Low Stock Warning */}
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs flex flex-col justify-between ${
          lowStockItems.length > 0 ? 'bg-red-50/70 border-red-200' : 'bg-white border-stone-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-stone-500">
              {t('lowStockItemsCount')}
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              lowStockItems.length > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {lowStockItems.length > 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black mt-2 ${
            lowStockItems.length > 0 ? 'text-red-700' : 'text-emerald-700'
          }`}>
            {lowStockItems.length} {language === 'hi' ? 'आइटम खत्म होने पर' : 'Items Low'}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {lowStockItems.length > 0
              ? lowStockItems.map((i) => (language === 'hi' && i.localName ? i.localName : i.name.split(' ')[0])).join(', ')
              : (language === 'hi' ? 'सभी कच्चा माल भरपूर उपलब्ध है' : 'All raw materials well-stocked for chai rush')}
          </p>
        </div>

        {/* Auto Deduct on Sale Toggle Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-stone-500">
              {t('autoDeductToggle')}
            </span>
            <button
              onClick={() => updateSettings({ autoDeductInventory: !settings.autoDeductInventory })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                settings.autoDeductInventory ? 'bg-emerald-600' : 'bg-stone-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.autoDeductInventory ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <div className="mt-2">
            <span className="font-extrabold text-stone-900 text-base">
              {settings.autoDeductInventory ? (language === 'hi' ? 'हर बिक्री पर चालू' : 'Enabled on Every Sale') : (language === 'hi' ? 'मैन्युअल' : 'Manual Tracking')}
            </span>
            <p className="text-xs text-stone-500 mt-0.5">
              {t('autoDeductDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between min-w-0">
        {/* Tab switch: Current Stock vs Restock Logs */}
        <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'stock' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{t('tabStockList')} ({inventory.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'logs' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{t('tabRestockHistory')} ({restockLogs.length})</span>
          </button>
        </div>

        {/* Search and Add Item Button */}
        {activeTab === 'stock' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'hi' ? 'दूध, पत्ती, कप खोजें...' : 'Search milk, tea, cups...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <button
              onClick={() => setShowAddItemModal(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addNewRawMaterialBtn')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Stock Items Grid */}
      {activeTab === 'stock' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInventory.map((item) => {
            const isLow = item.currentStock <= item.minThreshold;
            const isCritical = item.currentStock <= item.minThreshold * 0.5;
            const healthRatio = Math.min(100, Math.round((item.currentStock / (item.minThreshold * 2.5)) * 100));
            const displayName = language === 'hi' && item.localName ? item.localName : item.name;
            const subName = language === 'hi' && item.localName ? item.name : item.localName;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between bg-white shadow-xs hover:shadow-md ${
                  isCritical
                    ? 'border-red-300 ring-1 ring-red-400/30'
                    : isLow
                    ? 'border-amber-300'
                    : 'border-stone-200'
                }`}
              >
                <div>
                  {/* Top info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-stone-900 leading-snug">{displayName}</h3>
                      {subName && (
                        <p className="text-xs text-stone-500 font-medium">{subName}</p>
                      )}
                    </div>
                    {isLow ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {language === 'hi' ? 'स्टॉक खत्म' : 'Low Stock'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        {language === 'hi' ? 'उपलब्ध' : 'In Stock'}
                      </span>
                    )}
                  </div>

                  {/* Stock Count display */}
                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-stone-900">
                        {item.currentStock}
                      </span>
                      <span className="text-xs font-bold text-stone-500 ml-1">{item.unit}</span>
                    </div>
                    <div className="text-right text-[11px] text-stone-400 font-medium">
                      {t('minAlertLabel')}: {item.minThreshold} {item.unit}
                    </div>
                  </div>

                  {/* Gauge bar */}
                  <div className="w-full bg-stone-100 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCritical ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(5, healthRatio)}%` }}
                    />
                  </div>
                </div>

                {/* Cost & Restock Action */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-500 font-medium">
                    {language === 'hi' ? 'भाव' : 'Rate'}: ~{formatINR(item.costPerUnit)}/{item.unit}
                  </span>
                  <button
                    onClick={() => setSelectedItemForRestock(item)}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1 border border-amber-200 transition-colors cursor-pointer"
                  >
                    <PackagePlus className="w-3.5 h-3.5 text-amber-700" />
                    <span>{t('restockBtn')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Restock History Purchase Log */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-stone-50 border-b border-stone-100 font-bold text-sm text-stone-900">
            {t('tabRestockHistory')}
          </div>

          {restockLogs.length === 0 ? (
            <div className="py-16 text-center text-stone-400 text-sm">
              {language === 'hi'
                ? 'अभी तक कोई खरीद दर्ज नहीं है। ऊपर किसी सामान पर "स्टॉक भरें" दबाकर नया माल दर्ज करें।'
                : 'No restock purchases logged yet. Tap "Restock Inward" on any item above to record incoming supplies.'}
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {restockLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-stone-900 text-sm">{log.itemName}</span>
                    <p className="text-stone-500 mt-0.5">
                      {language === 'hi' ? 'सप्लायर' : 'Vendor'}: <span className="font-medium text-stone-700">{log.supplierName}</span> •{' '}
                      {new Date(log.timestamp).toLocaleDateString()} at{' '}
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-sm text-emerald-800 block">
                      +{log.quantityAdded} {log.unit}
                    </span>
                    <span className="text-stone-500 font-medium">
                      {language === 'hi' ? 'लागत' : 'Cost'}: {formatINR(log.totalCost)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Restock Modal */}
      {selectedItemForRestock && (
        <RestockModal
          item={selectedItemForRestock}
          onClose={() => setSelectedItemForRestock(null)}
        />
      )}

      {/* Add New Stock Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-base">{t('addNewRawMaterialBtn')}</h3>
              <button onClick={() => setShowAddItemModal(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInventoryItem} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  {language === 'hi' ? 'सामान का नाम *' : 'Item Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'hi' ? 'जैसे: भैंस का दूध, इलायची, चाय पत्ती' : 'e.g. Buffalo Milk, Elaichi, Tea Bags'}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  {language === 'hi' ? 'हिंदी / बोलचाल का नाम' : 'Hindi / Local Name'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. ताज़ा दूध, इलायची"
                  value={newItemLocal}
                  onChange={(e) => setNewItemLocal(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {language === 'hi' ? 'इकाई (Unit)' : 'Unit'}
                  </label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value as 'L' | 'kg' | 'g' | 'pcs')}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-hidden"
                  >
                    <option value="L">Litres (L)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="pcs">Pieces (pcs)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {language === 'hi' ? 'शुरुआती मात्रा' : 'Starting Stock'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">{t('minAlertLabel')}</label>
                  <input
                    type="number"
                    step="any"
                    value={newItemMin}
                    onChange={(e) => setNewItemMin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">{t('costPerUnitLabel')}</label>
                  <input
                    type="number"
                    step="any"
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {language === 'hi' ? 'स्टॉक सुरक्षित करें' : 'Save Stock Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
