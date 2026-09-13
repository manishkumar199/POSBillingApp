import React, { useState } from 'react';
import { X, PackagePlus, CheckCircle2 } from 'lucide-react';
import { InventoryItem } from '../types';
import { useStall } from '../context/StallContext';
import { formatINR } from '../utils/soundAndUpi';

interface RestockModalProps {
  item: InventoryItem;
  onClose: () => void;
}

export const RestockModal: React.FC<RestockModalProps> = ({ item, onClose }) => {
  const { restockItem, language, t } = useStall();

  const [quantity, setQuantity] = useState<number | ''>('');
  const [totalCost, setTotalCost] = useState<number | ''>('');
  const [supplier, setSupplier] = useState(language === 'hi' ? 'लोकल डेयरी / किराना' : 'Local Dairy / Kirana');

  const handleQtyChange = (val: number | '') => {
    setQuantity(val);
    if (typeof val === 'number' && val > 0 && item.costPerUnit) {
      setTotalCost(Math.round(val * item.costPerUnit));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) return;

    restockItem(
      item.id,
      Number(quantity),
      Number(totalCost) || 0,
      supplier.trim() || 'Local Vendor'
    );
    onClose();
  };

  const displayName = language === 'hi' && item.localName ? item.localName : item.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden p-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                {language === 'hi' ? 'स्टॉक भरें (माल आया)' : 'Restock Inward'}
              </h3>
              <p className="text-xs text-stone-500">{displayName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status preview */}
        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex justify-between text-xs">
          <div>
            <span className="text-stone-500 block">{t('currentStockLabel')}:</span>
            <span className="font-extrabold text-stone-900 text-sm">
              {item.currentStock} {item.unit}
            </span>
          </div>
          <div className="text-right">
            <span className="text-stone-500 block">{t('minAlertLabel')}:</span>
            <span className="font-semibold text-stone-700">
              {item.minThreshold} {item.unit}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Quantity Added */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              {t('quantityBought')} ({item.unit}) *
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder={`e.g. 5 ${item.unit}`}
              value={quantity}
              onChange={(e) => handleQtyChange(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-base font-bold text-stone-900 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Total Cost */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              {t('totalCostSpent')}
            </label>
            <input
              type="number"
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Supplier Name */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              {t('supplierNameLabel')}
            </label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Preview of new stock */}
          {typeof quantity === 'number' && quantity > 0 && (
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex justify-between text-emerald-900">
              <span>{language === 'hi' ? 'नया स्टॉक स्तर:' : 'New Stock Level:'}</span>
              <span className="font-extrabold">
                {+(item.currentStock + quantity).toFixed(2)} {item.unit}
              </span>
            </div>
          )}

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('confirmRestockBtn')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
