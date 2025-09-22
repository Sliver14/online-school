'use client';

import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Lock, Clock } from 'lucide-react';

interface ClassCardProps {
  classItem: {
    id: number;
    title: string;
    description: string;
    classNumber: string; // Could be '1', 'Class 1', 'Class Four(B)', etc.
    duration: string;
    videoUrl: string;
    posterUrl: string;
    assessments: any[];
  };
  index: number;
  isLocked: { locked: boolean; reason: string };
  timer: number | null;
}

// ✅ Cloudinary images for each class
const classImages = {
  'Class 1': 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1750698646/bhxqutynfwmzvwav9qvn.jpg',
  'Class 2': 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1750698644/tm6dab2ppv9dfrjorduh.jpg',
  'Class 3': 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1750698681/yshuzdtxjciwio6umqvx.jpg',
  'Class 4': 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1750698680/rzggefjjb6flfpgzqxpd.jpg',
  'Class 5': 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1750698680/ums5dbfsot0bvuxcg6e9.jpg',
  'Class 6': 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1750698673/kgckhesywqt2uiysbzqw.jpg',
  'Class 7': 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1750698668/mz35ut5sxtg5y0cui9yt.jpg',
  'Class 8': 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1750698674/kfznhzvnd9uyxpk3fa7l.jpg',
};

// ✅ Helpers
const normalizeKey = (key: string) => key.toLowerCase().trim();

const wordsToNumbers: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4,
  five: 5, six: 6, seven: 7, eight: 8,
};

const romanToNumber: Record<string, number> = {
  i: 1, ii: 2, iii: 3, iv: 4,
  v: 5, vi: 6, vii: 7, viii: 8,
};

function extractClassNumber(raw: string): number | null {
  // Digits
  const digitMatch = raw.match(/\d+/);
  if (digitMatch) return parseInt(digitMatch[0], 10);

  const lower = raw.toLowerCase();

  // Words
  for (const word in wordsToNumbers) {
    if (lower.includes(word)) return wordsToNumbers[word];
  }

  // Roman numerals
  for (const roman in romanToNumber) {
    if (lower.includes(roman)) return romanToNumber[roman];
  }

  return null;
}

const ClassCard: React.FC<ClassCardProps> = ({ classItem, index, isLocked, timer }) => {
  const { setSelectedClassId, setActiveTab, videoWatched, assessmentCompleted } = useAppContext();

  const normalizedImageMap: Record<string, string> = Object.fromEntries(
    Object.entries(classImages).map(([k, v]) => [normalizeKey(k), v])
  );

  const raw = classItem?.classNumber?.toString() || '';
  const extractedNumber = extractClassNumber(raw);

  const possibleKeys = extractedNumber
    ? [`Class ${extractedNumber}`, raw, `Class ${raw}`]
    : [raw, `Class ${raw}`];

  const imageKey = possibleKeys
    .map(normalizeKey)
    .find((key) => !!normalizedImageMap[key]);

  const imageUrl =
    (imageKey ? normalizedImageMap[imageKey] : null) ||
    'https://placehold.co/600x400/2D3748/FFFFFF/png?text=Image+Not+Found';

  // 🔍 Debug
  // console.log('[ClassCard] raw:', raw);
  // console.log('[ClassCard] extractedNumber:', extractedNumber);
  // console.log('[ClassCard] possibleKeys:', possibleKeys);
  // console.log('[ClassCard] normalizedKeys:', possibleKeys.map(normalizeKey));
  // console.log('[ClassCard] available normalized keys:', Object.keys(normalizedImageMap));
  // console.log('[ClassCard] matched imageKey:', imageKey);
  // console.log('[ClassCard] imageUrl resolved:', imageUrl);

  // ✅ Completion logic
  const classId = classItem?.id?.toString() || '';
  const isVideoWatched = videoWatched[classId];
  const allAssessmentsCompleted = classItem.assessments.length > 0
    ? classItem.assessments.every((a) => a?.id != null && assessmentCompleted[a.id.toString()])
    : true;

  const isCompleted = isVideoWatched && allAssessmentsCompleted;
  const status = isCompleted ? 'COMPLETED' : isVideoWatched ? 'IN PROGRESS' : 'NOT STARTED';

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md ${
        isLocked.locked 
          ? 'opacity-75 cursor-not-allowed bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600' 
          : 'cursor-pointer hover:-translate-y-1 hover:shadow-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
      } ${isCompleted && !isLocked.locked ? 'ring-2 ring-green-200 dark:ring-green-800' : ''}`}
      onClick={() => {
        if (!isLocked.locked && classItem?.id != null) {
          setSelectedClassId(classItem.id.toString());
          setActiveTab('');
          sessionStorage.setItem('selectedClassId', classItem.id.toString());
        }
      }}
    >
      {/* Header image */}
      <div className="relative h-20 md:h-48 flex items-center justify-center text-white">
        <img
          src={imageUrl}
          alt={`${classItem.classNumber} Header`}
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ zIndex: 0 }}
        />

        {/* Dark overlay */}
        {isLocked.locked && <div className="absolute inset-0 bg-black/60 z-10" />}
        {!isLocked.locked && <div className="absolute inset-0 bg-blue-900/30 z-10" />}

        {/* Status Badge with black preset background */}
        {!isLocked.locked && (
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent z-20 p-2 flex justify-end">
            <div className="flex items-center gap-1 bg-gray-900/80 text-white text-xs px-2 py-1 rounded-full">
              <span>{status}</span>
            </div>
          </div>
        )}

        {/* Timer Badge */}
        {timer !== null && timer > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full z-20">
            <Clock className="w-3 h-3" />
          </div>
        )}
      </div>


      {/* Content */}
      <div className="p-5">
        <h3
          className={`text-base font-semibold mb-3 line-clamp-2 ${
            isLocked.locked
              ? 'text-gray-500 dark:text-gray-400'
              : 'text-gray-900 dark:text-gray-100'
          }`}
        >
          {classItem.title}
        </h3>

        {classItem.description && (
          <p
            className={`text-sm mb-3 line-clamp-2 ${
              isLocked.locked
                ? 'text-gray-400 dark:text-gray-500'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {classItem.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          {classItem.duration && (
            <div
              className={`flex items-center gap-2 text-sm ${
                isLocked.locked
                  ? 'text-gray-400 dark:text-gray-500'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <span className="w-4 h-4">⏱️</span>
              <span>{classItem.duration}</span>
            </div>
          )}
        </div>

        {isLocked.locked && (
          <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="text-sm text-orange-600 dark:text-orange-400 flex items-center gap-2">
              <Lock className="w-4 h-4 flex-shrink-0 text-orange-400 dark:text-orange-300" />
              <span className="text-xs font-medium">{isLocked.reason}</span>
            </div>
          </div>
        )}

        {timer !== null && timer > 0 && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-medium">
                Available for {Math.floor(timer / 60)}m {timer % 60}s
              </span>
            </div>
          </div>
        )}

        {!isLocked.locked && (
          <div className="mt-4">
            <button
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (!isLocked.locked && classItem?.id != null) {
                  setSelectedClassId(classItem.id.toString());
                  setActiveTab('');
                  sessionStorage.setItem('selectedClassId', classItem.id.toString());
                }
              }}
            >
              {isCompleted
                ? 'Review Class'
                : isVideoWatched
                ? 'Continue Learning'
                : 'Start Class'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassCard;
