'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Lock, Unlock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SideBar from './components/SideBar';
import Classes from './components/Classes';
import ClassView from './components/ClassView';
import { AppProvider, useAppContext } from './context/AppContext';
import { useUser } from './context/UserContext';
import ThemeToggle from './components/ThemeToggle';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

interface ClassData {
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
}

const capitalize = (str: string | undefined) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const OnlineSchool = () => {
  const {
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    handleNavClick,
    classes,
    selectedClassId,
    setSelectedClassId,
    videoWatched,
    assessmentCompleted,
  } = useAppContext();
  const [loading, setLoading] = useState(true);
  const renderCount = useRef(0);
  const { userId, userDetails, userLoading, userError } = useUser();
  const router = useRouter();

  // Redirect unauthenticated users
  useEffect(() => {
    console.log('Home Page - User:', { userId, userLoading, userError, path: window.location.pathname });
    if (userLoading) return;
    if (!userId) {
      toast.info('Please sign in to access the dashboard');
      router.replace('/welcome'); // Use replace to avoid history stack issues
    }
    if (userError) {
      toast.error(userError);
      router.replace('/welcome');
    }
  }, [userId, userLoading, userError, router]);

  // Load selectedClassId from sessionStorage
  useEffect(() => {
    if (userLoading || !userId) return;
    const storedClassId = sessionStorage.getItem('selectedClassId');
    if (storedClassId && !selectedClassId) {
      setSelectedClassId(storedClassId);
      setActiveTab(''); // Ensure no tab is active in ClassView
    }
  }, [setSelectedClassId, setActiveTab, userLoading, userId]);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`OnlineSchool rendered ${renderCount.current} times`);
  });

  useEffect(() => {
    if (userLoading || !userId) return;
    if (classes.length >= 0) {
      console.log('Classes loaded, setting loading to false');
      setLoading(false);
    }
  }, [classes, userLoading, userId]);

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-dark-bg-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 border-primary-400 dark:border-primary-400"></div>
          <p className="desktop_paragraph tablet_paragraph mobile_paragraph text-neutral-500 dark:text-dark-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userId) return null;

  const totalClasses = classes.length;
  const completedClasses = classes.reduce((count, classItem) => {
    const classId = classItem.id.toString();
    const isVideoWatched = videoWatched[classId];
    const allAssessmentsCompleted =
      classItem.assessments.length > 0
        ? classItem.assessments.every((assessment) => assessmentCompleted[assessment.id.toString()])
        : true;
    return isVideoWatched && allAssessmentsCompleted ? count + 1 : count;
  }, 0);
  const overallProgress = totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0;

  const initials =
    userDetails?.firstName || userDetails?.lastName
      ? `${userDetails?.firstName?.charAt(0)?.toUpperCase() || ''}${userDetails?.lastName?.charAt(0)?.toUpperCase() || ''}`
      : 'U';

  const displayFirstName = capitalize(userDetails?.firstName) || 'User';
  const displayLastName = capitalize(userDetails?.lastName);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderClasses = () => (
    <>
      <div className="space-y-6 mb-6">
        <h2 className="desktop_h2 tablet_h2 mobile_h2 flex items-center gap-2 text-neutral-950 dark:text-dark-text-primary">
          <div className="w-1 h-8 rounded bg-primary-400 dark:bg-primary-400"></div>
          Overview
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            { value: totalClasses.toString(), label: 'Total Classes', color: 'secondary-500' },
            { value: `${overallProgress}%`, label: 'Overall Progress', color: 'success-500' },
          ].map((stat, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-neutral-100 dark:border-dark-border-primary backdrop-blur-sm bg-neutral-50 dark:bg-dark-bg-tertiary"
            >
              <div className={`desktop_h3 tablet_h3 mobile_h3 font-bold mb-2 text-${stat.color}`}>{stat.value}</div>
              <div className="desktop_paragraph tablet_paragraph mobile_paragraph text-neutral-500 dark:text-dark-text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      <Classes />
    </>
  );

  const renderExaminations = () => {
    const isExamUnlocked = overallProgress === 100;

    return (
      <div className="space-y-6">
        <h2 className="desktop_h2 tablet_h2 mobile_h2 flex items-center gap-2 text-neutral-950 dark:text-dark-text-primary">
          <div className="w-1 h-8 rounded bg-primary-400 dark:bg-primary-400"></div>
          Examinations
        </h2>
        <div className="space-y-4">
          {[
            {
              title: 'Final Exam',
              date: 'Available after completing all classes',
              status: isExamUnlocked ? 'Available' : 'Locked',
              statusColor: isExamUnlocked ? 'success-500' : 'warning-500',
            },
          ].map((exam, index) => (
            <div
              key={index}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-xl border border-neutral-100 dark:border-dark-border-primary backdrop-blur-sm bg-neutral-50 dark:bg-dark-bg-tertiary ${
                isExamUnlocked ? 'cursor-pointer hover:bg-neutral-100 dark:hover:bg-dark-bg-secondary' : 'opacity-60'
              }`}
              onClick={() => {
                if (isExamUnlocked) {
                  router.replace('/examination');
                }
              }}
            >
              <div className="mb-4 sm:mb-0 flex items-center gap-2">
                {isExamUnlocked ? (
                  <Unlock className="w-5 h-5 text-success-500" />
                ) : (
                  <Lock className="w-5 h-5 text-warning-500" />
                )}
                <div>
                  <h3 className="desktop_h3 tablet_h3 mobile_h3 font-semibold text-neutral-950 dark:text-dark-text-primary">{exam.title}</h3>
                  <p className="desktop_paragraph tablet_paragraph mobile_paragraph text-neutral-500 dark:text-dark-text-muted">{exam.date}</p>
                </div>
              </div>
              <span
                className={`px-4 py-2 rounded-lg text-white desktop_paragraph tablet_paragraph mobile_paragraph font-medium self-start sm:self-center bg-${exam.statusColor}`}
              >
                {exam.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 border-primary-400 dark:border-primary-400"></div>
          <p className="desktop_paragraph tablet_paragraph mobile_paragraph text-neutral-500 dark:text-dark-text-muted">Loading...</p>
        </div>
      );
    }

    if (selectedClassId) {
      return (
        <ClassView
          classId={selectedClassId}
          onBack={() => {
            setSelectedClassId(null);
            setActiveTab('classes');
            sessionStorage.removeItem('selectedClassId');
          }}
        />
      );
    }

    return activeTab === 'examinations' ? renderExaminations() : renderClasses();
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-dark-bg-primary">
      <ToastContainer position="top-right" autoClose={3000} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      <SideBar handleNavClick={handleNavClick} sidebarOpen={sidebarOpen} activeTab={activeTab} />
      <div className="lg:pl-72">
        <header className="p-4 lg:p-6 border-b border-neutral-100 dark:border-dark-border-primary bg-neutral-50 dark:bg-dark-bg-tertiary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-lg text-white transition-colors hover:opacity-80 bg-primary-400 dark:bg-primary-400"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h2 className="desktop_h2 tablet_h2 mobile_h2 font-semibold text-neutral-950 dark:text-dark-text-primary">
                Welcome Back, {displayFirstName}!
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-primary-400 dark:bg-primary-400">
                {initials}
              </div>
              <span className="hidden sm:inline desktop_paragraph tablet_paragraph mobile_paragraph text-neutral-950 dark:text-dark-text-primary">
                {displayFirstName} {displayLastName}
              </span>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const OnlineSchoolWithProvider = () => (
  <AppProvider>
    <OnlineSchool />
  </AppProvider>
);

export default function Home() {
  return <OnlineSchoolWithProvider />;
}