'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import SideBar from './components/SideBar';
import Classes from './components/Classes';
import ClassView from './components/ClassView';
import { AppProvider, useAppContext } from './context/AppContext';
import { colors } from '@/lib/constants';
import { useUser } from './context/UserContext';

// Helper function to capitalize first letter
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
        videoWatched,
        assessmentCompleted,
    } = useAppContext();
    const [loading, setLoading] = useState(true);
    const renderCount = useRef(0);
    const { userDetails } = useUser();

    // Debug re-renders
    useEffect(() => {
        renderCount.current += 1;
        console.log(`OnlineSchool rendered ${renderCount.current} times`);
    });

    // Set loading to false once classes are fetched
    useEffect(() => {
        if (classes.length >= 0) {
            console.log('Classes loaded, setting loading to false');
            setLoading(false);
        }
    }, [classes]);

    // Calculate dynamic stats
    const totalClasses = classes.length;
    const completedClasses = classes.reduce((count, classItem) => {
        const classId = classItem.id.toString();
        const isVideoWatched = videoWatched[classId];
        const allAssessmentsCompleted = classItem.assessment.length > 0
            ? classItem.assessment.every((assessment: any) => assessmentCompleted[assessment.id.toString()])
            : true;
        return isVideoWatched && allAssessmentsCompleted ? count + 1 : count;
    }, 0);
    const overallProgress = totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0;

    // Compute initials
    const initials = userDetails?.firstName || userDetails?.lastName
        ? `${userDetails?.firstName?.charAt(0)?.toUpperCase() || ''}${userDetails?.lastName?.charAt(0)?.toUpperCase() || ''}`
        : 'U';

    // Capitalize names
    const displayFirstName = capitalize(userDetails?.firstName) || 'User';
    const displayLastName = capitalize(userDetails?.lastName);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const renderClasses = () => (
        <>
            <div className="space-y-6 mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: colors.text }}>
                    <div className="w-1 h-8 rounded" style={{ backgroundColor: colors.accent }}></div>
                    Overview
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[
                        { value: totalClasses.toString(), label: 'Total Classes', color: colors.secondary },
                        { value: `${overallProgress}%`, label: 'Overall Progress', color: colors.success },
                    ].map((stat, index) => (
                        <div key={index} className="p-6 rounded-xl border border-slate-700 backdrop-blur-sm" style={{ backgroundColor: colors.tertiary }}>
                            <div className="text-3xl font-bold mb-2" style={{ color: stat.color }}>{stat.value}</div>
                            <div className="text-sm" style={{ color: colors.textMuted }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
            <Classes />
        </>
    );

    const renderExaminations = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: colors.text }}>
                <div className="w-1 h-8 rounded" style={{ backgroundColor: colors.accent }}></div>
                Examinations
            </h2>

            <div className="space-y-4">
                {[
                    { title: 'Final Exam', date: '', status: '', statusColor: colors.warning },
                ].map((exam, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-xl border border-slate-700 backdrop-blur-sm" style={{ backgroundColor: colors.tertiary }}>
                        <div className="mb-4 sm:mb-0">
                            <h3 className="font-semibold" style={{ color: colors.text }}>{exam.title}</h3>
                            <p className="text-sm" style={{ color: colors.textMuted }}>{exam.date}</p>
                        </div>
                        <span className="px-4 py-2 rounded-lg text-white text-sm font-medium self-start sm:self-center" style={{ backgroundColor: exam.statusColor }}>
              {exam.status}
            </span>
                    </div>
                ))}
            </div>
        </div>
    );

    // Helper function to check if activeTab is a class ID
    const isClassTab = (tab: string) => {
        if (!classes || !Array.isArray(classes)) {
            return false;
        }
        return classes.some(c => c.id.toString() === tab);
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: colors.accent }}></div>
                    <p style={{ color: colors.textMuted }}>Loading...</p>
                </div>
            );
        }

        if (selectedClassId) {
            return <ClassView classId={selectedClassId} onBack={() => setActiveTab('classes')} />;
        }

        switch (activeTab) {
            case 'classes':
                return renderClasses();
            case 'examinations':
                return renderExaminations();
            default:
                if (isClassTab(activeTab)) {
                    return (
                        <ClassView
                            classId={activeTab}
                            onBack={() => setActiveTab('classes')}
                        />
                    );
                }
                return renderClasses();
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: colors.primary }}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <SideBar
                handleNavClick={handleNavClick}
                sidebarOpen={sidebarOpen}
                colors={colors}
                activeTab={activeTab}
            />

            {/* Main content */}
            <div className="lg:pl-72">
                {/* Header */}
                <header className="p-4 lg:p-6 border-b border-slate-700" style={{ backgroundColor: colors.tertiary }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleSidebar}
                                className="lg:hidden p-2 rounded-lg text-white transition-colors hover:opacity-80"
                                style={{ backgroundColor: colors.accent }}
                            >
                                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                            <div>
                                <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
                                    Welcome Back, {displayFirstName}!
                                </h2>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: colors.accent }}>
                                {initials}
                            </div>
                            <span className="hidden sm:inline" style={{ color: colors.text }}>
                {displayFirstName} {displayLastName}
              </span>
                        </div>
                    </div>
                </header>

                {/* Content */}
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

export default OnlineSchoolWithProvider;