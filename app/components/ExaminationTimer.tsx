// app/components/ExaminationTimer.tsx
'use client';

import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

export default function ExaminationTimer({ onTimeUp }) {
    const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let timer;
        if (isRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        onTimeUp();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isRunning, timeLeft, onTimeUp]);

    const startTimer = () => {
        setIsRunning(true);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

  return (
    <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 z-50">
      <div className="flex items-center justify-between">
        <Timer className="h-5 w-5 text-gray-600" />
        <span className="font-mono text-xl">{formatTime(timeLeft)}</span>
        {!isRunning && timeLeft === 3600 && (
          <button
            onClick={startTimer}
            className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Start Exam
          </button>
        )}
      </div>
    </div>
  );
}

