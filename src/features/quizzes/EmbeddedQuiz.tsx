import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, CheckCircle2, XCircle, Award, RotateCcw, ArrowRight } from 'lucide-react';
import { getQuizById } from '../../lib/supabase';
import { QuizModel, QuizQuestion } from '../../types';

interface EmbeddedQuizProps {
  quizId: string;
  onComplete?: (score: number, total: number) => void;
}

export function EmbeddedQuiz({ quizId, onComplete }: EmbeddedQuizProps) {
  const [quiz, setQuiz] = useState<QuizModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [userScore, setUserScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let mounted = true;
    getQuizById(quizId).then((data) => {
      if (mounted) {
        setQuiz(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [quizId]);

  if (loading) {
    return (
      <div className="p-8 rounded-md bg-[#111111] border border-[#242424] text-center text-[#666666] font-mono text-xs">
        Loading assessment...
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return null;
  }

  const questions = quiz.questions;
  const currentQuestion = questions[currentIndex];

  const handleOptionToggle = (option: string) => {
    if (submitted) return;

    if (currentQuestion.type === 'multiple_select') {
      setSelectedOptions(prev => 
        prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
      );
    } else {
      setSelectedOptions([option]);
    }
  };

  const handleSubmitQuestion = () => {
    if (selectedOptions.length === 0) return;

    const correctKeys = currentQuestion.correctAnswerKeys || [];
    let isCorrect = false;

    if (currentQuestion.type === 'multiple_select') {
      const selectedSorted = [...selectedOptions].sort();
      const correctSorted = [...correctKeys].sort();
      isCorrect = JSON.stringify(selectedSorted) === JSON.stringify(correctSorted);
    } else {
      isCorrect = correctKeys.includes(selectedOptions[0]);
    }

    if (isCorrect) {
      setUserScore(prev => prev + currentQuestion.points);
    }

    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOptions([]);
      setSubmitted(false);
    } else {
      setIsFinished(true);
      if (onComplete) {
        const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);
        onComplete(userScore, totalPoints);
      }
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOptions([]);
    setSubmitted(false);
    setUserScore(0);
    setIsFinished(false);
  };

  const totalPossible = questions.reduce((acc, q) => acc + q.points, 0);

  if (isFinished) {
    const percentage = Math.round((userScore / totalPossible) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-md bg-[#111111] border border-[#242424] text-center my-6"
      >
        <div className="w-12 h-12 rounded-md bg-[#161616] border border-[#242424] text-[#C5A059] mx-auto flex items-center justify-center mb-4">
          <Award size={24} />
        </div>
        <h3 className="font-serif text-2xl font-normal text-white mb-1">Assessment Completed</h3>
        <p className="text-[#A1A1A1] text-xs font-sans mb-6">{quiz.title}</p>

        <div className="inline-flex items-center gap-6 px-6 py-3 rounded-md bg-[#0A0A0A] border border-[#242424] mb-6 font-mono">
          <div>
            <div className="text-[10px] text-[#666666] uppercase tracking-wider">SCORE</div>
            <div className="text-xl font-bold text-[#14B8A6]">{userScore} / {totalPossible}</div>
          </div>
          <div className="w-px h-6 bg-[#242424]" />
          <div>
            <div className="text-[10px] text-[#666666] uppercase tracking-wider">ACCURACY</div>
            <div className="text-xl font-bold text-white">{percentage}%</div>
          </div>
        </div>

        <div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-[#161616] hover:bg-[#222222] border border-[#242424] text-white font-mono text-xs transition-colors"
          >
            <RotateCcw size={13} />
            <span>Retake Assessment</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="my-8 p-6 rounded-md bg-[#111111] border border-[#242424]">
      {/* Quiz Header */}
      <div className="flex items-center justify-between pb-3 mb-5 border-b border-[#1B1B1B]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-[#161616] text-[#C5A059] border border-[#242424]">
            <HelpCircle size={15} />
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-white">{quiz.title}</h4>
            <span className="text-[11px] font-mono text-[#666666]">
              Question {currentIndex + 1} of {questions.length} &bull; {currentQuestion.points} pts
            </span>
          </div>
        </div>
        <div className="text-xs font-mono px-2.5 py-1 bg-[#0A0A0A] border border-[#242424] rounded-md text-[#A1A1A1]">
          Score: <span className="text-[#14B8A6] font-semibold">{userScore}</span>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="mb-5">
        <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider block mb-1">
          {currentQuestion.type === 'multiple_select' ? 'Select all that apply' : 'Select one answer'}
        </span>
        <h3 className="font-serif text-xl md:text-2xl font-normal text-white tracking-tight">
          {currentQuestion.prompt}
        </h3>
      </div>

      {/* Answer Options */}
      <div className="space-y-2 mb-6">
        {currentQuestion.options.map((option, idx) => {
          const isSelected = selectedOptions.includes(option);
          const isCorrect = currentQuestion.correctAnswerKeys?.includes(option);

          let optionStyle = "border-[#242424] bg-[#0A0A0A] text-[#A1A1A1] hover:border-[#404040] hover:text-white";

          if (submitted) {
            if (isCorrect) {
              optionStyle = "border-[#14B8A6] bg-[#14B8A6]/10 text-white";
            } else if (isSelected && !isCorrect) {
              optionStyle = "border-[#FF5722] bg-[#FF5722]/10 text-[#FF5722]";
            } else {
              optionStyle = "border-[#242424] bg-[#0A0A0A] text-[#555555] opacity-50";
            }
          } else if (isSelected) {
            optionStyle = "border-white bg-[#161616] text-white";
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionToggle(option)}
              disabled={submitted}
              className={`w-full text-left p-3.5 rounded-md border transition-all flex items-center justify-between text-xs font-sans ${optionStyle}`}
            >
              <span>{option}</span>
              {submitted && (
                isCorrect ? (
                  <CheckCircle2 size={16} className="text-[#14B8A6] shrink-0 ml-2" />
                ) : isSelected ? (
                  <XCircle size={16} className="text-[#FF5722] shrink-0 ml-2" />
                ) : null
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Banner */}
      <AnimatePresence>
        {submitted && currentQuestion.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-md bg-[#0A0A0A] border border-[#242424] text-xs text-[#A1A1A1] font-mono"
          >
            <span className="text-[#C5A059] font-medium block mb-0.5">EXPLANATION:</span>
            {currentQuestion.explanation}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Footer */}
      <div className="flex justify-end gap-2 pt-2">
        {!submitted ? (
          <button
            onClick={handleSubmitQuestion}
            disabled={selectedOptions.length === 0}
            className="px-5 py-2 rounded-md bg-[#FF5722] hover:bg-[#E64A19] text-white font-medium text-xs transition-colors disabled:opacity-40"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2 rounded-md bg-[#FF5722] hover:bg-[#E64A19] text-white font-medium text-xs transition-colors"
          >
            <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Assessment'}</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
