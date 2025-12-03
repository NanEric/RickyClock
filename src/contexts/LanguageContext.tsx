import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  zh: {
    'countdown': '倒计时',
    'alarm': '闹钟',
    'timeUp': '时间到！',
    'alarmRinging': '闹钟正在响铃',
    'setDuration': '设置时间',
    'start': '开始',
    'pause': '暂停',
    'resume': '继续',
    'reset': '重置',
    'dismiss': '关闭',
    'running': '运行中',
    'alarmSetFor': '闹钟设置于',
    'alarmOff': '闹钟关闭',
    'currentTime': '当前时间',
    'stopAlarm': '停止闹钟',
    'hours': '小时',
    'minutes': '分钟',
    'seconds': '秒',
    'stop': '停止',
    'switchToEnglish': '切换到英文',
    'switchToChinese': 'Switch to 中文',
    'setAlarmTime': '设置闹钟时间',
    'wakeUp': '该起床了',
    'timePlaceholder': '时:分',
    'setAlarm': '设置闹钟',
    'turnOff': '关闭',
    'clean': '清空倒计时'
  },
  en: {
    'countdown': 'Countdown',
    'alarm': 'Alarm',
    'timeUp': 'Time\'s Up!',
    'alarmRinging': 'Alarm is ringing',
    'setDuration': 'Set Duration',
    'start': 'Start',
    'pause': 'Pause',
    'resume': 'Resume',
    'reset': 'Reset',
    'dismiss': 'Dismiss',
    'running': 'Running',
    'alarmSetFor': 'Alarm set for',
    'alarmOff': 'Alarm Off',
    'currentTime': 'Current Time',
    'stopAlarm': 'Stop Alarm',
    'hours': 'Hours',
    'minutes': 'Minutes',
    'seconds': 'Seconds',
    'stop': 'Stop',
    'switchToEnglish': 'Switch to English',
    'switchToChinese': '切换到中文',
    'setAlarmTime': 'Set Alarm Time',
    'wakeUp': 'WAKE UP',
    'timePlaceholder': 'HH:MM',
    'setAlarm': 'Set Alarm',
    'turnOff': 'Turn Off',
    'clean': 'Clean'
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
