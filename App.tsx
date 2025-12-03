import React, { useState } from 'react';
import { Timer, AlarmClock, Split, Globe } from 'lucide-react';
import { CountdownTimer } from './components/CountdownTimer';
import { AlarmSection } from './components/AlarmSection';
import { TabView } from './types';
import { LanguageProvider, useLanguage } from './src/contexts/LanguageContext';

const AppContent = () => {
  const [activeMobileTab, setActiveMobileTab] = useState<TabView>(TabView.TIMER);
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans overflow-hidden flex flex-col">
      {/* Header / Mobile Nav */}
      <header className="md:hidden flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800 z-10">
        <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-amber-400">
          {language === 'zh' ? '睿睿的时钟' : 'Ricky Timer/Clock'}
        </h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleLanguage}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title={language === 'zh' ? 'Switch to English' : '切换到中文'}
          >
            <Globe size={20} />
          </button>
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveMobileTab(TabView.TIMER)}
              className={`p-2 rounded-md transition-all ${
                activeMobileTab === TabView.TIMER
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Timer size={20} />
            </button>
            <button
              onClick={() => setActiveMobileTab(TabView.ALARM)}
              className={`p-2 rounded-md transition-all ${
                activeMobileTab === TabView.ALARM
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <AlarmClock size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex justify-between items-center p-4 bg-gray-900 border-b border-gray-800">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-amber-400">
          {language === 'zh' ? '睿睿的时钟' : 'Ricky Timer/Clock'}
        </h1>
        <button
          onClick={toggleLanguage}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Globe size={16} />
          <span>{language === 'zh' ? 'EN' : '中'}</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row relative">
        {/* Left Side: Countdown Timer */}
        <section 
          className={`
            flex-1 h-full border-r border-gray-800 bg-gray-950 flex flex-col
            transition-all duration-300 ease-in-out
            ${activeMobileTab === TabView.TIMER ? 'flex' : 'hidden md:flex'}
          `}
        >
          <div className="p-6 md:p-10 h-full flex flex-col justify-center">
            <div className="mb-6 flex items-center space-x-3 text-indigo-400 opacity-80">
              <Timer className="w-6 h-6" />
              <span className="text-sm font-semibold tracking-widest uppercase">
                {t('countdown')} (Countdown)
              </span>
            </div>
            <CountdownTimer />
          </div>
        </section>

        {/* Divider (Desktop only visual) */}
        <div className="hidden md:flex absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-800 z-10 items-center justify-center transform -translate-x-1/2">
          <div className="bg-gray-900 p-2 rounded-full border border-gray-700 text-gray-500">
            <Split size={16} />
          </div>
        </div>

        {/* Right Side: Alarm Clock */}
        <section 
          className={`
            flex-1 h-full bg-gray-900/50 flex flex-col
            transition-all duration-300 ease-in-out
            ${activeMobileTab === TabView.ALARM ? 'flex' : 'hidden md:flex'}
          `}
        >
          <div className="p-6 md:p-10 h-full flex flex-col justify-center">
            <div className="mb-6 flex items-center space-x-3 text-amber-400 opacity-80">
              <AlarmClock className="w-6 h-6" />
              <span className="text-sm font-semibold tracking-widest uppercase">
                {t('alarm')} (Alarm)
              </span>
            </div>
            <AlarmSection />
          </div>
        </section>

      </main>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}