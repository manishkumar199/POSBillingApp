import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageSquare,
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  QrCode,
  Calendar,
  AlertTriangle,
  Plus,
  Trash2,
  ReceiptText,
} from 'lucide-react';
import { CustomerKhata, KhataTransaction } from '../types';
import { useStall } from '../context/StallContext';
import { formatINR, createWhatsAppReminderUrl } from '../utils/soundAndUpi';

interface CustomerDetailModalProps {
  customer: CustomerKhata;
  onClose: () => void;
  onOpenSettleModal: (customer: CustomerKhata) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  onClose,
  onOpenSettleModal,
}) => {
  const { khataTransactions, recordManualKhataDebit, deleteCustomer, settings, language, t } = useStall();
  
  const [showManualDebitForm, setShowManualDebitForm] = useState(false);
  const [manualAmount, setManualAmount] = useState<number | ''>('');
  const [manualDescription, setManualDescription] = useState('');

  // Transactions for this customer sorted latest first
  const customerTxns = khataTransactions
    .filter((t) => t.customerId === customer.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleAddManualDebit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAmount || manualAmount <= 0) return;

    recordManualKhataDebit(
      customer.id,
      Number(manualAmount),
      manualDescription.trim() || (language === 'hi' ? 'मैन्युअल चाय उधारी' : 'Manual Chai Credit')
    );
    setManualAmount('');
    setManualDescription('');
    setShowManualDebitForm(false);
  };

  const whatsappUrl = createWhatsAppReminderUrl({
    customerName: customer.name,
    phone: customer.phone,
    balance: customer.currentBalance,
    stallName: settings.stallName,
    upiId: settings.upiId,
    lang: language,
  });

  const percentOfLimit = Math.min(100, Math.round((customer.currentBalance / customer.creditLimit) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-stone-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-lg">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight">{customer.name}</h3>
                {customer.workplaceOrTag && (
                  <span className="text-[11px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full border border-stone-700 font-medium">
                    {customer.workplaceOrTag}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 font-mono mt-0.5">{customer.phone}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance & Quick Actions Bar */}
        <div className="p-5 bg-stone-50 border-b border-stone-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
                {t('balanceDue')}
              </span>
              <div className="text-3xl font-black text-amber-900 mt-0.5">
                {formatINR(customer.currentBalance)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-stone-500">
                  {t('creditLimit')}: {formatINR(customer.creditLimit)} ({percentOfLimit}%)
                </span>
                {customer.currentBalance > customer.creditLimit && (
                  <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {language === 'hi' ? 'सीमा पार' : 'Exceeded'}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t('whatsappBill')}</span>
              </a>

              <button
                onClick={() => {
                  onClose();
                  onOpenSettleModal(customer);
                }}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Banknote className="w-4 h-4" />
                <span>{t('settleBtn')}</span>
              </button>
            </div>
          </div>

          {/* Progress bar of credit limit */}
          <div className="w-full bg-stone-200 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                percentOfLimit > 90 ? 'bg-red-500' : percentOfLimit > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${percentOfLimit}%` }}
            />
          </div>
        </div>

        {/* Ledger Transactions list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <ReceiptText className="w-4 h-4 text-stone-400" />
              <span>{t('passbookTitle')} ({customerTxns.length})</span>
            </h4>
            <button
              onClick={() => setShowManualDebitForm(!showManualDebitForm)}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showManualDebitForm ? t('clearCart') : t('addManualDebitTitle')}</span>
            </button>
          </div>

          {/* Manual Debit Form */}
          {showManualDebitForm && (
            <form onSubmit={handleAddManualDebit} className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <div className="text-xs font-bold text-amber-900">{t('addManualDebitTitle')}</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  required
                  placeholder={language === 'hi' ? 'रुपये दर्ज करें ₹' : 'Amount ₹'}
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value ? Number(e.target.value) : '')}
                  className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-bold focus:outline-hidden focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder={language === 'hi' ? 'सामान: जैसे 5 चाय, 2 समोसा' : 'Note: e.g. 5 chai, 2 samosa'}
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                {t('recordDebitBtn')}
              </button>
            </form>
          )}

          {customerTxns.length === 0 ? (
            <div className="py-8 text-center text-stone-400 text-xs">
              {language === 'hi' ? 'इस ग्राहक का अभी तक कोई लेन-देन दर्ज नहीं है।' : 'No transactions recorded yet for this customer.'}
            </div>
          ) : (
            customerTxns.map((txn) => {
              const isDebit = txn.type === 'debit';
              return (
                <div
                  key={txn.id}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isDebit ? 'bg-red-50/40 border-red-100' : 'bg-emerald-50/40 border-emerald-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isDebit ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isDebit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900">{txn.description}</p>
                      <p className="text-[10px] text-stone-400">
                        {new Date(txn.timestamp).toLocaleDateString()} at{' '}
                        {new Date(txn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {txn.paymentMode && ` • via ${txn.paymentMode.toUpperCase()}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-black ${
                        isDebit ? 'text-red-700' : 'text-emerald-700'
                      }`}
                    >
                      {isDebit ? `+${formatINR(txn.amount)}` : `-${formatINR(txn.amount)}`}
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      {language === 'hi' ? 'बाकी' : 'Bal'}: {formatINR(txn.balanceAfter)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex justify-between items-center text-xs">
          <button
            onClick={() => {
              if (window.confirm(language === 'hi' ? `क्या ग्राहक ${customer.name} का खाता हटाना है?` : `Delete customer ${customer.name}?`)) {
                deleteCustomer(customer.id);
                onClose();
              }
            }}
            className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'खाता हटाएं' : 'Delete Account'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold cursor-pointer"
          >
            {language === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
