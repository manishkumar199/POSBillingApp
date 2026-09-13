import React, { useState } from 'react';
import { StallProvider, useStall } from './context/StallContext';
import { Navbar, TabType } from './components/Navbar';
import { PosBillingView } from './components/PosBillingView';
import { KhataRegisterView } from './components/KhataRegisterView';
import { SalesHistoryView } from './components/SalesHistoryView';
import { InventoryView } from './components/InventoryView';
import { SettingsView } from './components/SettingsView';

function MainAppShell() {
  const [currentTab, setCurrentTab] = useState<TabType>('pos');
  const { language } = useStall();

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-stone-100 flex flex-col selection:bg-amber-500 selection:text-white font-sans text-stone-800">
      {/* Top sticky navigation */}
      <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Tab Area */}
      <main className="flex-1 pb-16 w-full max-w-full min-w-0 overflow-x-hidden">
        {currentTab === 'pos' && <PosBillingView />}
        {currentTab === 'khata' && <KhataRegisterView />}
        {currentTab === 'sales' && <SalesHistoryView />}
        {currentTab === 'inventory' && <InventoryView />}
        {currentTab === 'settings' && <SettingsView />}
      </main>

      {/* Mobile/Desktop Bottom Status Bar */}
      <footer className="bg-stone-900 border-t border-stone-800 text-stone-400 py-3 px-4 text-center text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-stone-400">
            <span className="text-amber-400 font-bold">ChaiKhata</span> —{' '}
            {language === 'hi'
              ? 'चाय टपरी काउंटर बिलिंग, यूपीआई पेमेंट और आसान उधार खाता'
              : 'Tea Stall Counter POS, UPI Payments & Udhar Khata Ledger'}
          </p>
          <div className="flex items-center gap-4 text-[11px] text-stone-500">
            <span>{language === 'hi' ? 'डायनामिक UPI QR' : 'Dynamic UPI QR'}</span>
            <span>•</span>
            <span>{language === 'hi' ? '1-क्लिक व्हाट्सएप तकादा' : '1-Click WhatsApp Reminders'}</span>
            <span>•</span>
            <span>{language === 'hi' ? 'ऑटो स्टॉक कटौती' : 'Auto Inventory Depletion'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <StallProvider>
      <MainAppShell />
    </StallProvider>
  );
}
