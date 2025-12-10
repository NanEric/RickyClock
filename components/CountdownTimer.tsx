import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, BellOff, Volume2, VolumeX, Trash2 } from 'lucide-react';
import { TimerStatus } from '../types';
import { useLanguage } from '../src/contexts/LanguageContext';

export const CountdownTimer: React.FC = () => {
  const { t } = useLanguage();
  // Time inputs
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [status, setStatus] = useState<TimerStatus>(TimerStatus.IDLE);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Format helper
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return { h, m, s };
  };

  // Audio context and nodes for beep sound
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);

  // Initialize audio context
  useEffect(() => {
    // Create audio context on user interaction to comply with autoplay policies
    const initAudio = () => {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      
      setAudioContext(ctx);
      setOscillator(osc);
      setGainNode(gain);
      
      return () => {
        gain.disconnect();
        osc.disconnect();
        if (ctx.state !== 'closed') {
          ctx.close();
        }
      };
    };
    
    // Initialize audio on first user interaction
    const handleFirstInteraction = () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      initAudio();
    };
    
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });
    
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Handle alarm sound when status changes
  useEffect(() => {
    if (status === TimerStatus.COMPLETED) {
      if (audioContext && oscillator && gainNode) {
        // Resume audio context if it was suspended
        if (audioContext.state === 'suspended') {
          audioContext.resume().catch(e => console.error('Error resuming audio context:', e));
        }
        // Start beeping
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        // Beep pattern: 0.1s on, 0.1s off
        const beepInterval = setInterval(() => {
          if (gainNode && audioContext) {
            const now = audioContext.currentTime;
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(0.5, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          }
        }, 200);
        
        return () => clearInterval(beepInterval);
      }
    } else {
      // Stop beeping
      if (gainNode && audioContext) {
        gainNode.gain.cancelScheduledValues(audioContext.currentTime);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      }
    }
  }, [status, audioContext, oscillator, gainNode]);

  // 使用useRef存储倒计时开始时间和剩余时间
  const startTimeRef = useRef<number | null>(null);
  const remainingTimeRef = useRef<number>(0);

  const tick = useCallback(() => {
    if (!startTimeRef.current) return;
    
    const now = Date.now();
    const elapsed = Math.floor((now - startTimeRef.current) / 1000);
    const newRemaining = Math.max(remainingTimeRef.current - elapsed, 0);
    
    setTimeLeft(newRemaining);
    
    if (newRemaining <= 0) {
      setStatus(TimerStatus.COMPLETED);
      startTimeRef.current = null;
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      startTimeRef.current = now;
      remainingTimeRef.current = newRemaining;
    }
  }, []);

  useEffect(() => {
    if (status === TimerStatus.RUNNING) {
      // 开始倒计时时记录开始时间和剩余时间
      startTimeRef.current = Date.now();
      remainingTimeRef.current = timeLeft;
      
      // 使用requestAnimationFrame来获得更精确的定时器
      const animate = () => {
        tick();
        if (status === TimerStatus.RUNNING && remainingTimeRef.current > 0) {
          timerRef.current = setTimeout(animate, 100);
        }
      };
      
      timerRef.current = setTimeout(animate, 100);
      
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [status, tick, timeLeft]);

  const startTimer = () => {
    if (status === TimerStatus.IDLE || status === TimerStatus.COMPLETED) {
      const total = hours * 3600 + minutes * 60 + seconds;
      if (total === 0) return;
      setTimeLeft(total);
      remainingTimeRef.current = total;
    } else if (status === TimerStatus.PAUSED) {
      // 恢复倒计时时，remainingTimeRef已经保存了剩余时间
    }
    setStatus(TimerStatus.RUNNING);
  };

  const pauseTimer = () => setStatus(TimerStatus.PAUSED);
  
  const resetTimer = () => {
    setStatus(TimerStatus.IDLE);
    setTimeLeft(0);
    startTimeRef.current = null;
    remainingTimeRef.current = 0;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  // Clear all input fields
  const clearAllInputs = () => {
    setHours(0);
    setMinutes(0);
    setSeconds(0);
    setTempValues({
      hours: '0',
      minutes: '0',
      seconds: '0'
    });
    // Reset touched state
    setIsTouched({
      hours: false,
      minutes: false,
      seconds: false
    });
  };

  const stopAlarm = () => {
    setStatus(TimerStatus.IDLE);
    setTimeLeft(0);
    if (gainNode && audioContext) {
      gainNode.gain.cancelScheduledValues(audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    }
  };

  const displayTime = status === TimerStatus.IDLE ? { h: hours, m: minutes, s: seconds } : formatTime(timeLeft);
  const isRinging = status === TimerStatus.COMPLETED;

  // Input handlers
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string, max: number) => {
    // 如果输入为空，设置为0
    if (value === '') {
      setter(0);
      return;
    }
    
    // 解析输入值
    let num = parseInt(value, 10);
    
    // 检查是否为有效数字
    if (isNaN(num)) {
      setter(0);
      return;
    }
    
    // 限制最大值和最小值
    if (num > max) num = max;
    if (num < 0) num = 0;
    
    setter(num);
  };
  
  // 跟踪用户是否已经与输入框交互过
  const [isTouched, setIsTouched] = useState<{[key: string]: boolean}>({
    hours: false,
    minutes: false,
    seconds: false
  });

  // 处理输入框的显示值
  const getInputValue = (type: 'hours' | 'minutes' | 'seconds', value: number) => {
    // 如果用户已经与输入框交互过，则显示临时值
    // 否则显示实际值（包括初始状态的0）
    return isTouched[type] ? tempValues[type] : value.toString();
  };

  // 存储输入框的临时值
  const [tempValues, setTempValues] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
  }>({
    hours: '0',
    minutes: '0',
    seconds: '0'
  });

  // 处理输入框获取焦点事件
  const handleFocus = (type: 'hours' | 'minutes' | 'seconds', value: number) => {
    // 保存当前值到临时状态
    setTempValues(prev => ({
      ...prev,
      [type]: value === 0 ? '' : value.toString()
    }));
    
    // 如果这是用户第一次与输入框交互，则设置对应的touched状态
    if (!isTouched[type]) {
      setIsTouched(prev => ({
        ...prev,
        [type]: true
      }));
    }
  };

  // 处理输入框失去焦点事件
  const handleBlur = (type: 'hours' | 'minutes' | 'seconds', setter: React.Dispatch<React.SetStateAction<number>>) => {
    const value = tempValues[type];
    // 如果输入为空，则恢复之前的值
    if (value === '') {
      setTempValues(prev => ({
        ...prev,
        [type]: '0'
      }));
    } else {
      // 否则更新实际值
      const num = parseInt(value, 10) || 0;
      setter(num);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Clock Face Display */}
      <div className={`relative mb-10 transition-all duration-300 ${isRinging ? 'animate-shake' : ''}`}>
        
        {/* Ringing Visual Effect Background */}
        {isRinging && (
          <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl animate-pulse-red scale-150"></div>
        )}

        <div className={`
          relative z-10 w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 flex items-center justify-center bg-gray-900 shadow-2xl
          ${isRinging ? 'border-red-500 shadow-red-500/50' : status === TimerStatus.RUNNING ? 'border-indigo-500 shadow-indigo-500/20' : 'border-gray-700'}
        `}>
          {/* Status Text inside Circle */}
          {status === TimerStatus.RUNNING && (
            <div className="absolute top-12 text-xs font-bold tracking-widest text-indigo-400 animate-pulse">
              {t('running').toUpperCase()}
            </div>
          )}
          
          {isRinging ? (
             <div className="text-center">
               <div className="flex flex-col items-center">
                <div className="text-5xl mb-2">⏰</div>
                <div className="text-red-500 font-bold text-xl uppercase tracking-widest">
                  {t('timeUp')}
                </div>
                <div className="flex items-center mt-2 text-sm text-gray-400">
                  <Volume2 size={16} className="mr-1 animate-pulse" />
                  <span>{t('alarmRinging')}</span>
                </div>
              </div>
             </div>
          ) : (
            <div className="text-center flex flex-col items-center">
              <div className="font-mono text-5xl sm:text-6xl font-bold text-white tabular-nums tracking-tighter">
                {String(displayTime.h).padStart(2, '0')}:
                {String(displayTime.m).padStart(2, '0')}:
                {String(displayTime.s).padStart(2, '0')}
              </div>
              {status === TimerStatus.IDLE && (
                 <p className="text-gray-500 text-xs mt-4">{t('setDuration').toUpperCase()}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="w-full space-y-6">
        
        {/* Inputs (Only show when IDLE) */}
        {status === TimerStatus.IDLE && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col items-center">
              <label className="text-xs text-gray-500 mb-1">{t('hours').toUpperCase()}</label>
              <input
                type="number"
                value={getInputValue('hours', hours)}
                onFocus={() => handleFocus('hours', hours)}
                onBlur={() => handleBlur('hours', setHours)}
                onChange={(e) => {
                  const value = e.target.value;
                  setTempValues(prev => ({ ...prev, hours: value }));
                  handleInputChange(setHours, value, 99);
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-center text-xl text-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col items-center">
              <label className="text-xs text-gray-500 mb-1">{t('minutes').toUpperCase()}</label>
              <input
                type="number"
                value={getInputValue('minutes', minutes)}
                onFocus={() => handleFocus('minutes', minutes)}
                onBlur={() => handleBlur('minutes', setMinutes)}
                onChange={(e) => {
                  const value = e.target.value;
                  setTempValues(prev => ({ ...prev, minutes: value }));
                  handleInputChange(setMinutes, value, 59);
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-center text-xl text-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col items-center">
              <label className="text-xs text-gray-500 mb-1">{t('seconds').toUpperCase()}</label>
              <input
                type="number"
                value={getInputValue('seconds', seconds)}
                onFocus={() => handleFocus('seconds', seconds)}
                onBlur={() => handleBlur('seconds', setSeconds)}
                onChange={(e) => {
                  const value = e.target.value;
                  setTempValues(prev => ({ ...prev, seconds: value }));
                  handleInputChange(setSeconds, value, 59);
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-center text-xl text-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-center items-center space-x-4">
            {/* Clean Button - Only show when not running */}
            {status !== TimerStatus.RUNNING && !isRinging && (
              <button
                onClick={clearAllInputs}
                className="flex items-center justify-center h-12 px-6 space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full font-medium transition-colors"
              >
                <Trash2 size={16} />
                <span>{t('clean').toUpperCase()}</span>
              </button>
            )}
          {isRinging ? (
            <button
              onClick={stopAlarm}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-red-900/50 transition-transform active:scale-95"
            >
              <BellOff size={20} />
              <span>{t('dismiss').toUpperCase()}</span>
            </button>
          ) : (
            <>
              {status === TimerStatus.RUNNING ? (
                <button
                  onClick={pauseTimer}
                  className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-500 text-white px-8 py-3 rounded-full font-bold transition-transform active:scale-95"
                >
                  <Pause size={20} />
                  <span>{t('pause').toUpperCase()}</span>
                </button>
              ) : (
                <button
                  onClick={startTimer}
                  className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-indigo-900/50 transition-transform active:scale-95"
                >
                  <Play size={20} />
                  <span>{status === TimerStatus.PAUSED ? t('resume').toUpperCase() : t('start').toUpperCase()}</span>
                </button>
              )}

              {(status === TimerStatus.PAUSED || status === TimerStatus.RUNNING) && (
                <button
                  onClick={resetTimer}
                  className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-3 rounded-full font-semibold transition-colors"
                >
                  <RotateCcw size={18} />
                  <span>{t('reset').toUpperCase()}</span>
                </button>
              )}
            </>
          )}
          </div>
          
          {/* Spacer to maintain layout when Clean button is hidden */}
          {!isRinging && status === TimerStatus.RUNNING && (
            <div className="w-32"></div>
          )}
        </div>
      </div>
    </div>
  );
};