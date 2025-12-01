import React, { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle2 } from 'lucide-react';

export const AlarmSection: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [alarmTime, setAlarmTime] = useState<string>(''); // Format "HH:mm"
  const [isAlarmActive, setIsAlarmActive] = useState<boolean>(false);
  const [isRinging, setIsRinging] = useState<boolean>(false);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Check alarm trigger
      if (isAlarmActive && !isRinging && alarmTime) {
        const [alarmHours, alarmMinutes] = alarmTime.split(':').map(Number);
        if (
          now.getHours() === alarmHours &&
          now.getMinutes() === alarmMinutes &&
          now.getSeconds() === 0
        ) {
          setIsRinging(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [alarmTime, isAlarmActive, isRinging]);

  const toggleAlarm = () => {
    if (!alarmTime) return;
    setIsAlarmActive(!isAlarmActive);
    setIsRinging(false);
  };

  const stopAlarm = () => {
    setIsRinging(false);
    setIsAlarmActive(false); // Turn off alarm after it rings
  };

  const formatDisplayTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return { hours, minutes, seconds };
  };

  const { hours, minutes, seconds } = formatDisplayTime(currentTime);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      
      {/* Alarm Status Indicator */}
      <div className="mb-8 flex flex-col items-center space-y-2">
         <span className={`text-xs font-bold tracking-widest uppercase py-1 px-3 rounded-full ${isAlarmActive ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-500'}`}>
            {isAlarmActive ? `Alarm Set for ${alarmTime}` : 'Alarm Off'}
         </span>
      </div>

      {/* Main Clock Display */}
      <div className={`relative mb-12 transition-all duration-300 ${isRinging ? 'animate-shake' : ''}`}>
        
        {/* Ringing Glow */}
        {isRinging && (
           <div className="absolute inset-0 rounded-3xl bg-amber-500/30 blur-2xl animate-pulse-red"></div>
        )}

        <div className={`
          relative z-10 bg-gray-900 border-4 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col items-center justify-center min-w-[300px]
          ${isRinging ? 'border-amber-500 shadow-amber-500/40' : 'border-gray-800 shadow-black/50'}
        `}>
          {isRinging ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 rounded-[inherit] z-20">
                <Bell className="w-16 h-16 text-amber-500 animate-bounce mb-4" />
                <h3 className="text-2xl font-bold text-white">WAKE UP</h3>
             </div>
          ) : null}

          <div className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide">Current Time</div>
          <div className="flex items-baseline space-x-2 font-mono text-white">
            <span className="text-6xl sm:text-7xl font-bold">{hours}:{minutes}</span>
            <span className="text-2xl sm:text-3xl text-gray-500 font-medium">{seconds}</span>
          </div>
        </div>
      </div>

      {/* Alarm Controls */}
      <div className="w-full bg-gray-900/80 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
        
        {isRinging ? (
          <div className="flex justify-center">
             <button
              onClick={stopAlarm}
              className="w-full flex items-center justify-center space-x-3 bg-amber-600 hover:bg-amber-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-amber-900/50 transition-all animate-pulse"
            >
              <BellOff size={24} />
              <span>STOP ALARM</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="alarm-time" className="text-gray-400 text-xs font-semibold uppercase ml-1">Set Alarm Time</label>
              <input
                id="alarm-time"
                type="time"
                value={alarmTime}
                onChange={(e) => {
                  setAlarmTime(e.target.value);
                  if (isAlarmActive) setIsAlarmActive(false); // Reset active state if time changes
                }}
                className="w-full bg-gray-950 border border-gray-700 text-white text-2xl p-4 rounded-xl focus:outline-none focus:border-amber-500 transition-colors [color-scheme:dark]" 
                // [color-scheme:dark] ensures the browser time picker is dark mode
              />
            </div>

            <button
              onClick={toggleAlarm}
              disabled={!alarmTime}
              className={`
                flex items-center justify-center space-x-2 py-4 rounded-xl font-bold text-lg transition-all
                ${!alarmTime ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : ''}
                ${alarmTime && isAlarmActive 
                  ? 'bg-green-600/20 text-green-400 border border-green-600/50 hover:bg-green-600/30' 
                  : alarmTime && !isAlarmActive 
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20' 
                    : ''
                }
              `}
            >
              {isAlarmActive ? (
                <>
                  <CheckCircle2 size={24} />
                  <span>Alarm Active</span>
                </>
              ) : (
                <>
                  <Bell size={24} />
                  <span>Set Alarm</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};