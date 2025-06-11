"use client"
import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, Lock, BookOpen, Award, BarChart3, User, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import VideoPlayer from "@/app/components/VideoPlayer";
import ExaminationComponent from "@/app/components/ExaminationComponent";
import axios from "axios";
import {useUser} from "@/app/context/UserContext";

interface Course {
    id: number;
    title: string;
    description: string;
    duration: string;
    videoUrl: string;
    posterUrl: string;
    classNumber: string;
    assessment: Assessment[];
}

interface Assessment {
    id: number;
    title: string;
    questions: Question[];
}

interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: string;
}

interface UserProgressData {
    classId: number;
    course: Course;
    hasWatchedVideo: boolean;
    assessmentScores: number[];
    completed: boolean;
}

const OnlineSchoolPlatform = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [userProgress, setUserProgress] = useState<UserProgressData[]>([]);
    const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
    const [assessmentScores, setAssessmentScores] = useState<Record<number, number>>({});
    const [currentAssessment, setCurrentAssessment] = useState<Course | null>(null);
    const [showAssessment, setShowAssessment] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showExamination, setShowExamination] = useState(false);
    const [examinationScore, setExaminationScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { userId } = useUser();

    useEffect(() => {
        const loadData = async () => {
            if (userId){
                try {
                    setLoading(true);

                    // Load classes
                    const classesResponse = await axios.get("/api/classes");
                    const classesData = classesResponse.data.data;
                    setCourses(classesData);

                    // Load user progress
                    const progressResponse = await axios.get(`/api/user-progress/${userId}`);
                    const progressData = progressResponse.data;
                    setUserProgress(progressData);

                    // Set current course (first incomplete or first course)
                    const firstIncomplete = progressData.find((p: UserProgressData) => !p.completed);
                    setCurrentCourse(firstIncomplete ? firstIncomplete.course : classesData[0]);

                    // Initialize assessment scores
                    const scores: Record<number, number> = {};
                    progressData.forEach((progress: UserProgressData) => {
                        if (progress.assessmentScores.length > 0) {
                            scores[progress.classId] = Math.max(...progress.assessmentScores);
                        }
                    });
                    setAssessmentScores(scores);

                } catch (err) {
                    setError('Failed to load data');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            }

        };

        loadData();
    }, [userId]);

    const isClassUnlocked = (classId: number) => {
        if (classId === 1) return true;
        const previousClass = userProgress.find(p => p.classId === classId - 1);
        return previousClass ? previousClass.completed : false;
    };

    const isVideoWatched = (classId: number) => {
        const progress = userProgress.find(p => p.classId === classId);
        return progress ? progress.hasWatchedVideo : false;
    };

    const isAssessmentPassed = (classId: number) => {
        return assessmentScores[classId] >= 80;
    };

    const isClassCompleted = (classId: number) => {
        const progress = userProgress.find(p => p.classId === classId);
        return progress ? progress.completed : false;
    };

    const handleVideoComplete = async (classId: number) => {
        try {
            await axios.post(`/api/user-progress/video-watched`, {
                userId,
                classId
            });

            // Update local state
            setUserProgress(prev =>
                prev.map(p =>
                    p.classId === classId
                        ? { ...p, hasWatchedVideo: true }
                        : p
                )
            );
        } catch (error) {
            console.error('Failed to mark video watched', error);
            setError('Could not update video watch status');
        }
    };

    const handleStartAssessment = (classId: number) => {
        const course = courses.find(c => c.id === classId);
        if (!course) return;

        setCurrentAssessment(course);
        setShowAssessment(true);
        setSelectedAnswers({});
    };

    const handleAnswerSelect = (questionId: number, answerIndex: number) => {
        setSelectedAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionId]: answerIndex
        }));
    };

    const handleSubmitAssessment = async () => {
        if (!currentAssessment) return;

        try {
            const response = await axios.post('/api/user-progress/submit-assessment', {
                userId,
                classId: currentAssessment.id,
                answers: selectedAnswers
            });

            const score = response.data.score;

            setAssessmentScores(prevScores => ({
                ...prevScores,
                [currentAssessment.id]: score
            }));

            // Update user progress
            if (score >= 80) {
                setUserProgress(prev =>
                    prev.map(p =>
                        p.classId === currentAssessment.id
                            ? { ...p, completed: p.hasWatchedVideo && score >= 80 }
                            : p
                    )
                );
            }

            setShowAssessment(false);
            setCurrentAssessment(null);
            setSelectedAnswers({});
        } catch (error) {
            setError('Failed to submit assessment');
            console.error(error);
        }
    };

    const handleStartExamination = async () => {
        const completedClassesCount = userProgress.filter(p => p.completed).length;
        if (completedClassesCount < courses.length) return;

        try {
            // Create a default answer set for the examination
            const questions = courses.flatMap(course => course.assessment[0]?.questions || []);
            const answers = questions.map(q => ({
                questionId: q.id,
                answer: 0 // default answer
            }));

            const response = await axios.post('/api/user-progress/submit-examination', {
                userId,
                answers
            });

            setExaminationScore(response.data.score);
            setShowExamination(true);
        } catch (error) {
            setError('Failed to start examination');
            console.error(error);
        }
    };

    // Navigation functions
    const handlePreviousClass = () => {
        if (!currentCourse || currentCourse.id <= 1) return;

        const previousCourse = courses.find(course => course.id === currentCourse.id - 1);
        if (previousCourse && isClassUnlocked(previousCourse.id)) {
            setCurrentCourse(previousCourse);
        }
    };

    const handleNextClass = () => {
        if (!currentCourse || currentCourse.id >= courses.length) return;

        const nextCourse = courses.find(course => course.id === currentCourse.id + 1);
        if (nextCourse && isClassUnlocked(nextCourse.id)) {
            setCurrentCourse(nextCourse);
        }
    };

    const canNavigateToPrevious = () => {
        return currentCourse && currentCourse.id > 1 && isClassUnlocked(currentCourse.id - 1);
    };

    const canNavigateToNext = () => {
        return currentCourse && currentCourse.id < courses.length && isClassUnlocked(currentCourse.id + 1);
    };

    const getProgressPercentage = () => {
        const completedCount = userProgress.filter(p => p.completed).length;
        return Math.round((completedCount / courses.length) * 100);
    };

    const getCurrentCourse = () => {
        return currentCourse || courses[0];
    };

    const currentView = showExamination ? 'examination' :
        showAssessment ? 'assessment' :
            'course';

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <header className="bg-white shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            >
                                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                            <div className="flex items-center ml-2 md:ml-0">
                                <Image src="/logo.png" alt="logo.png" width={45} height={45} />
                                <h1 className="hidden md:ml-2 md:block text-lg font-bold text-gray-900">
                                    Loveworld Foundation School
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:flex items-center space-x-2">
                                <BarChart3 className="h-5 w-5 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">
                    Progress: {getProgressPercentage()}%
                  </span>
                            </div>
                            <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out`}>
                    {/* Progress */}
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Progress</h2>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                style={{width: `${getProgressPercentage()}%`}}
                            />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            {userProgress.filter(p => p.completed).length} of {courses.length} classes completed
                        </p>
                    </div>

                    {/* Classes */}
                    <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">CLASSES</h3>
                        <div className="space-y-2">
                            {courses.map((course) => (
                                <button
                                    key={course.id}
                                    onClick={() => {
                                        if (isClassUnlocked(course.id)) {
                                            setCurrentCourse(course);
                                            setSidebarOpen(false);
                                        }
                                    }}
                                    disabled={!isClassUnlocked(course.id)}
                                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                                        currentCourse?.id === course.id
                                            ? 'bg-indigo-600 text-white border-2 border-indigo-600 shadow-md'
                                            : isClassUnlocked(course.id)
                                                ? 'hover:bg-gray-50 border-2 border-transparent text-gray-900'
                                                : 'opacity-50 cursor-not-allowed border-2 border-transparent text-gray-500'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                          <span className="text-sm font-medium">
                            {course.classNumber}
                          </span>
                                            {isClassCompleted(course.id) && (
                                                <CheckCircle className={`h-4 w-4 ml-2 ${
                                                    currentCourse?.id === course.id ? 'text-white' : 'text-green-500'
                                                }`} />
                                            )}
                                            {!isClassUnlocked(course.id) && (
                                                <Lock className="h-4 w-4 text-gray-400 ml-2" />
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Examination */}
                        <div className="p-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Examination</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={handleStartExamination}
                                    disabled={userProgress.filter(p => p.completed).length < courses.length}
                                    className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                                        userProgress.filter(p => p.completed).length === courses.length
                                            ? 'border-transparent hover:bg-gradient-to-r hover:from-blue-50 hover:to-orange-50 hover:border-blue-200'
                                            : 'border-transparent opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="text-sm font-medium text-gray-900">
                                              Final Exam
                                            </span>
                                            {examinationScore !== null && examinationScore >= 70 && (
                                                <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">Bible Knowledge Test</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Overlay for mobile sidebar */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <div className="flex-1 p-4 md:p-8">
                    {currentView === 'examination' ? (
                        <ExaminationComponent
                            onClose={() => setShowExamination(false)}
                            userId={userId}
                        />
                    ) : currentView === 'assessment' ? (
                        <div className="max-w-3xl mx-auto">
                            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                        Class {currentAssessment?.id} Assessment
                                    </h2>
                                    <p className="text-gray-600">Answer all questions to complete the assessment</p>
                                </div>

                                <div className="space-y-8">
                                    {currentAssessment?.assessment[0]?.questions.map((question, index) => (
                                        <div key={question.id} className="border-b border-gray-200 pb-6 last:border-0">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                {index + 1}. {question.question}
                                            </h3>
                                            <div className="space-y-3">
                                                {question.options.map((option, optionIndex) => (
                                                    <label
                                                        key={optionIndex}
                                                        className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                                            selectedAnswers[question.id] === optionIndex
                                                                ? 'border-indigo-500 bg-indigo-50'
                                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`question-${question.id}`}
                                                            value={optionIndex}
                                                            checked={selectedAnswers[question.id] === optionIndex}
                                                            onChange={() => handleAnswerSelect(question.id, optionIndex)}
                                                            className="sr-only"
                                                        />
                                                        <div className={`w-4 h-4 rounded-full mr-3 border-2 ${
                                                            selectedAnswers[question.id] === optionIndex
                                                                ? 'border-indigo-500 bg-indigo-500'
                                                                : 'border-gray-300'
                                                        }`}>
                                                            {selectedAnswers[question.id] === optionIndex && (
                                                                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                                                            )}
                                                        </div>
                                                        <span className="text-gray-700">{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
                                    <button
                                        onClick={() => setShowAssessment(false)}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmitAssessment}
                                        disabled={Object.keys(selectedAnswers).length < (currentAssessment?.assessment[0]?.questions.length || 0)}
                                        className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition duration-200"
                                    >
                                        Submit Assessment
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            {/* Course Header with Navigation */}
                            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                                Class {getCurrentCourse()?.id}: {getCurrentCourse()?.title}
                                            </h2>
                                            {getCurrentCourse() && isClassCompleted(getCurrentCourse().id) && (
                                                <div className="flex items-center space-x-2 text-green-600">
                                                    <Award className="h-6 w-6" />
                                                    <span className="font-semibold">Completed!</span>
                                                </div>
                                            )}
                                        </div>
                                        {/*<p className="text-gray-600 mb-4">{getCurrentCourse()?.description}</p>*/}
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span>Duration: {getCurrentCourse()?.duration}</span>
                                            <span>•</span>
                                            <span>Class {getCurrentCourse()?.id} of {courses.length}</span>
                                        </div>
                                    </div>
                                </div>


                            </div>

                            {/* Video Section */}
                            <div className="bg-white rounded-xl shadow-lg mb-8 ">
                                <VideoPlayer
                                    // key={getCurrentCourse()?.id} // Add this line
                                    key={`${getCurrentCourse().id}-${getCurrentCourse().videoUrl}-${getCurrentCourse().posterUrl}`}
                                    className="w-full h-full mb-6 md:mb-6"
                                    videoUrl={getCurrentCourse()?.videoUrl || ""}
                                    poster={getCurrentCourse()?.posterUrl || "default-poster.jpg"}
                                    title={`${getCurrentCourse()?.title} - Video Lesson`}
                                    onVideoEnd={() => {
                                        const course = getCurrentCourse();
                                        if (course) {
                                            handleVideoComplete(course.id);
                                        }
                                    }}
                                />
                                {getCurrentCourse() && isVideoWatched(getCurrentCourse().id) && (
                                    <div className="p-4 flex items-center text-green-600">
                                        <CheckCircle className="h-5 w-5 mr-2" />
                                        <span className="font-medium">Video completed!</span>
                                    </div>
                                )}
                            </div>



                            {/* Assessment Section */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
                                    Assessment
                                </h3>

                                {getCurrentCourse() && !isVideoWatched(getCurrentCourse().id) ? (
                                    <div className="text-center py-8">
                                        <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600">Complete the video lesson to unlock the assessment</p>
                                    </div>
                                ) : (
                                    <div>
                                        {getCurrentCourse() && assessmentScores[getCurrentCourse().id] ? (
                                            <div className="text-center py-8">
                                                <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold ${
                                                    assessmentScores[getCurrentCourse().id] >= 80
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {assessmentScores[getCurrentCourse().id] >= 80 ? (
                                                        <CheckCircle className="h-6 w-6 mr-2" />
                                                    ) : (
                                                        <X className="h-6 w-6 mr-2" />
                                                    )}
                                                    Score: {assessmentScores[getCurrentCourse().id]}%
                                                </div>
                                                <p className="text-gray-600 mt-4">
                                                    {assessmentScores[getCurrentCourse().id] >= 80
                                                        ? 'Congratulations! You passed the assessment.'
                                                        : 'You need 80% to pass. Please retake the assessment.'}
                                                </p>
                                                <button
                                                    onClick={() => getCurrentCourse() && handleStartAssessment(getCurrentCourse().id)}
                                                    className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
                                                >
                                                    {assessmentScores[getCurrentCourse().id] >= 80 ? 'Retake Assessment' : 'Try Again'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-gray-600 mb-6">Ready to test your knowledge?</p>
                                                <button
                                                    onClick={() => getCurrentCourse() && handleStartAssessment(getCurrentCourse().id)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg transition duration-200 transform hover:scale-105"
                                                >
                                                    Start Assessment
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                <button
                                    onClick={handlePreviousClass}
                                    disabled={!canNavigateToPrevious()}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition duration-200 ${
                                        canNavigateToPrevious()
                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span>Previous Class</span>
                                </button>

                                <div className="hidden xl:flex space-x-2">
                                    {courses.map((course, index) => (
                                        <div
                                            key={course.id}
                                            className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                                currentCourse?.id === course.id
                                                    ? 'bg-indigo-600 scale-125'
                                                    : isClassCompleted(course.id)
                                                        ? 'bg-green-500'
                                                        : isClassUnlocked(course.id)
                                                            ? 'bg-gray-300'
                                                            : 'bg-gray-200'
                                            }`}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={handleNextClass}
                                    disabled={!canNavigateToNext()}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition duration-200 ${
                                        canNavigateToNext()
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    <span>Next Class</span>
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnlineSchoolPlatform;