import React, { useState } from 'react';
import {
  Coffee,
  Plus,
  Minus,
  Trash2,
  QrCode,
  Banknote,
  BookUser,
  CheckCircle2,
  Share2,
  Printer,
  Sparkles,
  Flame,
  Search,
  UserPlus,
  AlertCircle,
  X,
} from 'lucide-react';
import { useStall } from '../context/StallContext';
import { MenuItem, OrderItem, SaleOrder, PaymentMethod, CustomerKhata } from '../types';
import { formatINR, playTapSound } from '../utils/soundAndUpi';
import { UpiPaymentModal } from './UpiPaymentModal';

export const PosBillingView: React.FC = () => {
  const { menu, customers, addCustomer, createSale, settings, language, t } = useStall();

  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment checkout state
  const [activePaymentModal, setActivePaymentModal] = useState<'none' | 'cash' | 'upi' | 'udhar'>('none');
  const [cashTendered, setCashTendered] = useState<number | ''>('');
  
  // Udhar customer selection
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerTag, setNewCustomerTag] = useState('');

  // Completed sale receipt state
  const [completedOrder, setCompletedOrder] = useState<SaleOrder | null>(null);

  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredMenu = menu.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.localName && item.localName.includes(searchQuery));
    return matchesCat && matchesSearch;
  });

  const handleAddToCart = (item: MenuItem) => {
    playTapSound();
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.id
            ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price }
            : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          subtotal: item.price,
        },
      ];
    });
  };

  const handleUpdateQuantity = (menuItemId: string, delta: number) => {
    playTapSound();
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.menuItemId === menuItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0
              ? { ...item, quantity: newQty, subtotal: newQty * item.price }
              : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[];
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Cash Checkout
  const handleCashCheckout = () => {
    const tendered = typeof cashTendered === 'number' ? cashTendered : cartTotal;
    const changeDue = Math.max(0, tendered - cartTotal);

    const order = createSale({
      items: cart,
      paymentMethod: 'cash',
      cashReceived: tendered,
      changeDue,
    });

    setCompletedOrder(order);
    setCart([]);
    setActivePaymentModal('none');
    setCashTendered('');
  };

  // UPI Checkout Completion
  const handleUpiSuccess = (txnRef: string) => {
    const order = createSale({
      items: cart,
      paymentMethod: 'upi',
      upiTransactionRef: txnRef,
    });

    setCompletedOrder(order);
    setCart([]);
    setActivePaymentModal('none');
  };

  // Udhar Checkout
  const handleUdharCheckout = () => {
    if (!selectedCustomerId) return;
    const order = createSale({
      items: cart,
      paymentMethod: 'udhar',
      customerId: selectedCustomerId,
    });

    setCompletedOrder(order);
    setCart([]);
    setActivePaymentModal('none');
    setSelectedCustomerId('');
  };

  // Create new customer on the fly for Udhar
  const handleSaveNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) return;

    const created = addCustomer({
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim(),
      workplaceOrTag: newCustomerTag.trim() || undefined,
      creditLimit: 1500,
    });

    setSelectedCustomerId(created.id);
    setIsAddingNewCustomer(false);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewCustomerTag('');
  };

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch) ||
      (c.workplaceOrTag && c.workplaceOrTag.toLowerCase().includes(customerSearch.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-w-0">
      {/* Left Column: Menu Items Catalog (lg:col-span-7 or 8) */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4 min-w-0">
        {/* Search & Category Filter Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 min-w-0">
          {/* Search box */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('searchMenuPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all text-stone-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div
            className="flex gap-1.5 overflow-x-auto scrollbar-none no-scrollbar pb-1 sm:pb-0 select-none touch-pan-x min-w-0 flex-1 sm:max-w-md lg:max-w-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {[
              { id: 'all', label: t('categoryAll') },
              { id: 'tea', label: t('categoryTea') },
              { id: 'biscuits', label: t('categoryBiscuits') },
              { id: 'candies', label: t('categoryCandies') },
              { id: 'tobacco', label: t('categoryTobacco') },
              { id: 'pan_masala', label: t('categoryPanMasala') },
              { id: 'bakery', label: t('categoryBakery') },
              { id: 'snacks', label: t('categorySnacks') },
              { id: 'beverages', label: t('categoryBeverages') },
              { id: 'packaged', label: t('categoryPackaged') },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredMenu.map((item) => {
            const inCartItem = cart.find((c) => c.menuItemId === item.id);
            const primaryTitle = language === 'hi' && item.localName ? item.localName : item.name;
            const secondaryTitle = language === 'hi' && item.localName ? item.name : item.localName;

            return (
              <button
                key={item.id}
                onClick={() => handleAddToCart(item)}
                className={`relative flex flex-col justify-between p-3.5 rounded-2xl border text-left transition-all group active:scale-[0.98] cursor-pointer ${
                  inCartItem
                    ? 'bg-amber-50/80 border-amber-400 shadow-sm shadow-amber-500/10 ring-2 ring-amber-500/30'
                    : 'bg-white border-stone-200 hover:border-amber-300 hover:shadow-md'
                }`}
              >
                {/* Top badges */}
                <div className="flex items-start justify-between w-full">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    {item.category === 'tea' ? <Flame className="w-5 h-5 text-amber-700" /> : <Coffee className="w-5 h-5 text-amber-700" />}
                  </div>
                  {inCartItem && (
                    <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-extrabold flex items-center justify-center shadow-xs">
                      {inCartItem.quantity}
                    </span>
                  )}
                </div>

                {/* Name & Local Name */}
                <div className="mt-3">
                  <h3 className="font-bold text-stone-900 text-sm leading-snug line-clamp-1">
                    {primaryTitle}
                  </h3>
                  {secondaryTitle && (
                    <p className="text-xs text-stone-500 font-medium">{secondaryTitle}</p>
                  )}
                </div>

                {/* Price and Add button */}
                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between w-full">
                  <span className="font-extrabold text-base text-stone-900">
                    {formatINR(item.price)}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-stone-100 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center text-stone-600 transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Cart & Checkout (lg:col-span-5 or 4) */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-lg sticky top-24 flex flex-col overflow-hidden">
          {/* Cart Header */}
          <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                {cartItemCount}
              </div>
              <div>
                <h2 className="font-bold text-base leading-none">{t('cartTitle')}</h2>
                <span className="text-[11px] text-stone-400 font-medium">{t('tapriPosBadge')}</span>
              </div>
            </div>
            {cart.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-xs text-red-300 hover:text-red-100 flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('clearCart')}</span>
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="p-4 flex-1 max-h-[340px] overflow-y-auto space-y-2.5 divide-y divide-stone-100">
            {cart.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-stone-400">
                <Coffee className="w-12 h-12 stroke-[1.2] text-stone-300 mb-2" />
                <p className="font-semibold text-stone-600 text-sm">{t('cartEmptyTitle')}</p>
                <p className="text-xs text-stone-400 mt-0.5">{t('cartEmptyDesc')}</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.menuItemId} className="pt-2.5 first:pt-0 flex items-center justify-between">
                  <div className="flex-1 pr-2">
                    <p className="text-sm font-bold text-stone-900">{item.name}</p>
                    <p className="text-xs text-stone-500 font-medium">
                      {formatINR(item.price)} × {item.quantity} = <span className="text-stone-800 font-bold">{formatINR(item.subtotal)}</span>
                    </p>
                  </div>

                  {/* Stepper controls */}
                  <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1 border border-stone-200">
                    <button
                      onClick={() => handleUpdateQuantity(item.menuItemId, -1)}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-stone-50 text-stone-700 flex items-center justify-center shadow-2xs font-bold cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center font-extrabold text-xs text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.menuItemId, 1)}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-stone-50 text-stone-700 flex items-center justify-center shadow-2xs font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer & Bill Total */}
          <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-3">
            <div className="flex items-center justify-between text-stone-600 text-sm">
              <span>{t('totalItems')}:</span>
              <span className="font-bold text-stone-900">{cartItemCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold text-stone-900">{t('totalPayable')}:</span>
              <span className="text-2xl font-black text-amber-800">
                {formatINR(cartTotal)}
              </span>
            </div>

            {/* Payment Mode Selection */}
            {cart.length > 0 && (
              <div className="pt-2 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  {language === 'hi' ? 'भुगतान का तरीका चुनें:' : 'Select Payment Method:'}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {/* Cash */}
                  <button
                    onClick={() => setActivePaymentModal('cash')}
                    className="py-3 px-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-900 flex flex-col items-center justify-center gap-1 font-bold text-xs shadow-2xs transition-all cursor-pointer"
                  >
                    <Banknote className="w-5 h-5 text-emerald-700" />
                    <span>{t('payCash')}</span>
                  </button>

                  {/* UPI QR */}
                  <button
                    onClick={() => setActivePaymentModal('upi')}
                    className="py-3 px-2 rounded-xl border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-900 flex flex-col items-center justify-center gap-1 font-bold text-xs shadow-2xs transition-all cursor-pointer"
                  >
                    <QrCode className="w-5 h-5 text-indigo-700" />
                    <span>{t('payUpi')}</span>
                  </button>

                  {/* Udhar / Khata */}
                  <button
                    onClick={() => setActivePaymentModal('udhar')}
                    className="py-3 px-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-900 flex flex-col items-center justify-center gap-1 font-bold text-xs shadow-2xs transition-all cursor-pointer"
                  >
                    <BookUser className="w-5 h-5 text-amber-800" />
                    <span>{t('payUdhar')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cash Payment Drawer/Modal */}
      {activePaymentModal === 'cash' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">{t('cashModalTitle')}</h3>
                  <p className="text-xs text-stone-500">{t('changeDueLabel')}</p>
                </div>
              </div>
              <button onClick={() => setActivePaymentModal('none')} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2">
              <span className="text-xs text-stone-500 uppercase font-semibold">{t('billAmount')}</span>
              <div className="text-3xl font-black text-stone-900">{formatINR(cartTotal)}</div>
            </div>

            {/* Cash Tendered Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">{t('customerGaveAmount')}:</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-stone-500">₹</span>
                <input
                  type="number"
                  placeholder={String(cartTotal)}
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-lg text-stone-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Quick denomination buttons */}
            <div className="flex flex-wrap gap-1.5">
              {[cartTotal, 50, 100, 200, 500].filter((v, idx, arr) => arr.indexOf(v) === idx && v >= cartTotal).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCashTendered(val)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-emerald-50 hover:border-emerald-300 border border-stone-200 rounded-lg text-xs font-bold text-stone-800 cursor-pointer"
                >
                  ₹{val}
                </button>
              ))}
            </div>

            {/* Change Due Display */}
            {typeof cashTendered === 'number' && (
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                cashTendered >= cartTotal
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <span className="text-xs font-bold">
                  {cashTendered >= cartTotal ? t('changeDueLabel') : (language === 'hi' ? 'कम रकम दी:' : 'Short Amount:')}
                </span>
                <span className="font-extrabold text-lg">
                  {formatINR(Math.abs(cashTendered - cartTotal))}
                </span>
              </div>
            )}

            <button
              onClick={handleCashCheckout}
              disabled={typeof cashTendered === 'number' && cashTendered < cartTotal}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{t('completeSaleBtn')}</span>
            </button>
          </div>
        </div>
      )}

      {/* UPI QR Modal */}
      <UpiPaymentModal
        isOpen={activePaymentModal === 'upi'}
        onClose={() => setActivePaymentModal('none')}
        amount={cartTotal}
        upiId={settings.upiId}
        merchantName={settings.upiMerchantName || settings.stallName}
        orderNote={`Chai Stall Bill (${cartItemCount} items)`}
        onPaymentSuccess={handleUpiSuccess}
      />

      {/* Udhar (Khata) Modal */}
      {activePaymentModal === 'udhar' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <BookUser className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">{t('udharModalTitle')}</h3>
                  <p className="text-xs text-stone-500">{t('udharModalSubtitle')}</p>
                </div>
              </div>
              <button onClick={() => setActivePaymentModal('none')} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isAddingNewCustomer ? (
              <>
                {/* Search existing */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={t('searchCustomerPlaceholder')}
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                  <button
                    onClick={() => setIsAddingNewCustomer(true)}
                    className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{t('addNewCustomerBtn')}</span>
                  </button>
                </div>

                {/* Customers list */}
                <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                  {filteredCustomers.length === 0 ? (
                    <div className="text-center py-6 text-stone-400 text-xs">
                      {language === 'hi' ? 'कोई ग्राहक नहीं मिला। नया खाता बनाएं।' : 'No matching customer found. Tap "New Customer" to register them.'}
                    </div>
                  ) : (
                    filteredCustomers.map((c) => {
                      const isSelected = selectedCustomerId === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCustomerId(c.id)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
                              : 'bg-stone-50 border-stone-200 hover:bg-stone-100/70'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-stone-900">{c.name}</span>
                              {c.workplaceOrTag && (
                                <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded">
                                  {c.workplaceOrTag}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-stone-500">{c.phone}</span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-stone-400 block">{t('currentUdhar')}</span>
                            <span className="text-xs font-extrabold text-amber-900">
                              {formatINR(c.currentBalance)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Selected customer preview */}
                {selectedCustomerObj && (
                  <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-stone-600">{t('customerName')}:</span>
                      <span className="font-bold text-stone-900">{selectedCustomerObj.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600">{t('currentBalance')}:</span>
                      <span className="font-bold text-stone-800">{formatINR(selectedCustomerObj.currentBalance)}</span>
                    </div>
                    <div className="flex justify-between border-t border-amber-200/60 pt-1">
                      <span className="font-bold text-stone-900">
                        {language === 'hi' ? 'इस बिल के बाद कुल उधारी:' : 'New Balance after this bill:'}
                      </span>
                      <span className="font-extrabold text-amber-900">
                        {formatINR(selectedCustomerObj.currentBalance + cartTotal)}
                      </span>
                    </div>
                    {selectedCustomerObj.currentBalance + cartTotal > selectedCustomerObj.creditLimit && (
                      <div className="flex items-center gap-1 text-red-600 font-semibold pt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>
                          {language === 'hi'
                            ? `सावधान: उधारी लिमिट (₹${selectedCustomerObj.creditLimit}) से अधिक!`
                            : `Warning: Exceeds customer credit limit of ₹${selectedCustomerObj.creditLimit}`}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleUdharCheckout}
                  disabled={!selectedCustomerId}
                  className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {language === 'hi'
                      ? `खाते में ₹${cartTotal} उधारी जोड़ें`
                      : `Add ₹${cartTotal} to Udhar Khata`}
                  </span>
                </button>
              </>
            ) : (
              /* Add New Customer Inline Form */
              <form onSubmit={handleSaveNewCustomer} className="space-y-3">
                <div className="text-xs font-bold text-stone-700">
                  {language === 'hi' ? 'नया ग्राहक जोड़ें' : 'Add Regular Tea Customer'}
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    {t('customerName')} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'hi' ? 'जैसे: रमेश भाई, शर्मा जी' : 'e.g. Ramesh Bhai, Sharma Ji'}
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    {t('customerPhone')} *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10 digit mobile"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    {t('customerTag')}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'hi' ? 'जैसे: ऑटो स्टैंड, बैंक ब्रांच' : 'e.g. Auto Stand, Bank Branch, Courier'}
                    value={newCustomerTag}
                    onChange={(e) => setNewCustomerTag(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCustomer(false)}
                    className="flex-1 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 cursor-pointer"
                  >
                    {language === 'hi' ? 'वापस सूची' : 'Back to List'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-xs hover:bg-amber-700 cursor-pointer"
                  >
                    {language === 'hi' ? 'सेव करें और चुनें' : 'Save & Select'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Sale Success / Thermal Receipt Modal */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-lg text-stone-900">{t('orderSuccessTitle')}</h3>
              <p className="text-xs text-stone-500">{t('orderNumber')} #{completedOrder.orderNumber}</p>
            </div>

            {/* Thermal Receipt Box */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs font-mono space-y-2">
              <div className="text-center font-bold text-stone-800 uppercase tracking-wider">
                {settings.stallName}
              </div>
              <div className="text-center text-[10px] text-stone-400">
                {new Date(completedOrder.timestamp).toLocaleTimeString()} • {new Date(completedOrder.timestamp).toLocaleDateString()}
              </div>
              <div className="border-t border-dashed border-stone-300 my-2" />

              <div className="space-y-1">
                {completedOrder.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{i.quantity}x {i.name}</span>
                    <span className="font-semibold">{formatINR(i.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-stone-300 my-2" />
              <div className="flex justify-between font-bold text-sm text-stone-900">
                <span>{language === 'hi' ? 'कुल राशि:' : 'TOTAL:'}</span>
                <span>{formatINR(completedOrder.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-600 pt-1">
                <span>{t('paymentMethod')}:</span>
                <span className="font-semibold uppercase">{completedOrder.paymentMethod}</span>
              </div>
              {completedOrder.customerName && (
                <div className="flex justify-between text-[11px] text-amber-800">
                  <span>{t('customerName')}:</span>
                  <span className="font-bold">{completedOrder.customerName}</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-stone-500" />
                <span>{t('printReceipt')}</span>
              </button>
              <button
                onClick={() => setCompletedOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-amber-600/20 cursor-pointer"
              >
                <span>{t('newOrderBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
