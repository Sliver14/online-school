import dynamic from 'next/dynamic';

// Lazy load heavy components
export const LazyClassView = dynamic(() => import('./ClassView'), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-dark-bg-primary">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 border-primary-400 dark:border-primary-400"></div>
        <p className="desktop_paragraph tablet_paragraph mobile_paragraph text-neutral-500 dark:text-dark-text-muted">
          Loading class content...
        </p>
      </div>
    </div>
  ),
  ssr: false,
});

export const LazyAssessmentModal = dynamic(() => import('./AssessmentModal'), {
  loading: () => (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-neutral-50 dark:bg-dark-bg-tertiary rounded-xl p-6 max-w-md w-full mx-4 border border-neutral-100 dark:border-dark-border-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 border-primary-400 dark:border-primary-400"></div>
          <p className="desktop_paragraph tablet_paragraph mobile_paragraph text-neutral-500 dark:text-dark-text-muted">
            Loading assessment...
          </p>
        </div>
      </div>
    </div>
  ),
  ssr: false,
});

export const LazyVideoPlayer = dynamic(() => import('./VideoPlayer'), {
  loading: () => (
    <div className="bg-white dark:bg-dark-bg-tertiary rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 pb-4">
        <div className="h-6 bg-neutral-200 dark:bg-dark-bg-secondary rounded mb-4"></div>
      </div>
      <div className="px-6 pb-6">
        <div className="aspect-video bg-neutral-200 dark:bg-dark-bg-secondary rounded-lg"></div>
      </div>
    </div>
  ),
  ssr: false,
}); 