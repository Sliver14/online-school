import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-neutral-200 dark:bg-dark-bg-secondary rounded ${className}`}
        />
      ))}
    </>
  );
};

export const ClassCardSkeleton: React.FC = () => (
  <div className="rounded-xl border border-neutral-200 dark:border-dark-border-primary overflow-hidden animate-pulse bg-neutral-50 dark:bg-dark-bg-tertiary">
    <div className="h-20 bg-neutral-200 dark:bg-dark-bg-secondary"></div>
    <div className="p-6">
      <div className="h-6 bg-neutral-200 dark:bg-dark-bg-secondary rounded mb-2"></div>
      <div className="h-4 bg-neutral-200 dark:bg-dark-bg-secondary rounded w-2/3 mb-4"></div>
      <div className="h-2 bg-neutral-200 dark:bg-dark-bg-secondary rounded mb-2"></div>
      <div className="h-3 bg-neutral-200 dark:bg-dark-bg-secondary rounded"></div>
    </div>
  </div>
);

export const StatCardSkeleton: React.FC = () => (
  <div className="p-6 rounded-xl border border-neutral-100 dark:border-dark-border-primary backdrop-blur-sm bg-neutral-50 dark:bg-dark-bg-tertiary">
    <div className="flex items-center">
      <div className="flex-shrink-0 flex items-center justify-center mr-4">
        <div className="w-12 h-12 bg-neutral-200 dark:bg-dark-bg-secondary rounded"></div>
      </div>
      <div className="flex flex-col justify-center">
        <div className="h-8 bg-neutral-200 dark:bg-dark-bg-secondary rounded mb-2"></div>
        <div className="h-4 bg-neutral-200 dark:bg-dark-bg-secondary rounded w-24"></div>
      </div>
    </div>
  </div>
);

export const VideoPlayerSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-dark-bg-tertiary rounded-xl shadow-lg overflow-hidden">
    <div className="p-6 pb-4">
      <div className="h-6 bg-neutral-200 dark:bg-dark-bg-secondary rounded mb-4"></div>
    </div>
    <div className="px-6 pb-6">
      <div className="aspect-video bg-neutral-200 dark:bg-dark-bg-secondary rounded-lg"></div>
    </div>
  </div>
);

export const AssessmentSkeleton: React.FC = () => (
  <div className="p-4 rounded-lg border border-neutral-200 dark:border-dark-border-secondary bg-neutral-100 dark:bg-dark-bg-secondary">
    <div className="h-5 bg-neutral-200 dark:bg-dark-bg-primary rounded mb-2"></div>
    <div className="h-4 bg-neutral-200 dark:bg-dark-bg-primary rounded w-1/2 mb-3"></div>
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-4 bg-neutral-200 dark:bg-dark-bg-primary rounded"></div>
      ))}
    </div>
  </div>
); 