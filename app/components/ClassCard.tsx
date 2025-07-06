'use client';

import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Lock, Play, CheckCircle, Clock } from 'lucide-react';

interface ClassCardProps {
  classItem: {
    id: number;
    title: string;
    description: string;
    classNumber: string;
    duration: string;
    videoUrl: string;
    posterUrl: string;
    assessments: any[];
  };
  index: number;
  isLocked: { locked: boolean; reason: string };
  timer: number | null;
}

const ClassCard: React.FC<ClassCardProps> = ({ classItem, index, isLocked, timer }) => {
  const { setSelectedClassId, setActiveTab, videoWatched, assessmentCompleted } = useAppContext();

  // Cool blues and whites gradients
  const getGradientColor = (index: number, isLocked: boolean) => {
    if (isLocked) {
      return 'from-gray-400 to-gray-500'; // Gray for locked classes
    }
    
    const gradients = [
      'from-blue-400 to-blue-500',   // Light blue
      'from-blue-500 to-blue-600',   // Medium blue
      'from-blue-300 to-blue-400',   // Very light blue
      'from-blue-600 to-blue-700',   // Darker blue
      'from-sky-400 to-sky-500',     // Sky blue
      'from-indigo-400 to-indigo-500', // Indigo blue
    ];
    return gradients[index % gradients.length];
  };

  // Check if class is completed
  const classId = classItem.id.toString();
  const isVideoWatched = videoWatched[classId];
  const allAssessmentsCompleted = classItem.assessments.length > 0
    ? classItem.assessments.every((assessment) => assessmentCompleted[assessment.id.toString()])
    : true;
  const isCompleted = isVideoWatched && allAssessmentsCompleted;

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md ${
        isLocked.locked 
          ? 'opacity-75 cursor-not-allowed bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600' 
          : 'cursor-pointer hover:-translate-y-1 hover:shadow-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
      } ${isCompleted && !isLocked.locked ? 'ring-2 ring-green-200 dark:ring-green-800' : ''}`}
      onClick={() => {
        if (!isLocked.locked) {
          setSelectedClassId(classItem.id.toString());
          setActiveTab('');
          sessionStorage.setItem('selectedClassId', classItem.id.toString());
        }
      }}
    >
      {/* Header with image background */}
      <div className="relative h-20 flex items-center justify-center text-white">
        <img
          src="/class-card.jpg"
          alt="Class Card Header"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ zIndex: 0 }}
        />
        {/* Overlay for locked classes */}
        {isLocked.locked && (
          <div className="absolute inset-0 bg-black/60 z-10" />
        )}
        {/* Overlay for available/completed classes (slight blue tint for effect) */}
        {!isLocked.locked && (
          <div className="absolute inset-0 bg-blue-900/30 z-10" />
        )}
        <div className="relative z-20 flex items-center gap-2">
          {isLocked.locked ? (
            <Lock className="w-5 h-5 text-gray-200" />
          ) : isCompleted ? (
            <CheckCircle className="w-5 h-5 text-green-200" />
          ) : (
            <Play className="w-5 h-5 text-blue-200" />
          )}
          <span className="text-center px-4 text-lg font-medium drop-shadow">
            {classItem.classNumber || `Class ${index + 1}`}
          </span>
        </div>
        {/* Status badges */}
        {/* {isLocked.locked && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-20">
            <Lock className="w-3 h-3" />
          </div>
        )} */}
        {isCompleted && !isLocked.locked && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full z-20">
            <CheckCircle className="w-3 h-3" />
          </div>
        )}
        {/* Timer indicator */}
        {timer !== null && timer > 0 && !isLocked.locked && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full z-20">
            <Clock className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className={`text-base font-semibold mb-3 line-clamp-2 ${
          isLocked.locked 
            ? 'text-gray-500 dark:text-gray-400' 
            : 'text-gray-900 dark:text-gray-100'
        }`}>
          {classItem.title}
        </h3>
        
        {classItem.description && (
          <p className={`text-sm mb-3 line-clamp-2 ${
            isLocked.locked 
              ? 'text-gray-400 dark:text-gray-500' 
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {classItem.description}
          </p>
        )}

        {/* Progress and duration */}
        <div className="flex items-center justify-between">
          {/* Duration */}
          {classItem.duration && (
            <div className={`flex items-center gap-2 text-sm ${
              isLocked.locked 
                ? 'text-gray-400 dark:text-gray-500' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              <span className="w-4 h-4">⏱️</span>
              <span>{classItem.duration}</span>
            </div>
          )}
          
          {/* Assessment count */}
          {classItem.assessments.length > 0 && (
            <div className={`flex items-center gap-2 text-sm ${
              isLocked.locked 
                ? 'text-gray-400 dark:text-gray-500' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              <span className="w-4 h-4">📝</span>
              <span>{classItem.assessments.length} assessment{classItem.assessments.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Lock reason - More prominent for locked classes */}
        {isLocked.locked && (
          <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="text-sm text-orange-600 dark:text-orange-400 flex items-center gap-2">
              <Lock className="w-4 h-4 flex-shrink-0 text-orange-400 dark:text-orange-300" />
              <span className="text-xs font-medium">{isLocked.reason}</span>
            </div>
          </div>
        )}

        {/* Completion status */}
        {isCompleted && !isLocked.locked && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-medium">Completed</span>
            </div>
          </div>
        )}

        {/* Timer status */}
        {timer !== null && timer > 0 && !isLocked.locked && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-medium">Available for {Math.floor(timer / 60)}m {timer % 60}s</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassCard;