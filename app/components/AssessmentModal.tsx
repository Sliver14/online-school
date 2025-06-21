'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { colors as importedColors } from '@/lib/constants';

// Fallback colors
const defaultColors = {
  tertiary: '#1F2937', // bg-gray-900
  text: '#F9FAFB', // text-gray-50
  textMuted: '#9CA3AF', // text-gray-400
  success: '#10B981', // text-green-500
  warning: '#F59E0B', // text-yellow-500
  accent: '#3B82F6', // text-blue-500
  error: '#EF4444', // text-red-500
  primary: '#111827', // bg-gray-800
  secondary: '#4B5563', // bg-gray-600
};

const colors = importedColors || defaultColors;

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

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: AssessmentData;
  onComplete: (score: number, answers: string[]) => void;
  assessmentResults?: any;
  onRetake?: () => void;
}

const AssessmentModal: React.FC<AssessmentModalProps> = ({
  isOpen,
  onClose,
  assessment,
  onComplete,
  assessmentResults,
  onRetake,
}) => {
  const [answers, setAnswers] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState<'taking' | 'results'>('taking');

  useEffect(() => {
    if (isOpen && assessment?.questions) {
      if (assessmentResults) {
        console.log('Initializing results mode:', assessmentResults); // Debug
        setMode('results');
        setScore(assessmentResults.score || 0);
        setAnswers(Object.values(assessmentResults.answers || {}));
        setIsSubmitted(true);
      } else {
        console.log('Initializing taking mode'); // Debug
        setMode('taking');
        setAnswers(new Array(assessment.questions.length).fill(''));
        setIsSubmitted(false);
        setScore(0);
      }
    }
  }, [isOpen, assessment?.questions, assessmentResults]);

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    console.log('Answer changed:', { questionIndex, answer }); // Debug
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    assessment.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    return Math.round((correctAnswers / assessment.questions.length) * 100);
  };

  const handleSubmit = () => {
    console.log('Submitting assessment:', { answers, mode }); // Debug
    const finalScore = calculateScore();
    setScore(finalScore);
    setIsSubmitted(true);
    setMode('results');
    const formattedAnswers: Record<string, number> = {};
    assessment.questions.forEach((question, index) => {
      const optionIndex = question.options.findIndex(opt => opt === answers[index]);
      formattedAnswers[question.id.toString()] = optionIndex >= 0 ? optionIndex : -1;
    });
    console.log('Calling onComplete:', { finalScore, formattedAnswers, answers }); // Debug
    onComplete(finalScore, answers);
    console.log('Post-submit state:', { mode: 'results', score: finalScore, answers }); // Debug
  };

  const handleClose = () => {
    console.log('Closing modal, resetting state'); // Debug
    setMode('taking');
    setAnswers([]);
    setIsSubmitted(false);
    setScore(0);
    onClose();
  };

  if (!isOpen || !assessment || !assessment.questions || assessment.questions.length === 0) {
    console.log('Modal not rendered:', { isOpen, assessment }); // Debug
    return null;
  }

  const renderResults = (isResultsMode: boolean, resultScore: number, isPassed: boolean) => (
    <div className="text-center py-8">
      <div className="mb-6">
        {isPassed ? (
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: colors.success }} />
        ) : (
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: colors.warning }} />
        )}
        <h3 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
          {isPassed ? 'Perfect Score!' : 'Assessment Results'}
        </h3>
        <p className="text-lg mb-4" style={{ color: colors.textMuted }}>
          Your Score: <span className="font-bold" style={{ color: isPassed ? colors.success : colors.warning }}>
            {resultScore}%
          </span>
        </p>
        <p className="mb-4" style={{ color: colors.textMuted }}>
          You answered {Math.round((resultScore / 100) * assessment.questions.length)} out of {assessment.questions.length} questions correctly.
        </p>
        {isPassed ? (
          <p style={{ color: colors.success }}>
            Congratulations! You achieved a perfect score and completed this assessment.
          </p>
        ) : (
          <p style={{ color: colors.warning }}>
            You need 100% to complete this assessment. Review incorrect answers below or retake the assessment.
          </p>
        )}
      </div>
      <div className="space-y-6 mb-6">
        {assessment.questions.map((question, index) => (
          <div
            key={question.id}
            className="p-4 rounded-lg border"
            style={{
              borderColor: answers[index] === question.correctAnswer ? colors.success : colors.error,
              backgroundColor: colors.primary,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              {answers[index] === question.correctAnswer ? (
                <CheckCircle className="w-5 h-5" style={{ color: colors.success }} />
              ) : (
                <XCircle className="w-5 h-5" style={{ color: colors.error }} />
              )}
              <h4 className="text-lg font-semibold" style={{ color: colors.text }}>
                {question.question}
              </h4>
            </div>
            <p className="text-sm" style={{ color: colors.textMuted }}>
              Your Answer: <span style={{ color: answers[index] === question.correctAnswer ? colors.success : colors.error }}>
                {answers[index] || 'No answer selected'}
              </span>
            </p>
            {answers[index] !== question.correctAnswer && (
              <p className="text-sm" style={{ color: colors.textMuted }}>
                Correct Answer: <span style={{ color: colors.success }}>{question.correctAnswer}</span>
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-4 justify-center">
        <button
          onClick={handleClose}
          className="px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-80"
          style={{ backgroundColor: colors.secondary }}
        >
          {isPassed && !isResultsMode ? 'Continue' : 'Close'}
        </button>
        {!isPassed && (
          <button
            onClick={onRetake}
            className="px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-80"
            style={{ backgroundColor: colors.accent }}
          >
            Retake All Questions
          </button>
        )}
      </div>
    </div>
  );

  const renderQuestions = () => (
    <div className="pt-4 px-6">
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2" style={{ color: colors.textMuted }}>
          <span>{assessment.questions.length} Questions</span>
          <span>{Math.round((answers.filter(a => a !== '').length / assessment.questions.length) * 100)}% Answered</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(answers.filter(a => a !== '').length / assessment.questions.length) * 100}%`,
              backgroundColor: colors.accent,
            }}
          />
        </div>
      </div>

      <div className="space-y-6">
        {assessment.questions.map((question, index) => (
          <div
            key={question.id}
            className="p-4 rounded-lg border"
            style={{ borderColor: colors.textMuted, backgroundColor: colors.primary }}
          >
            <h3 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>
              Question {index + 1}: {question.question}
            </h3>
            <div className="space-y-3">
              {question.options?.map((option, optIndex) => (
                <label
                  key={optIndex}
                  className="flex items-center p-4 rounded-lg border cursor-pointer transition-colors hover:bg-gray-800"
                  style={{
                    borderColor: answers[index] === option ? colors.accent : '#374151',
                    backgroundColor: answers[index] === option ? `${colors.accent}20` : colors.primary,
                  }}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={answers[index] === option}
                    onChange={() => handleAnswerChange(index, option)}
                    className="mr-3"
                    style={{ accentColor: colors.accent }}
                  />
                  <span style={{ color: colors.text }}>{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={answers.filter(a => a !== '').length < assessment.questions.length}
          className="px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: colors.success }}
        >
          Submit Assessment
        </button>
      </div>

      {answers.filter(a => a !== '').length < assessment.questions.length && (
        <div className="mt-4 p-3 rounded-lg text-center" style={{ backgroundColor: `${colors.warning}20`, borderColor: colors.warning }}>
          <p className="text-sm" style={{ color: colors.warning }}>
            Please answer all questions before submitting.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex flex-col">
      <div
        className="w-full h-full bg-gray-900 flex flex-col"
        style={{ backgroundColor: colors.tertiary }}
      >
        {/* Fixed Header */}
        <div
          className="fixed top-0 left-0 right-0 z-20 bg-gray-900 px-6 py-4 border-b"
          style={{ backgroundColor: colors.tertiary, borderColor: colors.textMuted }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
                {assessment.title}{mode === 'results' ? ' - Results' : ''}
              </h2>
              <p className="text-sm" style={{ color: colors.textMuted }}>
                {mode === 'results'
                  ? `Attempt #${assessmentResults?.attemptCount || 1} • Completed: ${assessmentResults?.completedAt ? new Date(assessmentResults.completedAt).toLocaleDateString() : 'N/A'}`
                  : `${assessment.questions.length} Questions`}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              style={{ color: colors.textMuted }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pt-20 px-6">
          {mode === 'results' ? (
            renderResults(mode === 'results', mode === 'results' ? assessmentResults?.score || 0 : score, mode === 'results' ? assessmentResults?.isPassed || false : score === 100)
          ) : (
            renderQuestions()
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentModal;