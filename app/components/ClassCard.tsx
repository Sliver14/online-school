'use client';

import React from 'react';
import { colors } from '@/lib/constants';
import { useAppContext } from '../context/AppContext';
import { Lock } from 'lucide-react';

interface ClassCardProps {
  classItem: {
    id: number;
    title: string;
    description: string;
    classNumber: string;
    duration: string;
    videoUrl: string;
    posterUrl: string;
    assessment: any[];
  };
  index: number;
  isLocked: { locked: boolean; reason: string };
}

const ClassCard: React.FC<ClassCardProps> = ({ classItem, index, isLocked }) => {
  const { setSelectedClassId } = useAppContext();

  // Generate a color gradient based on index
  const getGradientColor = (index: number) => {
    const gradients = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-teal-500 to-blue-500'
    ];
    return gradients[index % gradients.length];
  };

  return (
      <div
          className={`rounded-xl border border-slate-700 overflow-hidden transition-all duration-300 backdrop-blur-sm ${
              isLocked.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer transform hover:-translate-y-1 hover:border-cyan-400'
          }`}
          style={{ backgroundColor: colors.tertiary }}
          onClick={() => {
            if (!isLocked.locked) {
              setSelectedClassId(classItem.id);
            }
          }}
      >
        <div className={`h-32 bg-gradient-to-r ${getGradientColor(index)} flex items-center justify-center text-white text-lg font-bold relative`}>
          <span className="text-center px-4">{classItem.classNumber || `Class ${index + 1}`}</span>
          {isLocked.locked && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500 bg-opacity-80 text-white text-xs px-2 py-1 rounded-full">
                <Lock className="w-3 h-3" />
                Locked
              </div>
          )}
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
            {classItem.title}
          </h3>
          {classItem.description && (
              <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
                {classItem.description}
              </p>
          )}

          {/* Duration display */}
          {classItem.duration && (
              <div className="flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
                <span>⏱️</span>
                <span>{classItem.duration}</span>
              </div>
          )}

          {/* Lock reason */}
          {isLocked.locked && (
              <div className="mt-2 text-sm text-red-400 flex items-center gap-1">
                <Lock className="w-4 h-4" />
                {isLocked.reason}
              </div>
          )}
        </div>
      </div>
  );
};

export default ClassCard;