'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Lock, Unlock, ChevronDown, Book, TrendingUp, CheckCircle, Calendar, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SideBar from './components/SideBar';
import Classes from './components/Classes';
import { LazyClassView } from './components/LazyComponents';
import { AppProvider, useAppContext } from './context/AppContext';
import { useUser } from './context/UserContext';
import ThemeToggle from './components/ThemeToggle';
import { Toaster, toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

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

// const { logout } = useUser();
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
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // ✅ correct
  const renderCount = useRef(0);
  const { userId, userDetails, userLoading, userError, logout } = useUser();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Redirect unauthenticated users
  useEffect(() => {
    console.log('Home Page - User:', { userId, userLoading, userError, path: window.location.pathname });
    if (userLoading) return;
    if (!userId) {
      // toast('Please sign in to access your classes', { icon: 'ℹ️' });
      router.replace('/welcome');
    }
    if (userError) {
      toast.error(userError);
    }
  }, [userId, userLoading, userError, router]);

  // Load selectedClassId from sessionStorage
  useEffect(() => {
    const storedClassId = sessionStorage.getItem('selectedClassId');
    if (storedClassId && !selectedClassId) {
      setSelectedClassId(storedClassId);
      setActiveTab('');
    }
  }, [setSelectedClassId, setActiveTab]);

  // Push history state when entering ClassView and listen for popstate
  useEffect(() => {
    if (selectedClassId) {
      window.history.pushState({ view: 'classView', classId: selectedClassId }, '', `/class/${selectedClassId}`);
    }

    const handlePopState = (event: PopStateEvent) => {
      if (!event.state || event.state.view !== 'classView') {
        setSelectedClassId(null);
        setActiveTab('classes');
        sessionStorage.removeItem('selectedClassId');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedClassId, setSelectedClassId, setActiveTab]);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`OnlineSchool rendered ${renderCount.current} times`);
  });

  useEffect(() => {
    if (classes.length >= 0) {
      console.log('Classes loaded, setting loading to false');
      setLoadingClasses(false);
    }
  }, [classes]);

  const totalClasses = classes.length;
  const completedClasses = classes.reduce((count, classItem) => {
    // Add null check for classItem.id
    if (!classItem || classItem.id == null) return count;
    
    const classId = classItem.id.toString();
    const isVideoWatched = videoWatched[classId];
    const allAssessmentsCompleted =
      classItem.assessments.length > 0
        ? classItem.assessments.every((assessment) => {
            // Add null check for assessment.id
            if (!assessment || assessment.id == null) return false;
            return assessmentCompleted[assessment.id.toString()];
          })
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

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // const handleUpdateProfile = () => {
  //   setDropdownOpen(false);
  //   router.push('/profile');
  // };

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      Cookies.remove('authToken', { path: '/' });
      logout(); // Clear context state
      toast.success('Logged out successfully');
      router.replace('/welcome');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
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
            {
              value: totalClasses.toString(),
              label: 'Total Classes',
              color: 'secondary-500',
              icon: <Book className="w-12 h-12 text-secondary-500" />,
            },
            {
              value: `${overallProgress}%`,
              label: 'Overall Progress',
              color: 'success-500',
              icon: <TrendingUp className="w-12 h-12 text-success-500" />,
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-neutral-100 dark:border-dark-border-primary backdrop-blur-sm bg-neutral-50 dark:bg-dark-bg-tertiary"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center justify-center mr-4">
                  {stat.icon}
                </div>
                <div className="flex flex-col justify-center">
                  <div className={`font-bold text-2xl md:text-3xl text-${stat.color}`}>{stat.value}</div>
                  <div className="desktop_paragraph tablet_paragraph mobile_paragraph text-neutral-500 dark:text-dark-text-muted mt-1">{stat.label}</div>
                </div>
              </div>
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
    if (userLoading || loadingClasses) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 border-primary-400 dark:border-primary-400"></div>
          <p className="desktop_paragraph tablet_h2 mobile_h2 text-neutral-500 dark:text-dark-text-muted">Loading...</p>
        </div>
      );
    }

    if (!userId) return null;

    if (selectedClassId) {
      return (
        <LazyClassView
          classId={selectedClassId}
          onBack={() => {
            setSelectedClassId(null);
            setActiveTab('classes');
            sessionStorage.removeItem('selectedClassId');
            window.history.back();
          }}
        />
      );
    }

    return activeTab === 'examinations' ? renderExaminations() : renderClasses();
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-dark-bg-primary">
      <Toaster position="top-right" />
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
            <div className="flex items-center gap-3 relative" ref={dropdownRef}>
              <div className="flex items-center gap-2 cursor-pointer" onClick={toggleDropdown}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-primary-400 dark:bg-primary-400">
                  {initials}
                </div>
                <span className="hidden sm:inline desktop_paragraph tablet_paragraph mobile_paragraph text-neutral-950 dark:text-dark-text-primary">
                  {displayFirstName} {displayLastName}
                </span>
                <ChevronDown className="w-4 h-4 text-neutral-950 dark:text-dark-text-primary" />
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 top-12 w-48 rounded-lg shadow-lg bg-neutral-50 dark:bg-dark-bg-tertiary border border-neutral-100 dark:border-dark-border-primary z-50">
                  <ul className="py-2">
                    <li
                      className="flex items-center justify-between px-4 py-2 text-neutral-950 dark:text-dark-text-primary hover:bg-neutral-100 dark:hover:bg-dark-bg-secondary cursor-pointer desktop_paragraph tablet_paragraph mobile_paragraph"
                      onClick={() => {
                        setDropdownOpen(false);
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        Dark Mode
                      </span>
                      <ThemeToggle />
                    </li>
                    <li
                      className="px-4 py-2 text-neutral-950 dark:text-dark-text-primary hover:bg-neutral-100 dark:hover:bg-dark-bg-secondary cursor-pointer desktop_paragraph tablet_paragraph mobile_paragraph"
                      onClick={handleLogout}
                    >
                      Logout
                    </li>
                  </ul>
                </div>
              )}
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