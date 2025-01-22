import React from 'react';
import { useAuth } from '../context/AuthContext';

function SessionTimer() {
  const { remainingTime } = useAuth();
  
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerClass = () => {
    if (remainingTime <= 10000) return 'session-timer warning'; // Last 10 seconds
    return 'session-timer';
  };

  return (
    <div className={getTimerClass()}>
      Session expires in: {formatTime(remainingTime)}
    </div>
  );
}

export default SessionTimer; 