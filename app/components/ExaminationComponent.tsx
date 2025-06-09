// app/components/ExaminationComponent.tsx
'use client';

import { useState } from 'react';
import ExaminationTimer from './ExaminationTimer';

export default function ExaminationComponent({ onClose }) {
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [startTime, setStartTime] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(null);

    const fetchExaminationQuestions = async () => {
        const response = await fetch('/api/examination/questions');
        const data = await response.json();
        setQuestions(data);
    };

    const handleSubmit = async () => {
        const correctAnswers = questions.reduce((acc, question) => {
            return acc + (userAnswers[question.id] === question.correct ? 1 : 0);
        }, 0);

        const examinationScore = (correctAnswers / questions.length) * 100;

        await fetch('/api/examination/submit', {
            method: 'POST',
            body: JSON.stringify({
                userId: 1, // Replace with actual user ID
                score: examinationScore,
                startTime,
                endTime: new Date(),
                answers: userAnswers
            })
        });

        setScore(examinationScore);
        setIsSubmitted(true);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {!isSubmitted ? (
                <>
                    <ExaminationTimer onTimeUp={handleSubmit} />
                    <div className="space-y-6">
                        {questions.map((question, index) => (
                            <div key={question.id} className="border rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-4">
                                    {index + 1}. {question.question}
                                </h3>
                                <div className="space-y-2">
                                    {question.options.map((option, optionIndex) => (
                                        <label
                                            key={optionIndex}
                                            className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                                                userAnswers[question.id] === optionIndex
                                                    ? 'bg-indigo-50 border-indigo-200'
                                                    : 'hover:bg-gray-50 border-gray-200'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${question.id}`}
                                                value={optionIndex}
                                                checked={userAnswers[question.id] === optionIndex}
                                                onChange={() => setUserAnswers(prev => ({
                                                    ...prev,
                                                    [question.id]: optionIndex
                                                }))}
                                                className="sr-only"
                                            />
                                            <span className="ml-2">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700"
                        >
                            Submit Examination
                        </button>
                    </div>
                </>
            ) : (
                <div className="text-center py-8">
                    <h2 className="text-2xl font-bold mb-4">
                        Examination Complete!
                    </h2>
                    <p className="text-xl mb-2">Your Score: {score.toFixed(2)}%</p>
                    <p className="text-gray-600">
                        {score >= 70
                            ? 'Congratulations! You passed the examination.'
                            : 'Unfortunately, you did not pass. You need 70% to pass.'}
                    </p>
                    <button
                        onClick={onClose}
                        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}