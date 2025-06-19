'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ClassData {
    id: number;
    title: string;
    description: string;
    classNumber: string;
    duration: string;
    videoUrl: string;
    posterUrl: string;
    assessment: any[];
}

interface AppContextType {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    handleNavClick: (tab: string) => void;
    classes: ClassData[];
    setClasses: (classes: ClassData[]) => void;
    selectedClassId: string | null;
    setSelectedClassId: (classId: string | null) => void;
    activeResourceTab: string;
    setActiveResourceTab: (tab: string) => void;
    videoWatched: { [classId: string]: boolean };
    assessmentCompleted: { [assessmentId: string]: boolean };
    initializeProgress: (progress: {
        videoWatched?: { [classId: string]: boolean };
        assessmentCompleted?: { [assessmentId: string]: boolean };
    }) => void;
    handleVideoComplete: (classId: string) => Promise<void>;
    handleAssessmentComplete: (assessmentId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeTab, setActiveTab] = useState<string>('classes');
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [classes, setClassesInternal] = useState<ClassData[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [activeResourceTab, setActiveResourceTab] = useState<string>('materials');
    const [videoWatched, setVideoWatched] = useState<{ [classId: string]: boolean }>({});
    const [assessmentCompleted, setAssessmentCompleted] = useState<{ [assessmentId: string]: boolean }>({});

    const setClasses = useCallback((newClasses: ClassData[]) => {
        setClassesInternal(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(newClasses)) {
                console.log('Updating classes in context');
                return newClasses;
            }
            return prev;
        });
    }, []);

    const handleNavClick = useCallback((tab: string) => {
        setActiveTab(tab);
        setSidebarOpen(false);
    }, []);

    const initializeProgress = useCallback((progress: {
        videoWatched?: { [classId: string]: boolean };
        assessmentCompleted?: { [assessmentId: string]: boolean };
    }) => {
        if (progress.videoWatched) {
            setVideoWatched(prev => {
                const newProgress = { ...prev, ...progress.videoWatched };
                if (JSON.stringify(prev) !== JSON.stringify(newProgress)) {
                    console.log('Updating videoWatched in context');
                    return newProgress;
                }
                return prev;
            });
        }
        if (progress.assessmentCompleted) {
            setAssessmentCompleted(prev => {
                const newProgress = { ...prev, ...progress.assessmentCompleted };
                if (JSON.stringify(prev) !== JSON.stringify(newProgress)) {
                    console.log('Updating assessmentCompleted in context');
                    return newProgress;
                }
                return prev;
            });
        }
    }, []);

    const handleVideoComplete = useCallback(async (classId: string) => {
        setVideoWatched(prev => ({ ...prev, [classId]: true }));
    }, []);

    const handleAssessmentComplete = useCallback(async (assessmentId: string) => {
        setAssessmentCompleted(prev => ({ ...prev, [assessmentId]: true }));
    }, []);

    return (
        <AppContext.Provider
            value={{
                activeTab,
                setActiveTab,
                sidebarOpen,
                setSidebarOpen,
                handleNavClick,
                classes,
                setClasses,
                selectedClassId,
                setSelectedClassId,
                activeResourceTab,
                setActiveResourceTab,
                videoWatched,
                assessmentCompleted,
                initializeProgress,
                handleVideoComplete,
                handleAssessmentComplete,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};