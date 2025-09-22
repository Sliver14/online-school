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
  danger: '#EF4444', // text-red-500
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

interface AssessmentResults {
  score: number;
  isPassed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  answers: Record<string, number>;
  detailedResults: Array<{
    questionId: number;
    userAnswer: number;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
  attemptCount: number;
  completedAt: string;
}

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: {
    id: number;
    title: string;
    questions: Question[];
  } | null;
  onComplete: (answers: Record<string, number>) => Promise<void>;
  assessmentResults: AssessmentResults | null;
  onRetake: () => void;
}

// Function to parse markdown-style image links and render them as images
const parseQuestionText = (text: string) => {
  // Match markdown-style image links: [alt text](image_url)
  const imageRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = imageRegex.exec(text)) !== null) {
    // Add text before the image
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      });
    }

    // Add the image
    parts.push({
      type: 'image',
      alt: match[1],
      src: match[2]
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last image
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex)
    });
  }

  // If no images found, return the original text
  if (parts.length === 0) {
    return [{ type: 'text', content: text }];
  }

  return parts;
};

const AssessmentModal: React.FC<AssessmentModalProps> = ({
  isOpen,
  onClose,
  assessment,
  onComplete,
  assessmentResults,
  onRetake,
}) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'taking' | 'loading' | 'results'>('taking');

  useEffect(() => {
    if (isOpen && assessment?.questions) {
      if (assessmentResults) {
        console.log('Initializing results mode:', assessmentResults);
        setMode('results');
        setIsSubmitted(true);
        setIsLoading(false);
        // Initialize answers from results
        setAnswers(assessmentResults.answers || {});
      } else {
        console.log('Initializing taking mode');
        setMode('taking');
        setAnswers({});
        setIsSubmitted(false);
        setIsLoading(false);
      }
    }
  }, [isOpen, assessment?.questions, assessmentResults]);

  // Watch for assessment results when in loading mode
  useEffect(() => {
    if (mode === 'loading' && assessmentResults) {
      console.log('Transitioning from loading to results:', assessmentResults);
      setMode('results');
      setIsLoading(false);
      setIsSubmitted(true);
      setAnswers(assessmentResults.answers || {});
    }
  }, [mode, assessmentResults]);

  const handleAnswerChange = (questionId: number, optionIndex: number) => {
    console.log('Answer changed:', { questionId, optionIndex });
    setAnswers((prev) => ({
      ...prev,
      [questionId.toString()]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    console.log('Submitting assessment:', { answers, mode });
    setIsLoading(true);
    setMode('loading');
    try {
      await onComplete(answers);
      // The onComplete function should handle setting the results
      // We don't need to manually set mode to 'results' here
    } catch (error) {
      console.error('Error submitting assessment:', error);
      setIsLoading(false);
      setMode('taking');
    }
  };

  const handleClose = () => {
    console.log('Closing modal, resetting state');
    setMode('taking');
    setAnswers({});
    setIsSubmitted(false);
    setIsLoading(false);
    onClose();
  };

  if (!isOpen || !assessment || !assessment.questions || assessment.questions.length === 0) {
    console.log('Modal not rendered:', { isOpen, assessment });
    return null;
  }

  const renderResults = () => (
    <div className="text-center py-8">
      <div className="mb-6">
        {assessmentResults?.isPassed ? (
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: colors.success }} />
        ) : (
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: colors.warning }} />
        )}
        <h3 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
          {assessmentResults?.isPassed ? 'Perfect Score!' : 'Assessment Results'}
        </h3>
        <p className="text-lg mb-4" style={{ color: colors.textMuted }}>
          Your Score:{' '}
          <span className="font-bold" style={{ color: assessmentResults?.isPassed ? colors.success : colors.warning }}>
            {assessmentResults?.score || 0}%
          </span>
        </p>
        <p className="mb-4" style={{ color: colors.textMuted }}>
          You answered {assessmentResults?.correctAnswers || 0} out of {assessmentResults?.totalQuestions || assessment.questions.length} questions correctly.
        </p>
        {assessmentResults?.isPassed ? (
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
        {assessment.questions.map((question, index) => {
          // Ensure detailedResults is an array before using find
          const detailedResultsArray = Array.isArray(assessmentResults?.detailedResults) 
            ? assessmentResults.detailedResults 
            : [];
          
          console.log('Detailed results array:', detailedResultsArray);
          console.log('Assessment results:', assessmentResults);
          
          // Use index-based matching since detailedResults should be in the same order as questions
          const detailedResult = detailedResultsArray[index];
          
          console.log(`Question ${index + 1} (ID: ${question.id}):`, {
            detailedResult,
            userAnswer: detailedResult?.userAnswer,
            options: question.options,
            selectedAnswer: detailedResult?.userAnswer !== undefined ? question.options[detailedResult.userAnswer] : 'undefined'
          });
          
          const userAnswerIndex = detailedResult?.userAnswer;
          const userAnswer = userAnswerIndex !== undefined && userAnswerIndex >= 0 ? question.options[userAnswerIndex] : 'No answer selected';
          const isCorrect = detailedResult?.isCorrect || false;
          const questionParts = parseQuestionText(question.question);

          return (
            <div
              key={question.id}
              className="p-4 rounded-lg border"
              style={{
                borderColor: isCorrect ? colors.success : colors.danger,
                backgroundColor: colors.primary,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5" style={{ color: colors.success }} />
                ) : (
                  <XCircle className="w-5 h-5" style={{ color: colors.danger }} />
                )}
                <h4 className="text-lg font-semibold" style={{ color: colors.text }}>
                  {questionParts.map((part, partIndex) => (
                    <React.Fragment key={partIndex}>
                      {part.type === 'text' ? (
                        part.content
                      ) : (
                        <img
                          src={part.src}
                          alt={part.alt}
                          className="max-w-full h-auto mt-2 mb-2 rounded-lg"
                          style={{ maxHeight: '300px' }}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </h4>
              </div>
              <p className="text-sm" style={{ color: colors.textMuted }}>
                Your Answer:{' '}
                <span style={{ color: isCorrect ? colors.success : colors.danger }}>
                  {userAnswer}
                </span>
              </p>
              {!isCorrect && (
                <p className="text-sm" style={{ color: colors.textMuted }}>
                  Correct Answer: <span style={{ color: colors.success }}>{question.correctAnswer}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-4">
        {!assessmentResults?.isPassed && (
          <button
            onClick={onRetake}
            className="px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-80"
            style={{ backgroundColor: colors.warning }}
          >
            Retake Assessment
          </button>
        )}
        <button
          onClick={handleClose}
          className="px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-80"
          style={{ backgroundColor: colors.accent }}
        >
          Close
        </button>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: colors.accent }}></div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>
        Calculating your score...
      </h3>
      <p style={{ color: colors.textMuted }}>
        Please wait while we process your assessment results.
      </p>
    </div>
  );

  const renderQuestions = () => (
    <div className="pt-4 px-6">
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2" style={{ color: colors.textMuted }}>
          <span>{assessment.questions.length} Questions</span>
          <span>{Math.round((Object.keys(answers).length / assessment.questions.length) * 100)}% Answered</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(Object.keys(answers).length / assessment.questions.length) * 100}%`,
              backgroundColor: colors.accent,
            }}
          />
        </div>
      </div>

      <div className="space-y-6">
        {assessment.questions.map((question, index) => {
          const questionParts = parseQuestionText(question.question);
          
          return (
            <div
              key={question.id}
              className="p-4 rounded-lg border"
              style={{ borderColor: colors.textMuted, backgroundColor: colors.primary }}
            >
              <h3 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>
                Question {index + 1}: {questionParts.map((part, partIndex) => (
                  <React.Fragment key={partIndex}>
                    {part.type === 'text' ? (
                      part.content
                    ) : (
                      <img
                        src={part.src}
                        alt={part.alt}
                        className="max-w-full h-auto mt-2 mb-2 rounded-lg"
                        style={{ maxHeight: '300px' }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </h3>
              <div className="space-y-3">
                {question.options?.map((option, optIndex) => (
                  <label
                    key={optIndex}
                    className="flex items-center p-4 rounded-lg border cursor-pointer transition-colors hover:bg-gray-800"
                    style={{
                      borderColor: answers[question.id.toString()] === optIndex ? colors.accent : '#374151',
                      backgroundColor: answers[question.id.toString()] === optIndex ? `${colors.accent}20` : colors.primary,
                    }}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={optIndex}
                      checked={answers[question.id.toString()] === optIndex}
                      onChange={() => handleAnswerChange(question.id, optIndex)}
                      className="mr-3"
                      style={{ accentColor: colors.accent }}
                    />
                    <span style={{ color: colors.text }}>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < assessment.questions.length}
          className="px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: colors.success }}
        >
          Submit Assessment
        </button>
      </div>

      {Object.keys(answers).length < assessment.questions.length && (
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
                {assessment.title}{mode === 'results' ? ' - Results' : mode === 'loading' ? ' - Processing' : ''}
              </h2>
              <p className="text-sm" style={{ color: colors.textMuted }}>
                {mode === 'results'
                  ? `Attempt #${assessmentResults?.attemptCount || 1} • Completed: ${assessmentResults?.completedAt ? new Date(assessmentResults.completedAt).toLocaleDateString() : 'N/A'}`
                  : mode === 'loading'
                  ? 'Calculating your score...'
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
          {mode === 'results' ? renderResults() : mode === 'loading' ? renderLoading() : renderQuestions()}
        </div>
      </div>
    </div>
  );
};

export default AssessmentModal;