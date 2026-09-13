import React, { useState } from 'react';
import { X, Banknote, QrCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { CustomerKhata } from '../types';
import { useStall } from '../context/StallContext';
import { formatINR } from '../utils/soundAndUpi';
import { UpiPaymentModal } from './UpiPaymentModal';

interface SettleKhataModalProps {
  customer: CustomerKhata;
  onClose: () => void;
}

export const SettleKhataModal: React.FC<SettleKhataModalProps> = ({ customer, onClose }) => {
  const { recordKhataPayment, settings, language, t } = useStall();

  const [settleAmount, setSettleAmount] = useState<number>(customer.currentBalance);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi'>('cash');
  const [note, setNote] = useState('');
  const [showUpiModal, setShowUpiModal] = useState(false);

  const handleConfirmCashPayment = () => {
    if (settleAmount <= 0) return;
    recordKhataPayment(
      customer.id,
      settleAmount,
      'cash',
      note.trim() || (language === 'hi' ? `${customer.name} से नकद जमा` : `Cash settlement from ${customer.name}`)
    );
    onClose();
  };

  const handleStartUpiPayment = () => {
    if (settleAmount <= 0) return;
    setShowUpiModal(true);
  };

  const handleUpiSuccess = (txnRef: string) => {
    recordKhataPayment(
      customer.id,
      settleAmount,
      'upi',
      note.trim() || (language === 'hi' ? `${customer.name} से UPI भुगतान (${txnRef})` : `UPI payment (${txnRef}) from ${customer.name}`)
    );
    setShowUpiModal(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">{t('settleModalTitle')}</h3>
                <p className="text-xs text-stone-500">{t('settleModalSubtitle')}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-700 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Customer info */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex justify-between items-center">
            <div>
              <span className="font-bold text-sm text-stone-900 block">{customer.name}</span>
              <span className="text-xs text-stone-500 font-mono">{customer.phone}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 block uppercase font-bold">{t('currentUdhar')}</span>
              <span className="text-base font-extrabold text-amber-900">
                {formatINR(customer.currentBalance)}
              </span>
            </div>
          </div>

          {/* Settle Amount input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">{t('amountReceived')}</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-stone-500">₹</span>
              <input
                type="number"
                value={settleAmount || ''}
                onChange={(e) => setSettleAmount(e.target.value ? Number(e.target.value) : 0)}
                className="w-full pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-lg text-stone-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {/* Quick settlement chips */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSettleAmount(customer.currentBalance)}
              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold cursor-pointer"
            >
              {language === 'hi' ? 'पूरा' : 'Full'} (₹{customer.currentBalance})
            </button>
            {[50, 100, 200, 500]
              .filter((v) => v < customer.currentBalance)
              .map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSettleAmount(val)}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold cursor-pointer"
                >
                  ₹{val}
                </button>
              ))}
          </div>

          {/* Payment mode toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">{t('paymentModeLabel')}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('cash')}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-all ${
                  paymentMode === 'cash'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>{t('cashMode')}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('upi')}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-all ${
                  paymentMode === 'upi'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20'
                    : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}
              >
                <QrCode className="w-4 h-4 text-indigo-600" />
                <span>{t('upiMode')}</span>
              </button>
            </div>
          </div>

          {/* Note input */}
          <div>
            <label className="text-xs font-semibold text-stone-600 block mb-1">{t('notesOptional')}</label>
            <input
              type="text"
              placeholder={language === 'hi' ? 'जैसे: साप्ताहिक हिसाब, बकाया' : 'e.g. Weekly settlement, Diwali advance'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Remaining balance preview */}
          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs flex justify-between">
            <span className="text-stone-500">
              {language === 'hi' ? 'जमा के बाद बचा उधार:' : 'Balance Remaining After Payment:'}
            </span>
            <span className="font-extrabold text-stone-900">
              {formatINR(Math.max(0, customer.currentBalance - settleAmount))}
            </span>
          </div>

          {/* Submit action */}
          {paymentMode === 'cash' ? (
            <button
              onClick={handleConfirmCashPayment}
              disabled={settleAmount <= 0}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{t('recordPaymentBtn')} ({formatINR(settleAmount)})</span>
            </button>
          ) : (
            <button
              onClick={handleStartUpiPayment}
              disabled={settleAmount <= 0}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <QrCode className="w-5 h-5" />
              <span>{t('payUpi')} - {formatINR(settleAmount)}</span>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic UPI QR for settling this specific Khata amount */}
      <UpiPaymentModal
        isOpen={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        amount={settleAmount}
        upiId={settings.upiId}
        merchantName={settings.upiMerchantName || settings.stallName}
        orderNote={`Udhar clearance - ${customer.name}`}
        onPaymentSuccess={handleUpiSuccess}
      />
    </>
  );
};
