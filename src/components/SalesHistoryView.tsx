import React, { useState } from 'react';
import {
  BarChart3,
  Search,
  Banknote,
  QrCode,
  BookUser,
  Coffee,
  RotateCcw,
  Calendar,
  Receipt,
  CheckCircle2,
  DollarSign,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { useStall } from '../context/StallContext';
import { SaleOrder } from '../types';
import { formatINR } from '../utils/soundAndUpi';

export const SalesHistoryView: React.FC = () => {
  const { orders, cancelSale, khataTransactions, settings, language, t } = useStall();

  const [dateFilter, setDateFilter] = useState<'today' | 'all'>('today');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'upi' | 'udhar'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showZReport, setShowZReport] = useState(false);
  const [actualCashInGalla, setActualCashInGalla] = useState<number | ''>('');

  const now = new Date();
  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  const activeOrders = orders.filter((o) => o.status === 'completed');

  // Filtered orders
  const displayOrders = orders.filter((order) => {
    if (dateFilter === 'today' && !isToday(order.timestamp)) return false;
    if (paymentFilter !== 'all' && order.paymentMethod !== paymentFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNum = String(order.orderNumber).includes(q);
      const matchCustomer = order.customerName && order.customerName.toLowerCase().includes(q);
      const matchItem = order.items.some((i) => i.name.toLowerCase().includes(q));
      if (!matchNum && !matchCustomer && !matchItem) return false;
    }
    return true;
  });

  // Calculate Today's figures
  const todayOrders = orders.filter((o) => o.status === 'completed' && isToday(o.timestamp));
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const todayCashSales = todayOrders
    .filter((o) => o.paymentMethod === 'cash')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const todayUpiSales = todayOrders
    .filter((o) => o.paymentMethod === 'upi')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const todayUdharSales = todayOrders
    .filter((o) => o.paymentMethod === 'udhar')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Udhar recovered today in cash
  const todayKhataCashRecovered = khataTransactions
    .filter((t) => t.type === 'credit' && t.paymentMode === 'cash' && isToday(t.timestamp))
    .reduce((sum, t) => sum + t.amount, 0);

  // Udhar recovered today in UPI
  const todayKhataUpiRecovered = khataTransactions
    .filter((t) => t.type === 'credit' && t.paymentMode === 'upi' && isToday(t.timestamp))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCupsServedToday = todayOrders.reduce((sum, o) => {
    const teaItems = o.items.filter((i) => i.name.toLowerCase().includes('chai') || i.name.toLowerCase().includes('tea') || i.name.toLowerCase().includes('coffee'));
    return sum + teaItems.reduce((sub, item) => sub + item.quantity, 0);
  }, 0);

  const expectedCashInGalla = todayCashSales + todayKhataCashRecovered;

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-6 w-full min-w-0">
      {/* Top Daily Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Today's Sales */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-stone-500">
              {t('todayTotalSales')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
            {formatINR(todayRevenue)}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {todayOrders.length} {language === 'hi' ? 'पर्चियां आज कटीं' : 'bills billed today'}
          </p>
        </div>

        {/* Cash in Galla (Drawer) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-stone-500">
              {t('todayCashInGalla')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800 mt-2">
            {formatINR(expectedCashInGalla)}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {formatINR(todayCashSales)} {language === 'hi' ? 'काउंटर' : 'counter'} + {formatINR(todayKhataCashRecovered)} {language === 'hi' ? 'उधार जमा' : 'udhar paid'}
          </p>
        </div>

        {/* UPI Payments */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-stone-500">
              {t('todayUpiAmount')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-900 mt-2">
            {formatINR(todayUpiSales + todayKhataUpiRecovered)}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {language === 'hi' ? `सीधे बैंक में (${settings.upiId})` : `Directly credited to ${settings.upiId}`}
          </p>
        </div>

        {/* Udhar Added Today */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-stone-500">
              {t('todayUdharAmount')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <BookUser className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-900 mt-2">
            {formatINR(todayUdharSales)}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {language === 'hi' ? 'ग्राहकों को उधारी में सामान दिया' : 'Chai served on customer credit'}
          </p>
        </div>
      </div>

      {/* Action Bar: Closing Report & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between min-w-0">
        {/* Left: Date & Payment filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Today vs All */}
          <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                dateFilter === 'today' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
              }`}
            >
              {t('filterToday')}
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                dateFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
              }`}
            >
              {t('filterAllTime')} ({orders.length})
            </button>
          </div>

          {/* Payment filter */}
          <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold">
            <button
              onClick={() => setPaymentFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                paymentFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
              }`}
            >
              {language === 'hi' ? 'सभी' : 'All Modes'}
            </button>
            <button
              onClick={() => setPaymentFilter('cash')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                paymentFilter === 'cash' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-stone-600'
              }`}
            >
              {t('payCash')}
            </button>
            <button
              onClick={() => setPaymentFilter('upi')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                paymentFilter === 'upi' ? 'bg-white text-indigo-800 shadow-2xs' : 'text-stone-600'
              }`}
            >
              {t('payUpi')}
            </button>
            <button
              onClick={() => setPaymentFilter('udhar')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                paymentFilter === 'udhar' ? 'bg-white text-amber-800 shadow-2xs' : 'text-stone-600'
              }`}
            >
              {t('payUdhar')}
            </button>
          </div>
        </div>

        {/* Right: Search & Z-Report Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'hi' ? 'पर्ची # या सामान का नाम...' : 'Order # or item...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <button
            onClick={() => setShowZReport(true)}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-amber-400" />
            <span>{t('gallaMilanBtn')}</span>
          </button>
        </div>
      </div>

      {/* Orders List Table / Feed */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <h3 className="font-bold text-sm text-stone-900">
            {t('billDetails')} ({displayOrders.length} {language === 'hi' ? 'ऑर्डर' : 'orders'})
          </h3>
          <span className="text-xs text-stone-500">
            {totalCupsServedToday > 0 && (language === 'hi' ? `लगभग ${totalCupsServedToday} कप चाय आज पिलाई गई` : `Estimated ${totalCupsServedToday} chai cups served today`)}
          </span>
        </div>

        {displayOrders.length === 0 ? (
          <div className="py-16 text-center text-stone-400 text-sm">
            {language === 'hi' ? 'इस फ़िल्टर में कोई बिक्री रिकॉर्ड नहीं मिला।' : 'No sales matching the filter criteria.'}
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {displayOrders.map((order) => {
              const isCancelled = order.status === 'cancelled';
              return (
                <div
                  key={order.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    isCancelled ? 'bg-red-50/40 opacity-70' : 'hover:bg-stone-50/80'
                  }`}
                >
                  {/* Left: Order number & items */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-stone-900">
                        {language === 'hi' ? 'पर्ची' : 'Order'} #{order.orderNumber}
                      </span>
                      {isCancelled && (
                        <span className="text-[10px] uppercase font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                          {language === 'hi' ? 'रद्द' : 'Cancelled'}
                        </span>
                      )}
                      <span className="text-xs text-stone-400">
                        {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                        {new Date(order.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-xs text-stone-600 flex flex-wrap gap-1.5">
                      {order.items.map((i, idx) => (
                        <span key={idx} className="bg-stone-100 px-2 py-0.5 rounded text-stone-700 font-medium">
                          {i.quantity}× {i.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Payment badge, Total & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    {/* Payment Mode Badge */}
                    <div className="text-right">
                      {order.paymentMethod === 'cash' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t('payCash')}</span>
                        </span>
                      )}
                      {order.paymentMethod === 'upi' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                          <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{t('payUpi')}</span>
                        </span>
                      )}
                      {order.paymentMethod === 'udhar' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                          <BookUser className="w-3.5 h-3.5 text-amber-700" />
                          <span>{t('payUdhar')} ({order.customerName || (language === 'hi' ? 'खाता' : 'Khata')})</span>
                        </span>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="text-right min-w-[70px]">
                      <span
                        className={`text-base font-black ${
                          isCancelled ? 'line-through text-stone-400' : 'text-stone-900'
                        }`}
                      >
                        {formatINR(order.totalAmount)}
                      </span>
                    </div>

                    {/* Cancel action */}
                    {!isCancelled && (
                      <button
                        onClick={() => {
                          if (window.confirm(language === 'hi' ? `क्या पर्ची #${order.orderNumber} रद्द करनी है? इससे स्टॉक और उधारी वापस ठीक हो जाएगी।` : `Cancel Order #${order.orderNumber}? This will restore stock & reverse any Udhar.`)) {
                            cancelSale(order.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title={language === 'hi' ? 'पर्ची रद्द करें व स्टॉक लौटाएं' : 'Cancel Order and Restore Stock'}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Day-End Closing (Z-Report) Modal */}
      {showZReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-stone-900 text-amber-400">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">{t('gallaMilanTitle')}</h3>
                  <p className="text-xs text-stone-500">{t('salesSubtitle')}</p>
                </div>
              </div>
              <button onClick={() => setShowZReport(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                ✕
              </button>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-600">
                  {language === 'hi' ? 'आज की काउंटर नकद बिक्री:' : "Today's Counter Cash Sales:"}
                </span>
                <span className="font-bold text-stone-900">+{formatINR(todayCashSales)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-600">
                  {language === 'hi' ? 'ग्राहक उधारी नकद में वसूल:' : 'Customer Udhar Received in Cash:'}
                </span>
                <span className="font-bold text-stone-900">+{formatINR(todayKhataCashRecovered)}</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold text-stone-900 text-sm">
                <span>{t('systemExpectedCash')}</span>
                <span className="text-emerald-800">{formatINR(expectedCashInGalla)}</span>
              </div>

              <div className="border-t border-dashed border-stone-300 pt-2 flex justify-between text-stone-500">
                <span>{t('todayUpiAmount')}</span>
                <span className="font-semibold text-indigo-700">
                  {formatINR(todayUpiSales + todayKhataUpiRecovered)}
                </span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>{t('todayUdharAmount')}</span>
                <span className="font-semibold text-amber-800">{formatINR(todayUdharSales)}</span>
              </div>
            </div>

            {/* Actual cash input for tally */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">
                {t('enterCountedCash')}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-stone-500">₹</span>
                <input
                  type="number"
                  placeholder={String(expectedCashInGalla)}
                  value={actualCashInGalla}
                  onChange={(e) => setActualCashInGalla(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-base text-stone-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            {/* Discrepancy indicator */}
            {typeof actualCashInGalla === 'number' && (
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                  actualCashInGalla === expectedCashInGalla
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : actualCashInGalla > expectedCashInGalla
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <span>
                  {actualCashInGalla === expectedCashInGalla
                    ? t('perfectMatchText')
                    : actualCashInGalla > expectedCashInGalla
                    ? (language === 'hi' ? `गल्ले में अतिरिक्त नकदी: +${formatINR(actualCashInGalla - expectedCashInGalla)}` : `Extra cash in drawer: +${formatINR(actualCashInGalla - expectedCashInGalla)}`)
                    : (language === 'hi' ? `गल्ले में नकद कमी: -${formatINR(expectedCashInGalla - actualCashInGalla)}` : `Cash shortage in drawer: -${formatINR(expectedCashInGalla - actualCashInGalla)}`)}
                </span>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-stone-500" />
                <span>{language === 'hi' ? 'गल्ला पर्ची प्रिंट करें' : 'Print Daily Closing'}</span>
              </button>
              <button
                onClick={() => setShowZReport(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold cursor-pointer"
              >
                {language === 'hi' ? 'हो गया' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
