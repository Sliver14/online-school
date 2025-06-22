'use client';

import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Lock } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface AssessmentData {
  id: number;
  title: string;
  questions: Question[];
}

interface VideoData {
  id: number;
  title: string;
  videoUrl: string;
  classNumber: number;
  videoPosterUrl?: string;
  order: number;
}

interface ResourceData {
  id: number;
  title: string;
  type: 'READ' | 'ESSAY' | 'VIDEO' | 'LINK' | 'ASSIGNMENT' | 'NOTE';
  content?: string;
  resourceUrl?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface ClassCardProps {
  classItem: {
    id: number;
    title: string;
    description: string;
    classNumber: string;
    duration: string;
    videoUrl: string;
    posterUrl: string;
    videos: VideoData[];
    assessments: AssessmentData[];
    resources: ResourceData[];
  };
  index: number;
  isLocked: { locked: boolean; reason: string };
}

const ClassCard: React.FC<ClassCardProps> = ({ classItem, index, isLocked }) => {
  const { setSelectedClassId, setActiveTab } = useAppContext();

  // Generate a color gradient based on index
  const getGradientColor = (index: number) => {
    const gradients = [
      'from-primary-400 to-secondary-400', // #9d4edd to #ffb347
      'from-success-400 to-info-400', // #4ade80 to #38bdf8
      'from-warning-400 to-error-400', // #f59e0b to #f87171
      'from-primary-500 to-secondary-500', // #7b2cbf to #FF9900
      'from-info-400 to-success-400', // #38bdf8 to #4ade80
      'from-error-400 to-warning-400', // #f87171 to #f59e0b
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div
      className={`rounded-lg border border-neutral-200 dark:border-dark-border-primary overflow-hidden transition-all duration-300 backdrop-blur-sm bg-neutral-50 dark:bg-dark-bg-tertiary ${
        isLocked.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1 hover:border-primary-400 dark:hover:border-primary-400'
      }`}
      onClick={() => {
        if (!isLocked.locked) {
          setSelectedClassId(classItem.id.toString());
          setActiveTab(''); // Clear active tab when navigating to ClassView
          sessionStorage.setItem('selectedClassId', classItem.id.toString()); // Save to sessionStorage
        }
      }}
    >
      <div className={`h-16 bg-gradient-to-r ${getGradientColor(index)} flex items-center justify-center text-white dark:text-dark-text-primary text-lg font-semibold relative`}>
        <span className="text-center px-4 text-sm">{classItem.classNumber || `Class ${index + 1}`}</span>
        {isLocked.locked && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-error-500 dark:bg-error-700 text-white text-xs p-2 rounded-full">
            <Lock className="w-3 h-3" />
            {/* Locked */}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-base sm:text-sm font-semibold mb-2 text-neutral-700 dark:text-dark-text-primary desktop_h3 tablet_h3 mobile_h3">
          {classItem.title}
        </h3>
        {classItem.description && (
          <p className="text-sm mb-2 text-neutral-500 dark:text-dark-text-muted desktop_paragraph tablet_paragraph mobile_paragraph">
            {classItem.description}
          </p>
        )}

        {/* Duration display */}
        {classItem.duration && (
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-dark-text-muted desktop_paragraph tablet_paragraph mobile_paragraph">
            <span>⏱️</span>
            <span>{classItem.duration}</span>
          </div>
        )}

        {/* Assessments count */}
        {classItem.assessments.length > 0 && (
          <div className="mt-2 text-sm text-neutral-500 dark:text-dark-text-muted desktop_paragraph tablet_paragraph mobile_paragraph">
            Assessments: {classItem.assessments.length}
          </div>
        )}

        {/* Lock reason */}
        {isLocked.locked && (
          <div className="mt-2 text-sm text-error-500 dark:text-error-400 flex items-center gap-1 desktop_paragraph tablet_paragraph mobile_paragraph">
            <Lock className="w-4 h-4" />
            {isLocked.reason}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassCard;