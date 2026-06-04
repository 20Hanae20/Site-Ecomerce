import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import questions from '../data/quiz_questions.json';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import api from '../services/api';

const Quiz = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [scores, setScores] = useState({ floral: 0, woody: 0, oriental: 0, fresh: 0, spicy: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    if (!questions || questions.length === 0) {
        return <div className="loader">Erreur: Les questions du quiz n'ont pas pu être chargées.</div>;
    }

    const handleAnswer = (optionScores) => {
        // Accumulate scores
        const newScores = { ...scores };
        Object.keys(optionScores).forEach(key => {
            newScores[key] = (newScores[key] || 0) + optionScores[key];
        });
        setScores(newScores);

        // Next Question or Finish
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            finishQuiz(newScores);
        }
    };

    const finishQuiz = async (finalScores) => {
        setIsSubmitting(true);
        const features = Object.values(finalScores);
        try {
            const response = await api.post('/recommendations', { features, model_name: 'hybrid' });
            navigate('/quiz/result', { state: { result: response.data } });
        } catch (error) {
            console.error("Quiz submission failed", error);
            // Fallback (demo mode if API fails)
            navigate('/quiz/result', {
                state: {
                    result: {
                        profile: finalScores,
                        recommendations: [] // Ideally show fallback perfumes
                    }, error: true
                }
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
        <div className="page-container quiz-page">
            <div className="bg-orb orb-1"></div>

            <div className="quiz-container glass-premium">
                <header className="quiz-header">
                    <span className="step-count">Question {currentQuestion + 1} / {questions.length}</span>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                </header>

                <div className="question-section">
                    <h2 className="question-text">{questions[currentQuestion].question}</h2>

                    <div className="options-grid">
                        {questions[currentQuestion].options.map((option, index) => (
                            <button
                                key={index}
                                className="option-card"
                                onClick={() => handleAnswer(option.scores)}
                                disabled={isSubmitting}
                            >
                                <span className="option-text">{option.text}</span>
                                <ArrowRight className="arrow-icon" size={20} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .quiz-page {
                    min-height: 80vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                .quiz-container {
                    width: 100%;
                    max-width: 800px;
                    padding: 3rem;
                    border-radius: 2rem;
                    position: relative;
                    z-index: 2;
                }
                .quiz-header {
                    margin-bottom: 3rem;
                }
                .step-count {
                    display: block;
                    text-align: center;
                    color: var(--primary);
                    margin-bottom: 1rem;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }
                .progress-bar {
                    height: 4px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 2px;
                    overflow: hidden;
                }
                .progress-fill {
                    height: 100%;
                    background: var(--primary);
                    transition: width 0.5s ease;
                }
                .question-text {
                    font-size: 2rem;
                    text-align: center;
                    margin-bottom: 3rem;
                    line-height: 1.3;
                }
                .options-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
                .option-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 1.5rem 2rem;
                    border-radius: 1rem;
                    color: white;
                    text-align: left;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all 0.3s ease;
                }
                .option-card:hover {
                    background: rgba(212, 175, 55, 0.1);
                    border-color: var(--primary);
                    transform: translateY(-2px);
                }
                .arrow-icon {
                    opacity: 0;
                    transform: translateX(-10px);
                    transition: all 0.3s;
                    color: var(--primary);
                }
                .option-card:hover .arrow-icon {
                    opacity: 1;
                    transform: translateX(0);
                }
                
                @media (max-width: 768px) {
                    .quiz-container { padding: 1.5rem; }
                    .options-grid { grid-template-columns: 1fr; }
                    .question-text { font-size: 1.5rem; }
                }
            `}</style>
        </div>
    );
};

export default Quiz;
