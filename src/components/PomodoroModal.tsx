import React, { useState, useEffect, useRef } from 'react';
import { showToast } from './Toast';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  pomoSessions: number;
  incrementSessions: () => void;
  studyHours: string;
}

type TimerMode = 'focus' | 'short' | 'long';

export const PomodoroModal: React.FC<PomodoroModalProps> = ({
  isOpen,
  onClose,
  pomoSessions,
  incrementSessions,
  studyHours,
}) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  
  // Custom durations per mode in minutes
  const [durations, setDurations] = useState<Record<TimerMode, number>>(() => {
    try {
      const stored = localStorage.getItem('pomo_custom_durations');
      if (stored) return JSON.parse(stored);
    } catch (_) {}
    return { focus: 25, short: 5, long: 15 };
  });

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('pomo_custom_durations');
      if (stored) {
        const parsed = JSON.parse(stored);
        return (parsed.focus || 25) * 60;
      }
    } catch (_) {}
    return 25 * 60;
  });

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<any | null>(null);

  const getDuration = (m: TimerMode) => {
    return (durations[m] || 25) * 60;
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(getDuration(newMode));
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleDurationChange = (mins: number) => {
    if (isNaN(mins) || mins < 1) return;
    const next = { ...durations, [mode]: mins };
    setDurations(next);
    setTimeLeft(mins * 60);
    setIsRunning(false);
    try {
      localStorage.setItem('pomo_custom_durations', JSON.stringify(next));
    } catch (_) {}
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            
            // Finished session!
            if (mode === 'focus') {
              incrementSessions();
              showToast('🏆 Focus session complete! Time for a break.', 'rgba(0,217,160,.12)');
            } else {
              showToast('⏱ Break finished! Ready to focus?', 'rgba(79,168,255,.12)');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, incrementSessions]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // SVG ring variables
  const r = 70;
  const circ = 2 * Math.PI * r; // ~439.8
  const totalDur = getDuration(mode);
  const strokeDashoffset = circ - (timeLeft / totalDur) * circ;

  return (
    <div 
      className={`modal ${isOpen ? 'open' : ''}`} 
      id="pomo-modal"
      style={{ display: isOpen ? 'flex' : 'none' }}
    >
      <div className="modal-box">
        <button className="modal-close" id="pomo-close" onClick={onClose}>✕</button>
        <div className="modal-title">⏱ Focus Timer</div>
        
        <div className="pomo-mode-row">
          <button 
            className={`pomo-mode-btn ${mode === 'focus' ? 'active' : ''}`} 
            onClick={() => handleModeChange('focus')}
          >
            {durations.focus}m
          </button>
          <button 
            className={`pomo-mode-btn ${mode === 'short' ? 'active' : ''}`} 
            onClick={() => handleModeChange('short')}
          >
            {durations.short}m
          </button>
          <button 
            className={`pomo-mode-btn ${mode === 'long' ? 'active' : ''}`} 
            onClick={() => handleModeChange('long')}
          >
            {durations.long}m
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: '10px 0 6px', fontSize: '11px', color: 'var(--sub)' }}>
          <label htmlFor="pomo-custom-input" style={{ fontFamily: 'var(--mono)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Set Minutes:</label>
          <input
            id="pomo-custom-input"
            type="number"
            min="1"
            max="180"
            value={durations[mode] || ''}
            onChange={(e) => handleDurationChange(Number(e.target.value))}
            style={{
              width: '54px',
              background: 'var(--s2)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text)',
              textAlign: 'center',
              padding: '3px 6px',
              fontFamily: 'var(--mono)',
              fontSize: '11px',
              outline: 'none'
            }}
          />
        </div>

        <div className="pomo-ring">
          <svg className="pomo-svg" width="140" height="140" viewBox="0 0 170 170">
            <circle className="pomo-track" cx="85" cy="85" r={r} />
            <circle 
              className="pomo-prog" 
              id="pomo-prog" 
              cx="85" 
              cy="85" 
              r={r} 
              style={{
                strokeDasharray: `${circ}`,
                strokeDashoffset: `${strokeDashoffset}`
              }}
            />
          </svg>
          <div className="pomo-time">
            <div className="pomo-time-num" id="pomo-num">
              {formatTime(timeLeft)}
            </div>
            <div className="pomo-time-lbl" id="pomo-lbl">
              {mode === 'focus' ? 'FOCUS' : 'BREAK'}
            </div>
          </div>
        </div>

        <div className="pomo-controls">
          <button className="pomo-ctrl-btn reset" id="pomo-reset" onClick={resetTimer}>↺</button>
          <button className="pomo-ctrl-btn main" id="pomo-play" onClick={toggleTimer}>
            {isRunning ? '⏸' : '▶'}
          </button>
        </div>

        <div className="pomo-sessions" id="pomo-sessions">
          Sessions: {pomoSessions} · {studyHours} hrs
        </div>
      </div>
    </div>
  );
};
export default PomodoroModal;
