import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, CheckCircle2, Copy, Check, ExternalLink, QrCode, Sparkles } from 'lucide-react';
import { buildUpiPayUrl, formatINR } from '../utils/soundAndUpi';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  upiId: string;
  merchantName: string;
  orderNote?: string;
  onPaymentSuccess: (txnRef: string) => void;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  upiId,
  merchantName,
  orderNote = 'Chai Stall Bill',
  onPaymentSuccess,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [simulatedTxnRef, setSimulatedTxnRef] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);

  const upiUrl = buildUpiPayUrl({
    upiId,
    merchantName,
    amount,
    note: orderNote,
  });

  useEffect(() => {
    if (!isOpen) {
      setSimulatedTxnRef('');
      setIsVerifying(false);
      return;
    }

    const randomTxn = `UPI${Math.floor(100000 + Math.random() * 900000)}`;
    setSimulatedTxnRef(randomTxn);

    QRCode.toDataURL(upiUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#1c1917',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to render QR Code', err));
  }, [isOpen, upiUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(upiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmReceived = () => {
    setIsVerifying(true);
    setTimeout(() => {
      onPaymentSuccess(simulatedTxnRef || `UPI-TXN-${Date.now().toString().slice(-6)}`);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden bg-white border border-stone-200 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-stone-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight">UPI Scan & Pay</h3>
              <p className="text-xs text-amber-200/80 font-medium">Any App: GPay, PhonePe, Paytm, BHIM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center">
          {/* Amount Badge */}
          <div className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Payable Amount</span>
            <div className="text-4xl font-extrabold text-stone-900 tracking-tight mt-0.5">
              {formatINR(amount)}
            </div>
          </div>

          {/* QR Code Container with Indian UPI styling */}
          <div className="relative p-3 rounded-2xl bg-stone-50 border-2 border-stone-200 shadow-inner flex flex-col items-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="UPI QR Code"
                className="w-56 h-56 rounded-xl object-contain shadow-xs bg-white"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-stone-400 text-sm">
                Generating QR...
              </div>
            )}

            {/* UPI Brand Strip */}
            <div className="mt-2.5 flex items-center justify-center gap-2 text-[11px] font-semibold text-stone-600 bg-white px-3 py-1 rounded-full border border-stone-200">
              <span className="text-blue-600 font-bold">BHIM</span>
              <span className="text-stone-300">•</span>
              <span className="text-indigo-600 font-bold">PhonePe</span>
              <span className="text-stone-300">•</span>
              <span className="text-emerald-600 font-bold">GPay</span>
              <span className="text-stone-300">•</span>
              <span className="text-sky-600 font-bold">Paytm</span>
            </div>
          </div>

          {/* VPA and Merchant Details */}
          <div className="mt-4 w-full bg-stone-50 rounded-xl p-3 border border-stone-200 text-left text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-stone-500 font-medium">Paying To:</span>
              <span className="text-stone-800 font-bold">{merchantName}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-stone-200/60">
              <span className="text-stone-500 font-medium">UPI VPA:</span>
              <span className="text-stone-800 font-mono font-semibold">{upiId}</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-4 w-full flex gap-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 active:bg-stone-100 text-xs font-semibold text-stone-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-500" />}
              {copied ? 'Copied UPI Link' : 'Copy UPI Link'}
            </button>

            <a
              href={upiUrl}
              className="py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center justify-center gap-1.5 transition-colors sm:hidden"
            >
              <ExternalLink className="w-4 h-4 text-stone-500" />
              Open App
            </a>
          </div>

          {/* Payment Received Confirmation button */}
          <button
            onClick={handleConfirmReceived}
            disabled={isVerifying}
            className="mt-4 w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isVerifying ? (
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" /> Verifying Payment...
              </span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Mark Received & Complete Sale ({formatINR(amount)})</span>
              </>
            )}
          </button>
          <p className="text-[11px] text-stone-400 mt-2">
            Plays digital soundbox confirmation and prints bill
          </p>
        </div>
      </div>
    </div>
  );
};
