import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Users, 
  Clock, 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Trophy, 
  Crown,
  Eye,
  LogOut,
  Hash
} from 'lucide-react';
import { 
  QuizSession, 
  QuizQuestion, 
  LeaderboardEntry, 
  UserProfile 
} from '../../types';
import { 
  getQuizSessionByCode, 
  getQuizById, 
  joinQuizSession, 
  submitLiveAnswer, 
  getSessionLeaderboard, 
  updateSessionState,
  createLiveQuizSession
} from '../../lib/supabase';
import { sampleQuiz } from '../../lib/seedData';

interface LiveQuizRoomProps {
  initialCode?: string;
  currentUser: UserProfile;
  onExit: () => void;
}

export function LiveQuizRoom({ initialCode, currentUser, onExit }: LiveQuizRoomProps) {
  const [pinCode, setPinCode] = useState(initialCode || '');
  const [session, setSession] = useState<QuizSession | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{ isCorrect: boolean; points: number } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (initialCode) {
      handleJoin(initialCode);
    }
  }, [initialCode]);

  useEffect(() => {
    if (!session) return;

    const interval = setInterval(async () => {
      const refreshed = await getQuizSessionByCode(session.joinCode);
      if (refreshed) {
        setSession(refreshed);

        if (['reveal', 'final_results'].includes(refreshed.status)) {
          const lb = await getSessionLeaderboard(
            refreshed.id, 
            currentUser.id, 
            refreshed.settingsSnapshot?.leaderboardMode || 'top3_and_me'
          );
          setLeaderboard(lb);
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [session, currentUser.id]);

  useEffect(() => {
    if (!session || session.status !== 'live_question') return;

    const currentQ = questions[session.currentQuestionIndex];
    const duration = currentQ?.timeLimitSeconds || 30;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.status, session?.currentQuestionIndex, questions]);

  const handleJoin = async (overrideCode?: string) => {
    const code = (overrideCode || pinCode).trim();
    if (code.length < 5) return;

    setError(null);
    const targetSession = await getQuizSessionByCode(code);
    if (!targetSession) {
      setError('Session PIN not found. Please verify the code.');
      return;
    }

    const quiz = await getQuizById(targetSession.quizId);
    if (quiz) {
      setQuestions(quiz.questions || []);
    }

    await joinQuizSession(targetSession.id, currentUser.id, currentUser.displayName);
    setSession(targetSession);
    setJoined(true);
    setIsHost(targetSession.hostId === currentUser.id);
  };

  const handleHostNewSession = async () => {
    const newSession = await createLiveQuizSession(sampleQuiz.id, currentUser.id);
    const quiz = await getQuizById(newSession.quizId);
    if (quiz) {
      setQuestions(quiz.questions || []);
    }
    setSession(newSession);
    setIsHost(true);
    setJoined(true);
  };

  const handleAnswerClick = (option: string) => {
    if (hasSubmitted || !session || session.status !== 'live_question') return;
    const currentQ = questions[session.currentQuestionIndex];

    if (currentQ.type === 'multiple_select') {
      setSelectedAnswers(prev =>
        prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
      );
    } else {
      setSelectedAnswers([option]);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!session || selectedAnswers.length === 0 || hasSubmitted) return;

    const currentQ = questions[session.currentQuestionIndex];

    const result = await submitLiveAnswer(
      session.id,
      currentQ.id,
      currentUser.id,
      selectedAnswers,
      timeLeft
    );

    setHasSubmitted(true);
    setSubmissionFeedback({ isCorrect: result.isCorrect, points: result.pointsAwarded });
  };

  const handleHostStartQuestion = async (qIndex: number) => {
    if (!session) return;
    const targetQ = questions[qIndex];
    const dur = targetQ?.timeLimitSeconds || 30;
    setTimeLeft(dur);
    setSelectedAnswers([]);
    setHasSubmitted(false);
    setSubmissionFeedback(null);

    await updateSessionState(session.id, 'live_question', qIndex, dur);
    setSession(prev => prev ? { ...prev, status: 'live_question', currentQuestionIndex: qIndex } : null);
  };

  const handleHostRevealAnswer = async () => {
    if (!session) return;
    await updateSessionState(session.id, 'reveal', session.currentQuestionIndex);
    setSession(prev => prev ? { ...prev, status: 'reveal' } : null);
  };

  const handleHostEndSession = async () => {
    if (!session) return;
    await updateSessionState(session.id, 'final_results');
    setSession(prev => prev ? { ...prev, status: 'final_results' } : null);
  };

  if (!joined || !session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0A0A0A] text-white relative">
        <button
          onClick={onExit}
          className="absolute top-6 left-6 text-xs font-mono text-[#A1A1A1] hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <LogOut size={14} />
          <span>Exit Arena</span>
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#111111] border border-[#242424] rounded-lg p-8 text-center"
        >
          <div className="w-12 h-12 rounded-md bg-[#161616] border border-[#242424] text-[#C5A059] mx-auto flex items-center justify-center mb-5">
            <Trophy size={22} />
          </div>

          <h2 className="font-serif text-2xl font-normal tracking-tight mb-1 text-white">Live Quiz Arena</h2>
          <p className="text-xs text-[#A1A1A1] font-sans mb-6">
            Enter the 6-digit session PIN displayed on the presentation screen.
          </p>

          <div className="space-y-4 mb-6">
            <input
              type="text"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000 000"
              maxLength={6}
              className="w-full py-3.5 text-center text-3xl font-mono tracking-[0.3em] bg-[#0A0A0A] border border-[#242424] rounded-md text-white placeholder-[#404040] focus:outline-none focus:border-white transition-colors font-bold"
            />

            {error && <p className="text-xs text-[#FF5722] font-mono">{error}</p>}

            <button
              onClick={() => handleJoin()}
              disabled={pinCode.length < 5}
              className="w-full py-3 rounded-md bg-[#FF5722] hover:bg-[#E64A19] text-white font-medium text-xs transition-colors disabled:opacity-40"
            >
              Enter Session
            </button>
          </div>

          <div className="border-t border-[#1B1B1B] pt-4">
            <p className="text-[10px] text-[#666666] mb-2 font-mono uppercase tracking-wider">ORGANIZER CONTROLS</p>
            <button
              onClick={handleHostNewSession}
              className="text-xs font-mono text-[#A1A1A1] hover:text-white transition-colors"
            >
              Host a New Live Session &rarr;
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQ = questions[session.currentQuestionIndex];

  return (
    <div className="flex-1 flex flex-col bg-[#0A0A0A] text-white overflow-hidden relative">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-[#242424] px-6 flex items-center justify-between bg-[#0A0A0A] shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="text-[#666666] hover:text-white p-1 rounded-md transition-colors"
            title="Leave Session"
          >
            <LogOut size={16} />
          </button>
          <div>
            <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider block">
              {isHost ? 'HOST CONTROL' : 'PARTICIPANT'}
            </span>
            <span className="font-mono text-xs text-[#D4D4D4]">
              PIN: <span className="text-[#C5A059] font-bold">{session.joinCode}</span>
            </span>
          </div>
        </div>

        {/* Status / Question Progress */}
        <div className="font-mono text-xs text-[#A1A1A1] bg-[#111111] px-3 py-1 rounded-md border border-[#242424]">
          Q {session.currentQuestionIndex + 1} / {questions.length} &bull; <span className="text-white capitalize">{session.status.replace('_', ' ')}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-mono text-[#666666] hidden sm:block">
            Participant: <span className="text-white">{currentUser.displayName}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-6 md:p-10 flex flex-col items-center justify-center max-w-4xl mx-auto w-full min-h-full">
        {/* LOBBY STATE */}
        {session.status === 'lobby' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center max-w-lg w-full"
          >
            <div className="inline-block p-6 rounded-md bg-[#111111] border border-[#242424] mb-6">
              <span className="text-[10px] font-mono text-[#666666] uppercase tracking-widest block mb-1">SESSION PIN</span>
              <span className="text-5xl md:text-6xl font-bold font-mono tracking-[0.2em] text-[#C5A059]">
                {session.joinCode}
              </span>
            </div>

            <h2 className="font-serif text-3xl font-normal text-white mb-2">Waiting in Lobby</h2>
            <p className="text-[#A1A1A1] text-xs font-sans mb-8">
              {isHost 
                ? 'Share the PIN with attendees and launch when ready.' 
                : 'Waiting for the host to start the first assessment question.'}
            </p>

            {isHost && (
              <button
                onClick={() => handleHostStartQuestion(0)}
                className="px-8 py-3 rounded-md bg-[#FF5722] hover:bg-[#E64A19] text-white font-medium text-sm transition-colors flex items-center gap-2 mx-auto"
              >
                <Play size={16} />
                <span>Start Live Session</span>
              </button>
            )}
          </motion.div>
        )}

        {/* LIVE QUESTION STATE */}
        {session.status === 'live_question' && currentQ && (
          <div className="w-full">
            {/* Timer and Points Bar */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#1B1B1B]">
              <div className="flex items-center gap-2 font-mono text-xs bg-[#111111] border border-[#242424] px-3 py-1.5 rounded-md">
                <Clock size={13} className={timeLeft <= 5 ? 'text-[#FF5722]' : 'text-[#666666]'} />
                <span className={`font-bold ${timeLeft <= 5 ? 'text-[#FF5722]' : 'text-white'}`}>
                  {timeLeft}s
                </span>
              </div>

              <div className="font-mono text-xs text-[#A1A1A1]">
                Points: <span className="text-[#14B8A6] font-semibold">{currentQ.points}</span>
              </div>
            </div>

            {/* Prompt */}
            <motion.h2 
              key={currentQ.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-serif text-2xl md:text-4xl font-normal text-white text-center mb-8 leading-tight tracking-tight"
            >
              {currentQ.prompt}
            </motion.h2>

            {/* Answer Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedAnswers.includes(opt);
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerClick(opt)}
                    disabled={hasSubmitted}
                    className={`p-5 rounded-md border text-left font-sans text-sm transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-white bg-[#161616] text-white'
                        : 'border-[#242424] bg-[#111111] hover:border-[#404040] text-[#D4D4D4]'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <CheckCircle2 size={18} className="text-[#C5A059] shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            {/* Participant Action */}
            {!isHost && (
              <div className="flex justify-center">
                {!hasSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswers.length === 0}
                    className="px-8 py-2.5 rounded-md bg-[#FF5722] hover:bg-[#E64A19] text-white font-medium text-xs transition-colors disabled:opacity-40"
                  >
                    Lock In Answer
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-[#14B8A6] font-mono text-xs bg-[#111111] border border-[#242424] px-5 py-2 rounded-md">
                    <CheckCircle2 size={15} />
                    <span>Answer submitted. Waiting for reveal...</span>
                  </div>
                )}
              </div>
            )}

            {/* Host Controls */}
            {isHost && (
              <div className="border-t border-[#242424] pt-5 flex justify-center gap-3">
                <button
                  onClick={handleHostRevealAnswer}
                  className="px-6 py-2 rounded-md bg-white text-[#0A0A0A] hover:bg-[#E8E8E8] font-medium flex items-center gap-2 transition-colors text-xs"
                >
                  <Eye size={14} />
                  <span>Reveal Answer & Standings</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* REVEAL STATE */}
        {session.status === 'reveal' && currentQ && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full text-center"
          >
            <div className="mb-6">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#666666] mb-2">CORRECT ANSWER</h3>
              <div className="inline-block p-4 rounded-md bg-[#111111] border border-[#14B8A6]/50 text-[#14B8A6] font-mono text-lg md:text-xl">
                {currentQ.correctAnswerKeys?.join(', ')}
              </div>
              {currentQ.explanation && (
                <p className="mt-3 text-xs text-[#A1A1A1] max-w-md mx-auto font-sans">{currentQ.explanation}</p>
              )}
            </div>

            {/* Leaderboard Snapshot */}
            <div className="w-full max-w-md mx-auto bg-[#111111] border border-[#242424] rounded-md p-5 mb-6 text-left">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#666666] mb-3 flex items-center gap-2">
                <Trophy size={13} className="text-[#C5A059]" />
                Live Standings
              </h4>
              <div className="space-y-1.5">
                {leaderboard.slice(0, 5).map((entry) => (
                  <div 
                    key={entry.userId}
                    className={`flex items-center justify-between p-2.5 rounded-md border text-xs font-mono ${
                      entry.isCurrentUser 
                        ? 'border-white bg-[#161616] text-white' 
                        : 'border-[#242424] bg-[#0A0A0A] text-[#A1A1A1]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[#666666] w-4">#{entry.rank}</span>
                      <span className="text-white">{entry.displayName}</span>
                    </div>
                    <span className="text-[#14B8A6] font-semibold">{entry.totalPoints} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Host Next Step */}
            {isHost && (
              <div className="flex justify-center gap-3">
                {session.currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={() => handleHostStartQuestion(session.currentQuestionIndex + 1)}
                    className="px-6 py-2.5 rounded-md bg-[#FF5722] hover:bg-[#E64A19] text-white font-medium text-xs flex items-center gap-2 transition-colors"
                  >
                    <span>Next Question</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={handleHostEndSession}
                    className="px-6 py-2.5 rounded-md bg-white text-[#0A0A0A] hover:bg-[#E8E8E8] font-medium text-xs flex items-center gap-2 transition-colors"
                  >
                    <Award size={14} />
                    <span>View Final Standings</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* FINAL RESULTS PODIUM STATE */}
        {session.status === 'final_results' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg text-center"
          >
            <div className="w-14 h-14 rounded-md bg-[#161616] border border-[#242424] text-[#C5A059] mx-auto flex items-center justify-center mb-5">
              <Crown size={28} />
            </div>

            <h2 className="font-serif text-3xl font-normal text-white mb-1">Assessment Complete</h2>
            <p className="text-xs text-[#A1A1A1] font-sans mb-8">Final milestone leaderboards</p>

            {/* Podium */}
            <div className="space-y-2 mb-8 text-left">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`p-3 rounded-md border flex items-center justify-between text-xs font-mono ${
                    entry.rank === 1
                      ? 'border-[#C5A059] bg-[#161616] text-[#C5A059]'
                      : entry.rank === 2
                      ? 'border-[#404040] bg-[#111111] text-[#D4D4D4]'
                      : entry.rank === 3
                      ? 'border-[#242424] bg-[#0A0A0A] text-[#A1A1A1]'
                      : 'border-[#1B1B1B] bg-[#0A0A0A] text-[#666666]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-[2px] bg-[#0A0A0A] border border-[#242424] flex items-center justify-center font-bold">
                      {entry.rank}
                    </span>
                    <div>
                      <span className="font-medium text-white block">{entry.displayName}</span>
                      <span className="text-[10px] text-[#666666]">{entry.correctCount} correct answers</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#14B8A6] block">{entry.totalPoints}</span>
                    <span className="text-[9px] text-[#666666] uppercase">PTS</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onExit}
              className="px-6 py-2.5 rounded-md bg-[#161616] hover:bg-[#222222] border border-[#242424] text-white font-mono text-xs transition-colors"
            >
              Return to Guide
            </button>
          </motion.div>
        )}
        </div>
      </div>
    </div>
  );
}
