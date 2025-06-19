import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { colors } from '@/lib/constants';

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
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [mode, setMode] = useState<'taking' | 'results' | 'submitted'>('taking');

    useEffect(() => {
        if (isOpen && assessment.questions) {
            if (assessmentResults) {
                setMode('results');
                setScore(assessmentResults.score);
                setIsSubmitted(true);
            } else {
                setMode('taking');
                setAnswers(new Array(assessment.questions.length).fill(''));
                setCurrentQuestionIndex(0);
                setIsSubmitted(false);
                setScore(0);
            }
        }
    }, [isOpen, assessment.questions, assessmentResults]);

    const handleAnswerChange = (questionIndex: number, answer: string) => {
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
        const finalScore = calculateScore();
        setScore(finalScore);
        setIsSubmitted(true);
        setMode('submitted');
        onComplete(finalScore, answers);
    };

    const handleRetakeClick = () => {
        setMode('taking');
        setAnswers(new Array(assessment.questions.length).fill(''));
        setCurrentQuestionIndex(0);
        setIsSubmitted(false);
        setScore(0);
        if (onRetake) onRetake();
    };

    const handleClose = () => {
        setMode('taking');
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setIsSubmitted(false);
        setScore(0);
        onClose();
    };

    const handleNext = () => {
        if (currentQuestionIndex < assessment.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    if (!isOpen || !assessment || !assessment.questions || assessment.questions.length === 0) {
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
                        You need 100% to complete this assessment. You can retake it to improve your score.
                    </p>
                )}
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
                        onClick={handleRetakeClick}
                        className="px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-80"
                        style={{ backgroundColor: colors.accent }}
                    >
                        Retake Assessment
                    </button>
                )}
            </div>
        </div>
    );

    const currentQuestion = assessment.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === assessment.questions.length - 1;
    const isFirstQuestion = currentQuestionIndex === 0;
    const canSubmit = answers.every(answer => answer !== '');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
                className="bg-gray-900 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4"
                style={{ backgroundColor: colors.tertiary }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
                            {assessment.title}{mode === 'results' ? ' - Results' : ''}
                        </h2>
                        <p className="text-sm" style={{ color: colors.textMuted }}>
                            {mode === 'results' ? (
                                `Attempt #${assessmentResults.attemptCount} • Completed: ${new Date(assessmentResults.completedAt).toLocaleDateString()}`
                            ) : (
                                `${assessment.questions.length} Questions`
                            )}
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

                {(mode === 'submitted' || mode === 'results') ? (
                    renderResults(mode === 'results', mode === 'results' ? assessmentResults.score : score, (mode === 'results' ? assessmentResults.isPassed : score === 100))
                ) : (
                    /* Question View */
                    <div>
                        {/* Progress Bar */}
                        <div className="mb-6">
                            <div className="flex justify-between text-sm mb-2" style={{ color: colors.textMuted }}>
                                <span>Question {currentQuestionIndex + 1} of {assessment.questions.length}</span>
                                <span>{Math.round(((currentQuestionIndex + 1) / assessment.questions.length) * 100)}% Complete</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${((currentQuestionIndex + 1) / assessment.questions.length) * 100}%`,
                                        backgroundColor: colors.accent,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Question Content */}
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-6" style={{ color: colors.text }}>
                                {currentQuestion.question}
                            </h3>

                            {/* Multiple Choice Options */}
                            <div className="space-y-3">
                                {currentQuestion.options?.map((option, index) => (
                                    <label
                                        key={index}
                                        className="flex items-center p-4 rounded-lg border cursor-pointer transition-colors hover:bg-gray-800"
                                        style={{
                                            borderColor: answers[currentQuestionIndex] === option ? colors.accent : 'rgb(55, 65, 81)',
                                            backgroundColor: answers[currentQuestionIndex] === option ? colors.accent + '20' : colors.primary,
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${currentQuestionIndex}`}
                                            value={option}
                                            checked={answers[currentQuestionIndex] === option}
                                            onChange={() => handleAnswerChange(currentQuestionIndex, option)}
                                            className="mr-3"
                                            style={{ accentColor: colors.accent }}
                                        />
                                        <span style={{ color: colors.text }}>{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={handlePrevious}
                                disabled={isFirstQuestion}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: colors.secondary }}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Previous
                            </button>

                            <div className="text-sm" style={{ color: colors.textMuted }}>
                                {answers.filter(answer => answer !== '').length} of {assessment.questions.length} answered
                            </div>

                            <div className="flex gap-3">
                                {!isLastQuestion ? (
                                    <button
                                        onClick={handleNext}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors hover:opacity-80"
                                        style={{ backgroundColor: colors.accent }}
                                    >
                                        Next
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!canSubmit}
                                        className="px-6 py-2 rounded-lg text-white font-medium transition-colors hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ backgroundColor: colors.success }}
                                    >
                                        Submit Assessment
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Submit button warning */}
                        {isLastQuestion && !canSubmit && (
                            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: colors.warning + '20', borderColor: colors.warning }}>
                                <p className="text-sm text-center" style={{ color: colors.warning }}>
                                    Please answer all questions before submitting the assessment.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssessmentModal;