'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Clock } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useAppContext } from '../context/AppContext';

type Question = {
  id: number;
  text: string;
  options: string[];
};

type Exam = {
  id: number;
  title: string;
  questions: Question[];
};

const Examination = () => {
  const router = useRouter();
  const { userDetails } = useUser();
  const { classes, videoWatched, assessmentCompleted } = useAppContext();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showStartModal, setShowStartModal] = useState(true);
  const [showResultModal, setShowResultModal] = useState(false);
  const [result, setResult] = useState<{ score: number; correctAnswers: number; totalQuestions: number } | null>(null);
  const [resultLoading, setResultLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [progressChecked, setProgressChecked] = useState(false);

  // Check user progress and protect route
  // useEffect(() => {
  //   if (!userDetails?.id) {
  //     router.push('/auth?mode=signin');
  //     return;
  //   }

  //   // Calculate overall progress
  //   const totalClasses = classes.length;
  //   const completedClasses = classes.reduce((count, classItem) => {
  //     const classId = classItem.id.toString();
  //     const isVideoWatched = videoWatched[classId];
  //     const allAssessmentsCompleted =
  //       classItem.assessments.length > 0
  //         ? classItem.assessments.every((assessment: any) => assessmentCompleted[assessment.id.toString()])
  //         : true;
  //     return isVideoWatched && allAssessmentsCompleted ? count + 1 : count;
  //   }, 0);
  //   const overallProgress = totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0;

  //   if (overallProgress === 100) {
  //     setProgressChecked(true);
  //   } else {
  //     setError('Complete all classes to access the exam');
  //     router.push('/');
  //   }
  // }, [userDetails, classes, videoWatched, assessmentCompleted, router]);

  // Fetch exam data
  useEffect(() => {
    // if (!progressChecked) return;
    const fetchExam = async () => {
      try {
        const response = await fetch('/api/exam');
        const data = await response.json();
        if (data.success) {
          setExam(data.exam);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to load exam');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, []);

  // Timer logic
  useEffect(() => {
    if (!showStartModal && timeLeft > 0 && !showResultModal) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit(); // Auto-submit when time expires
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showStartModal, timeLeft, showResultModal]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (!userDetails?.id || !exam) return;

    setResultLoading(true);
    try {
      const response = await fetch('/api/user-progress/submit-examination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userDetails.id.toString(), answers }),
      });
      const data = await response.json();
      if (data.success) {
        setResult(data);
        setShowResultModal(true);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to submit exam');
    } finally {
      setResultLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  const handleStart = () => {
    setShowStartModal(false);
  };

  const handleRetake = () => {
    setAnswers({});
    setTimeLeft(3600);
    setShowResultModal(false);
    setResult(null);
    setShowStartModal(true);
  };

  // Check if all questions are answered
  const allQuestionsAnswered = exam
    ? exam.questions.every((question) => answers[question.id] !== undefined)
    : false;

  // if (!progressChecked) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-dark-bg-primary">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 dark:border-primary-400"></div>
  //     </div>
  //   );
  // }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-dark-bg-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 dark:border-primary-400"></div>
      </div>
    );
  }

if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-100 dark:bg-dark-bg-primary gap-4">
        <p className="desktop_h3 tablet_h3 mobile_h3 text-neutral-950 dark:text-dark-text-primary">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 rounded-lg bg-primary-400 text-white hover:bg-primary-500"
        >
          Back Home
        </button>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-100 dark:bg-dark-bg-primary gap-4">
        <p className="desktop_h3 tablet_h3 mobile_h3 text-neutral-950 dark:text-dark-text-primary">Exam not found</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 rounded-lg bg-primary-400 text-white hover:bg-primary-500"
        >
          Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-dark-bg-primary p-4 lg:p-8">
      {/* Start Modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-neutral-50 dark:bg-dark-bg-tertiary rounded-xl p-6 max-w-md w-full mx-4 border border-neutral-100 dark:border-dark-border-primary">
            <h3 className="desktop_h3 tablet_h3 mobile_h3 font-semibold text-neutral-950 dark:text-dark-text-primary mb-4">
              Final Exam
            </h3>
            <p className="desktop_paragraph tablet_paragraph mobile_paragraph text-neutral-500 dark:text-dark-text-muted mb-4">
              <strong>Duration:</strong> 1 hour<br />
              <strong>Questions:</strong> {exam.questions.length}<br />
              <strong>Instructions:</strong> Ensure you are in a quiet place and stay focused. Good luck!
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 rounded-lg bg-neutral-200 dark:bg-dark-bg-secondary text-neutral-950 dark:text-dark-text-primary hover:bg-neutral-300 dark:hover:bg-dark-bg-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleStart}
                className="flex-1 px-4 py-2 rounded-lg bg-primary-400 text-white hover:bg-primary-500"
              >
                Start Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-neutral-50 dark:bg-dark-bg-tertiary rounded-xl p-6 max-w-md w-full mx-4 border border-neutral-100 dark:border-dark-border-primary">
            {resultLoading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 border-primary-400 dark:border-primary-400"></div>
                <p className="desktop_paragraph tablet_paragraph mobile_paragraph text-neutral-500 dark:text-dark-text-muted">
                  Processing results...
                </p>
              </div>
            ) : (
              <>
                <h3 className="desktop_h3 tablet_h3 mobile_h3 font-semibold text-neutral-950 dark:text-dark-text-primary mb-4">
                  Exam Results
                </h3>
                <p className="desktop_paragraph tablet_paragraph mobile_paragraph text-neutral-500 dark:text-dark-text-muted mb-4">
                  <strong>Score:</strong> {result?.score}%<br />
                  <strong>Correct Answers:</strong> {result?.correctAnswers} / {result?.totalQuestions}
                </p>
                <div className="flex gap-4">
                  {result?.score < 100 && (
                    <button
                      onClick={handleRetake}
                      className="flex-1 px-4 py-2 rounded-lg bg-secondary-400 text-white hover:bg-secondary-500"
                    >
                      Retake Exam
                    </button>
                  )}
                  <button
                    onClick={() => router.push('/')}
                    className="flex-1 px-4 py-2 rounded-lg bg-primary-400 text-white hover:bg-primary-500"
                  >
                    Return to Home
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Exam Content */}
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="desktop_h2 tablet_h2 mobile_h2 text-neutral-950 dark:text-dark-text-primary">{exam.title}</h2>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-neutral-500 dark:text-dark-text-muted" />
            <span className="desktop_paragraph tablet_paragraph mobile_paragraph text-neutral-500 dark:text-dark-text-muted">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        <div className="space-y-8">
          {exam.questions.map((question, index) => (
            <div
              key={question.id}
              className="p-6 rounded-xl border border-neutral-100 dark:border-dark-border-primary bg-neutral-50 dark:bg-dark-bg-tertiary"
            >
              <h3 className="desktop_h3 tablet_h3 mobile_h3 text-neutral-950 dark:text-dark-text-primary mb-4">
                {index + 1}. {question.text}
              </h3>
              <div className="space-y-2">
                {question.options.map((option, optIndex) => (
                  <label
                    key={optIndex}
                    className="flex items-center gap-2 desktop_paragraph tablet_paragraph mobile_paragraph text-neutral-500 dark:text-dark-text-muted"
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={optIndex}
                      checked={answers[question.id] === optIndex}
                      onChange={() => handleAnswerChange(question.id, optIndex)}
                      className="form-radio text-primary-400"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 rounded-lg bg-neutral-200 dark:bg-dark-bg-secondary text-neutral-950 dark:text-dark-text-primary hover:bg-neutral-300 dark:hover:bg-dark-bg-primary"
          >
            End Exam
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 rounded-lg bg-primary-400 text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={resultLoading || !allQuestionsAnswered}
          >
            Submit Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default Examination;