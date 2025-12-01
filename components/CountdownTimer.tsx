import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, BellOff } from 'lucide-react';
import { TimerStatus } from '../types';

export const CountdownTimer: React.FC = () => {
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

  const tick = useCallback(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        setStatus(TimerStatus.COMPLETED);
        return 0;
      }
      return prev - 1;
    });
  }, []);

  useEffect(() => {
    if (status === TimerStatus.RUNNING) {
      timerRef.current = setInterval(tick, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, tick]);

  const startTimer = () => {
    if (status === TimerStatus.IDLE || status === TimerStatus.COMPLETED) {
      const total = hours * 3600 + minutes * 60 + seconds;
      if (total === 0) return;
      setTimeLeft(total);
    }
    setStatus(TimerStatus.RUNNING);
  };

  const pauseTimer = () => setStatus(TimerStatus.PAUSED);
  
  const resetTimer = () => {
    setStatus(TimerStatus.IDLE);
    setTimeLeft(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const stopAlarm = () => {
    setStatus(TimerStatus.IDLE);
    setTimeLeft(0);
  };

  const displayTime = status === TimerStatus.IDLE ? { h: hours, m: minutes, s: seconds } : formatTime(timeLeft);
  const isRinging = status === TimerStatus.COMPLETED;

  // Input handlers
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string, max: number) => {
    let num = parseInt(value, 10);
    if (isNaN(num)) num = 0;
    if (num > max) num = max;
    if (num < 0) num = 0;
    setter(num);
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
              RUNNING
            </div>
          )}
          
          {isRinging ? (
             <div className="text-center">
               <div className="text-5xl mb-2">⏰</div>
               <div className="text-red-500 font-bold text-xl uppercase tracking-widest">Time's Up!</div>
             </div>
          ) : (
            <div className="text-center flex flex-col items-center">
              <div className="font-mono text-5xl sm:text-6xl font-bold text-white tabular-nums tracking-tighter">
                {String(displayTime.h).padStart(2, '0')}:
                {String(displayTime.m).padStart(2, '0')}:
                {String(displayTime.s).padStart(2, '0')}
              </div>
              {status === TimerStatus.IDLE && (
                 <p className="text-gray-500 text-xs mt-4">SET DURATION</p>
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
              <label className="text-xs text-gray-500 mb-1">HOURS</label>
              <input
                type="number"
                value={hours}
                onChange={(e) => handleInputChange(setHours, e.target.value, 99)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-center text-xl text-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col items-center">
              <label className="text-xs text-gray-500 mb-1">MINUTES</label>
              <input
                type="number"
                value={minutes}
                onChange={(e) => handleInputChange(setMinutes, e.target.value, 59)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-center text-xl text-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col items-center">
              <label className="text-xs text-gray-500 mb-1">SECONDS</label>
              <input
                type="number"
                value={seconds}
                onChange={(e) => handleInputChange(setSeconds, e.target.value, 59)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-center text-xl text-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          {isRinging ? (
            <button
              onClick={stopAlarm}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-red-900/50 transition-transform active:scale-95"
            >
              <BellOff size={20} />
              <span>Dismiss</span>
            </button>
          ) : (
            <>
              {status === TimerStatus.RUNNING ? (
                <button
                  onClick={pauseTimer}
                  className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-500 text-white px-8 py-3 rounded-full font-bold transition-transform active:scale-95"
                >
                  <Pause size={20} />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={startTimer}
                  className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-indigo-900/50 transition-transform active:scale-95"
                >
                  <Play size={20} />
                  <span>{status === TimerStatus.PAUSED ? 'Resume' : 'Start'}</span>
                </button>
              )}

              {(status === TimerStatus.PAUSED || status === TimerStatus.RUNNING) && (
                <button
                  onClick={resetTimer}
                  className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-3 rounded-full font-semibold transition-colors"
                >
                  <RotateCcw size={18} />
                  <span>Reset</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};