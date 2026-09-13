import React, { useState, useEffect } from 'react';
import { X, Smartphone, Download, CheckCircle2, Share, PlusSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { promptInstall, isAppInstalled, isIos, subscribeToInstallPrompt } from '../utils/pwa';
import { useStall } from '../context/StallContext';

interface InstallAppModalProps {
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ onClose }) => {
  const { language, t } = useStall();
  const [canDirectInstall, setCanDirectInstall] = useState(false);
  const [alreadyInstalled, setAlreadyInstalled] = useState(false);
  const [isApple, setIsApple] = useState(false);

  useEffect(() => {
    setAlreadyInstalled(isAppInstalled());
    setIsApple(isIos());

    const unsubscribe = subscribeToInstallPrompt((canInstall) => {
      setCanDirectInstall(canInstall);
    });

    return () => unsubscribe();
  }, []);

  const handleInstallClick = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 p-1 flex items-center justify-center">
              <img src="/icon-192.svg" alt="ChaiKhata Logo" className="w-10 h-10 object-contain rounded-xl" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                {t('installModalTitle')}
              </h2>
              <p className="text-xs text-amber-300 font-medium">
                {language === 'hi'
                  ? 'मोबाइल फ़ोन पर बिना प्लेस्टोर ऐप की तरह चलाएं'
                  : 'Install directly onto your phone with no App Store needed'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 text-stone-800 max-h-[80vh] overflow-y-auto">
          {alreadyInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-sm">
                  {language === 'hi' ? 'ऐप पहले से इंस्टॉल है!' : 'App Already Installed!'}
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  {language === 'hi'
                    ? 'ChaiKhata आपके फोन की होम स्क्रीन पर असली मोबाइल ऐप की तरह ऑफलाइन भी काम कर रही है।'
                    : 'ChaiKhata is currently running as a standalone mobile app on your home screen with offline local storage.'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Value highlights */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="text-xl">⚡</span>
                  <p className="text-xs font-bold text-stone-900 mt-1">
                    {language === 'hi' ? '1-क्लिक ओपन' : '1-Tap Open'}
                  </p>
                  <p className="text-[10px] text-stone-500">
                    {language === 'hi' ? 'होम स्क्रीन से' : 'From Home Screen'}
                  </p>
                </div>
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="text-xl">📱</span>
                  <p className="text-xs font-bold text-stone-900 mt-1">
                    {language === 'hi' ? 'फुल स्क्रीन' : 'Full Screen'}
                  </p>
                  <p className="text-[10px] text-stone-500">
                    {language === 'hi' ? 'बिना ब्राउज़र बार' : 'No browser address bar'}
                  </p>
                </div>
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="text-xl">💾</span>
                  <p className="text-xs font-bold text-stone-900 mt-1">
                    {language === 'hi' ? 'फोन में सुरक्षित' : 'Local & Safe'}
                  </p>
                  <p className="text-[10px] text-stone-500">
                    {language === 'hi' ? 'खाता आपके फोन में' : 'Khata stays on phone'}
                  </p>
                </div>
              </div>

              {/* Direct 1-Click Install Button if supported by Android/Chrome */}
              {canDirectInstall && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-2">
                  <p className="text-xs font-bold text-amber-900">
                    {language === 'hi'
                      ? 'आपका ब्राउज़र सीधे 1-क्लिक ऐप इंस्टॉल सपोर्ट करता है:'
                      : 'Your browser supports 1-click automatic app installation:'}
                  </p>
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all transform active:scale-98"
                  >
                    <Download className="w-5 h-5" />
                    <span>{t('directInstallBtn')}</span>
                  </button>
                </div>
              )}

              {/* Step-by-step guides for Android & iPhone */}
              <div className="space-y-4 pt-1">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                  {language === 'hi' ? '10 सेकंड में फोन पर ऐप ऐसे लगाएं:' : 'How to install in 10 seconds:'}
                </h4>

                {/* Android Chrome Instructions */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-stone-900 text-white flex items-center justify-center text-xs font-bold">
                      A
                    </div>
                    <h5 className="font-extrabold text-sm text-stone-900">
                      {t('androidHeading')}
                    </h5>
                  </div>
                  <ol className="text-xs text-stone-600 space-y-2 pl-4 list-decimal">
                    <li>
                      {language === 'hi' ? (
                        <>अपने मोबाइल में <strong>Google Chrome</strong> ब्राउज़र में इस लिंक को खोलें।</>
                      ) : (
                        <>Open this website link in <strong>Google Chrome</strong> on your phone.</>
                      )}
                    </li>
                    <li>
                      {language === 'hi' ? (
                        <>क्रोम में ऊपर दाईं तरफ <strong>तीन बिंदी (⋮)</strong> वाले मेन्यू पर दबाएं।</>
                      ) : (
                        <>Tap the <strong>three dots (⋮)</strong> menu in the top right corner of Chrome.</>
                      )}
                    </li>
                    <li>
                      {language === 'hi' ? (
                        <>वहां <strong>"Install app"</strong> या <strong>"Add to Home screen" (होम स्क्रीन पर जोड़ें)</strong> चुनें।</>
                      ) : (
                        <>Select <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.</>
                      )}
                    </li>
                    <li>
                      {language === 'hi' ? (
                        <><strong>Install</strong> दबाते ही ChaiKhata की ऐप आपके फोन की स्क्रीन पर आ जाएगी!</>
                      ) : (
                        <>Tap <strong>Install</strong>. The ChaiKhata icon will appear on your phone's main apps screen!</>
                      )}
                    </li>
                  </ol>
                </div>

                {/* iPhone / iOS Safari Instructions */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                      B
                    </div>
                    <h5 className="font-extrabold text-sm text-stone-900">
                      {t('iosHeading')}
                    </h5>
                  </div>
                  <ol className="text-xs text-stone-600 space-y-2 pl-4 list-decimal">
                    <li>
                      {language === 'hi' ? (
                        <>अपने iPhone में <strong>Safari</strong> ब्राउज़र में यह वेबसाइट खोलें।</>
                      ) : (
                        <>Open this link in <strong>Safari</strong> on your iPhone.</>
                      )}
                    </li>
                    <li className="flex items-center gap-1.5 flex-wrap">
                      {language === 'hi' ? (
                        <>
                          <span>स्क्रीन के नीचे <strong>Share बटन</strong></span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-stone-200 text-stone-800 text-[11px] font-bold">
                            <Share className="w-3 h-3 mr-1" /> Share
                          </span>
                          <span>पर दबाएं।</span>
                        </>
                      ) : (
                        <>
                          <span>Tap the <strong>Share button</strong></span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-stone-200 text-stone-800 text-[11px] font-bold">
                            <Share className="w-3 h-3 mr-1" /> Share
                          </span>
                          <span>at the bottom of your screen.</span>
                        </>
                      )}
                    </li>
                    <li className="flex items-center gap-1.5 flex-wrap">
                      {language === 'hi' ? (
                        <>
                          <span>नीचे स्क्रॉल करें और </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-stone-200 text-stone-800 text-[11px] font-bold">
                            <PlusSquare className="w-3 h-3 mr-1" /> Add to Home Screen
                          </span>
                          <span>दबाएं।</span>
                        </>
                      ) : (
                        <>
                          <span>Scroll down and tap </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-stone-200 text-stone-800 text-[11px] font-bold">
                            <PlusSquare className="w-3 h-3 mr-1" /> Add to Home Screen
                          </span>
                        </>
                      )}
                    </li>
                    <li>
                      {language === 'hi' ? (
                        <>ऊपर दाईं तरफ <strong>Add</strong> दबाएं। ChaiKhata असली ऐप की तरह फुल-स्क्रीन खुलेगी!</>
                      ) : (
                        <>Tap <strong>Add</strong> at the top right. ChaiKhata will launch full-screen just like an App Store app!</>
                      )}
                    </li>
                  </ol>
                </div>
              </div>
            </>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              {t('closeGuideBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
