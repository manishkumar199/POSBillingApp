import React, { useState } from 'react';
import {
  BookUser,
  Search,
  UserPlus,
  MessageSquare,
  Banknote,
  Clock,
  AlertTriangle,
  ReceiptText,
  ChevronRight,
  TrendingDown,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { useStall } from '../context/StallContext';
import { CustomerKhata } from '../types';
import { formatINR, createWhatsAppReminderUrl } from '../utils/soundAndUpi';
import { CustomerDetailModal } from './CustomerDetailModal';
import { SettleKhataModal } from './SettleKhataModal';

export const KhataRegisterView: React.FC = () => {
  const { customers, addCustomer, settings, language, t } = useStall();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'overlimit'>('all');

  // Modals state
  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<CustomerKhata | null>(null);
  const [selectedCustomerForSettle, setSelectedCustomerForSettle] = useState<CustomerKhata | null>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  // New customer form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newLimit, setNewLimit] = useState<number>(1500);
  const [newNotes, setNewNotes] = useState('');

  const totalOutstanding = customers.reduce((sum, c) => sum + Math.max(0, c.currentBalance), 0);
  const pendingCount = customers.filter((c) => c.currentBalance > 0).length;
  const overLimitCount = customers.filter((c) => c.currentBalance > c.creditLimit).length;

  const filteredCustomers = customers
    .filter((c) => {
      if (filterType === 'pending') return c.currentBalance > 0;
      if (filterType === 'overlimit') return c.currentBalance > c.creditLimit;
      return true;
    })
    .filter((c) => {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.workplaceOrTag && c.workplaceOrTag.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => b.currentBalance - a.currentBalance);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    addCustomer({
      name: newName.trim(),
      phone: newPhone.trim(),
      workplaceOrTag: newTag.trim() || undefined,
      creditLimit: Number(newLimit) || 1500,
      notes: newNotes.trim() || undefined,
    });

    setNewName('');
    setNewPhone('');
    setNewTag('');
    setNewLimit(1500);
    setNewNotes('');
    setShowAddCustomerModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-6 w-full min-w-0">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Outstanding */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-900 text-white shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-200">
              {t('totalUdhar')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <BookUser className="w-4 h-4 text-amber-300" />
            </div>
          </div>
          <div className="text-3xl font-black tracking-tight mt-1.5">{formatINR(totalOutstanding)}</div>
          <p className="text-xs text-amber-200/80 mt-1">
            {language === 'hi'
              ? `${pendingCount} ग्राहकों पर बाकी`
              : `Pending across ${pendingCount} regular customers`}
          </p>
        </div>

        {/* Active Khata Accounts */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-stone-500">
              {t('regularCustomers')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 mt-1.5">
            {language === 'hi' ? `${customers.length} खाते` : `${customers.length} Accounts`}
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
            <span className="text-emerald-700 font-bold">
              {customers.length - pendingCount} {language === 'hi' ? 'चुकता' : 'Cleared'}
            </span>
            <span>•</span>
            <span className="text-amber-800 font-bold">
              {pendingCount} {language === 'hi' ? 'बाकीदार' : 'with Dues'}
            </span>
          </div>
        </div>

        {/* High Risk / Limit Alert */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-stone-500">
              {t('creditLimitAlerts')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-700">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 mt-1.5">
            {language === 'hi' ? `${overLimitCount} ग्राहक` : `${overLimitCount} Customers`}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {overLimitCount > 0
              ? (language === 'hi' ? 'उधारी लिमिट पार हो चुकी है' : 'Exceeded allowed udhar threshold')
              : (language === 'hi' ? 'सभी खाते सुरक्षित सीमा में हैं' : 'All accounts within safe limits')}
          </p>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Add Customer */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between min-w-0">
        {/* Search */}
        <div className="relative w-full sm:w-80 min-w-0">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('searchKhataPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-amber-500 focus:bg-white"
          />
        </div>

        {/* Filter Pills & Add Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto min-w-0">
          <div className="flex gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterType === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
              }`}
            >
              {t('allCustomers')} ({customers.length})
            </button>
            <button
              onClick={() => setFilterType('pending')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterType === 'pending' ? 'bg-white text-amber-900 shadow-2xs' : 'text-stone-600'
              }`}
            >
              {t('pendingUdhar')} ({pendingCount})
            </button>
            {overLimitCount > 0 && (
              <button
                onClick={() => setFilterType('overlimit')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'overlimit' ? 'bg-white text-red-700 shadow-2xs' : 'text-stone-600'
                }`}
              >
                {t('overLimit')} ({overLimitCount})
              </button>
            )}
          </div>

          <button
            onClick={() => setShowAddCustomerModal(true)}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('addNewCustomerBtn')}</span>
          </button>
        </div>
      </div>

      {/* Customer Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-stone-200 p-8">
            <BookUser className="w-12 h-12 text-stone-300 mx-auto mb-2" />
            <p className="font-bold text-stone-700 text-sm">
              {language === 'hi' ? 'कोई खाता नहीं मिला' : 'No customers match your filter'}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">
              {language === 'hi' ? 'दूसरा नाम खोजें या नया खाता जोड़ें' : 'Try searching with a different keyword or add a new customer'}
            </p>
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const hasDues = cust.currentBalance > 0;
            const isOverLimit = cust.currentBalance > cust.creditLimit;
            const percent = Math.min(100, Math.round((cust.currentBalance / cust.creditLimit) * 100));

            const waLink = createWhatsAppReminderUrl({
              customerName: cust.name,
              phone: cust.phone,
              balance: cust.currentBalance,
              stallName: settings.stallName,
              upiId: settings.upiId,
              lang: language,
            });

            return (
              <div
                key={cust.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Card Top */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base">
                        {cust.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-stone-900 leading-snug">{cust.name}</h3>
                        <p className="text-xs text-stone-400 font-mono">{cust.phone}</p>
                      </div>
                    </div>
                    {cust.workplaceOrTag && (
                      <span className="text-[10px] bg-stone-100 text-stone-600 font-medium px-2 py-0.5 rounded-md border border-stone-200">
                        {cust.workplaceOrTag}
                      </span>
                    )}
                  </div>

                  {/* Udhar Balance & Limit bar */}
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[11px] font-semibold text-stone-500 uppercase">{t('currentUdhar')}:</span>
                      <span
                        className={`text-xl font-black ${
                          isOverLimit
                            ? 'text-red-700'
                            : hasDues
                            ? 'text-amber-900'
                            : 'text-emerald-700'
                        }`}
                      >
                        {formatINR(cust.currentBalance)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-stone-500">
                      <span>{t('creditLimit')}: {formatINR(cust.creditLimit)}</span>
                      <span>{percent}% {language === 'hi' ? 'इस्तेमाल' : 'used'}</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          percent > 90 ? 'bg-red-500' : percent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {cust.notes && (
                    <p className="text-[11px] text-stone-500 italic line-clamp-1">"{cust.notes}"</p>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="p-3 bg-stone-50/80 border-t border-stone-100 flex items-center gap-1.5">
                  {/* WhatsApp Reminder */}
                  {hasDues ? (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={t('sendWhatsAppReminder')}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex-1 py-2 px-2.5 rounded-xl bg-stone-100 text-stone-400 text-xs font-semibold flex items-center justify-center gap-1 cursor-not-allowed"
                    >
                      <span>{language === 'hi' ? 'बाकी नहीं' : 'No Dues'}</span>
                    </button>
                  )}

                  {/* Settle (Jama) */}
                  {hasDues && (
                    <button
                      onClick={() => setSelectedCustomerForSettle(cust)}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Banknote className="w-3.5 h-3.5" />
                      <span>{t('jama')}</span>
                    </button>
                  )}

                  {/* Statement / Details */}
                  <button
                    onClick={() => setSelectedCustomerForDetail(cust)}
                    className="p-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center cursor-pointer"
                    title={t('viewStatement')}
                  >
                    <ReceiptText className="w-4 h-4 text-stone-600" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">{t('newKhataTitle')}</h3>
                  <p className="text-xs text-stone-500">{t('newKhataSubtitle')}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">{t('customerName')} *</label>
                <input
                  type="text"
                  required
                  placeholder={language === 'hi' ? 'जैसे: रमेश कुमार, शर्मा जी' : 'e.g. Ramesh Kumar, Sharma Ji, Raju Electrician'}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">{t('customerPhone')} *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile (e.g. 9876543210)"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">{t('customerTag')}</label>
                  <input
                    type="text"
                    placeholder={language === 'hi' ? 'जैसे: ऑटो स्टैंड, एसबीआई' : 'e.g. Auto Stand, SBI'}
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">{t('creditLimit')} (₹)</label>
                  <input
                    type="number"
                    value={newLimit}
                    onChange={(e) => setNewLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">{t('customerNotes')}</label>
                <input
                  type="text"
                  placeholder={language === 'hi' ? 'जैसे: हर शनिवार को हिसाब करते हैं' : 'e.g. Clears bill weekly on Saturdays'}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 cursor-pointer"
                >
                  {t('saveCustomerBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Statement / Passbook Modal */}
      {selectedCustomerForDetail && (
        <CustomerDetailModal
          customer={selectedCustomerForDetail}
          onClose={() => setSelectedCustomerForDetail(null)}
          onOpenSettleModal={(c) => setSelectedCustomerForSettle(c)}
        />
      )}

      {/* Settle (Jama) Modal */}
      {selectedCustomerForSettle && (
        <SettleKhataModal
          customer={selectedCustomerForSettle}
          onClose={() => setSelectedCustomerForSettle(null)}
        />
      )}
    </div>
  );
};
