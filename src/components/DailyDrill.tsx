import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, Award, Trophy, Sparkles, ArrowLeft, Home, ChevronRight, Coins, RefreshCw } from "lucide-react";
import { AgeGroup, UserProfile, QuizQuestion } from "../types";
import { generateLocalQuestion } from "../mathGenerator";
import { INITIAL_SHOP_ITEMS } from "../constants";
import MathVisualizer from "./MathVisualizer";
import TeacherExplanationModal from "./TeacherExplanationModal";

interface DailyDrillProps {
  profile: UserProfile;
  studentId: string;
  onBackToHome: () => void;
  onUpdateProfile: (newProfile: UserProfile) => void;
  appsScriptUrl: string;
}

export default function DailyDrill({ profile, studentId, onBackToHome, onUpdateProfile, appsScriptUrl }: DailyDrillProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(20).fill(null));
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [earnedGear, setEarnedGear] = useState<any | null>(null);
  
  // Teacher modal explanation state
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  
  // Game loading state
  const [initialized, setInitialized] = useState(false);

  // Generate 20 problems appropriate to the kid's age level
  useEffect(() => {
    const qList: QuizQuestion[] = [];
    for (let i = 0; i < 20; i++) {
      qList.push(generateLocalQuestion(profile.ageGroup, profile.difficultyRank));
    }
    setQuestions(qList);
    setInitialized(true);
  }, [profile.ageGroup, profile.difficultyRank]);

  // Mascot Companion dialogue templates
  const getMascotDialogue = () => {
    const avatar = profile.character.avatarName;
    const isFirstHalf = currentIdx < 10;
    const isStriving = answers.filter(a => a === true).length >= (currentIdx * 0.8);
    
    if (selectedAnswer !== null) {
      const right = selectedAnswer === questions[currentIdx]?.correctIndex;
      return right 
        ? `“굉장해요 용사님! 정답을 완전히 맞췄습니다! 💖 쪼개고 한 상자에 담는 원리 감각이 무럭무럭 자라고 있어요!”`
        : `“아쉽게 다른 방향으로 화살이 날아갔네요. 😢 하지만 괜찮아요! 아래의 시각 교구를 천천히 살펴보면 수의 비밀이 보이니까요!”`;
    }

    if (currentIdx === 0) {
      return `“용사님! 오늘 한계를 깨어줄 20문제 ‘집중 드릴 마법 마당’에 준비되셨나요? 100% 퍼펙트 상자를 열어 보물을 차지합시다!”`;
    }
    if (currentIdx === 19) {
      return `“우와! 드디어 마지막 20번째 수집 문지기입니다! 이 문제만 집중해서 딱 격파하면 명예의 기록이 엄마한테 전달됩니다!”`;
    }
    if (isStriving) {
      return `“대단해요! 아주 훌륭한 속도로 완벽을 유지하며 나아가고 있습니다! 이 기세라면 '반짝이는 연필' 장비를 얻을 수 있을 무드가 드는군요! 🔥”`;
    }
    return `“침착하게 숫자의 가르기와 모으기를 머릿속 주판으로 그려봐요. 짝꿍이 누구였죠? 접시에 알맞게 나눠 담아봐요!”`;
  };

  const currentQuestion = questions[currentIdx];

  const handleAnswerClick = (choiceIdx: number) => {
    if (selectedAnswer !== null) return; // answered already
    setSelectedAnswer(choiceIdx);

    const isCorrect = choiceIdx === currentQuestion.correctIndex;
    const updatedAnswers = [...answers];
    updatedAnswers[currentIdx] = isCorrect;
    setAnswers(updatedAnswers);

    if (!isCorrect) {
      setTimeout(() => {
        setShowTeacherModal(true);
      }, 500);
    }
  };

  const handleNext = async () => {
    setSelectedAnswer(null);
    if (currentIdx < 19) {
      setCurrentIdx(prev => prev + 1);
    } else {
      // Completed the 20 Daily Drill questions!
      setQuizCompleted(true);
      
      const correctCount = answers.filter(a => a === true).length;
      const isPerfect = correctCount === 20;
      const percentage = Math.round((correctCount / 20) * 100);
      
      // Calculate Rewards
      const expReward = isPerfect ? 50 : Math.round(correctCount * 1.5 + 10);
      const goldReward = correctCount * 2 + (isPerfect ? 30 : 5);

      let luckyGear: any = null;
      // Probabilistic legendary gear grant under 100% score
      if (isPerfect) {
        // Collect our 5 special equipments from shop registry
        const specials = INITIAL_SHOP_ITEMS.filter(item => item.id.startsWith("sp_"));
        if (specials.length > 0) {
          const matched = specials[Math.floor(Math.random() * specials.length)];
          // Only award if user doesn't already have it
          if (!profile.inventory.some(e => e.id === matched.id)) {
            luckyGear = matched;
            setEarnedGear(matched);
          }
        }
      }

      // Record scores to backend server for Mother's sheet validation
      try {
        await fetch("/api/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: studentId,
            name: profile.name,
            mode: "일일 연산 드릴 (20문제)",
            stage: `${profile.ageGroup} 집중 학습`,
            correctCount,
            totalCount: 20,
            percentage,
            expGained: expReward,
            goldGained: goldReward,
            appsScriptUrl: appsScriptUrl || undefined
          })
        });
      } catch (err) {
        console.warn("Maternal Google Sheet update local delay:", err);
      }

      // Update student profile state (gold, character exp & inventory)
      let updatedProfile = { ...profile };
      updatedProfile.gold += goldReward;
      
      // Check character level ups with rewards
      let expAmt = expReward;
      let currentExp = profile.character.exp + expAmt;
      let currentLvl = profile.character.level;
      let nextExpLimit = profile.character.nextLevelExp;
      let evoStage = profile.character.evolutionStage;
      let currentAvatarName = profile.character.avatarName;
      let currentDesc = profile.character.description;

      while (currentExp >= nextExpLimit) {
        currentExp -= nextExpLimit;
        currentLvl += 1;
        nextExpLimit = Math.round(nextExpLimit * 1.35);
      }

      updatedProfile.character = {
        ...profile.character,
        level: currentLvl,
        exp: currentExp,
        nextLevelExp: nextExpLimit
      };

      if (luckyGear) {
        updatedProfile.inventory = [...profile.inventory, { ...luckyGear, equipped: false }];
      }

      updatedProfile.stats = {
        ...profile.stats,
        totalSolved: profile.stats.totalSolved + 20,
        totalCorrect: profile.stats.totalCorrect + correctCount,
        correctStreak: isPerfect ? 20 : 0
      };

      // Save to localStorage
      localStorage.setItem("wonri_math_profile", JSON.stringify(updatedProfile));
      onUpdateProfile(updatedProfile);
    }
  };

  const handleRestart = () => {
    const qList: QuizQuestion[] = [];
    for (let i = 0; i < 20; i++) {
      qList.push(generateLocalQuestion(profile.ageGroup, profile.difficultyRank));
    }
    setQuestions(qList);
    setCurrentIdx(0);
    setAnswers(Array(20).fill(null));
    setSelectedAnswer(null);
    setQuizCompleted(false);
    setEarnedGear(null);
  };

  if (!initialized || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-slate-100 shadow-md">
        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm font-black text-slate-800">어린이 집중 수연산 드릴을 발족하는 중...</p>
      </div>
    );
  }

  const correctAnswersCount = answers.filter(a => a === true).length;

  return (
    <div id="daily-drill-container" className="max-w-4xl mx-auto p-2 md:p-4 space-y-6">
      
      {/* Dynamic Sub-header Navigation options */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>돌아가기</span>
          </button>
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-black rounded-lg transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>홈으로</span>
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <span>공부 그룹:</span>
          <span className="text-slate-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150 font-black">{profile.ageGroup}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!quizCompleted ? (
          <motion.div 
            key="active-drill"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left section: Questions & choices */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm flex flex-col justify-between spacing-y-5">
              
              {/* Progress visual index indicators */}
              <div>
                <div className="flex justify-between items-center text-xs font-black text-slate-400 mb-2 px-1">
                  <span>일일 기초 수학 드릴셈</span>
                  <span className="text-slate-800 font-extrabold">{currentIdx + 1} / 20 문제</span>
                </div>
                
                {/* 20 Progress Dots with animation */}
                <div className="grid grid-cols-10 gap-1.5 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                  {answers.map((ans, idx) => {
                    const isCurrent = currentIdx === idx;
                    const isCorrect = ans === true;
                    const isIncorrect = ans === false;

                    let colorStyle = "bg-slate-250 border-slate-300";
                    if (isCurrent) colorStyle = "bg-indigo-300 border-2 border-indigo-500 scale-110";
                    else if (isCorrect) colorStyle = "bg-emerald-500 border-emerald-600 shadow-sm text-white";
                    else if (isIncorrect) colorStyle = "bg-rose-500 border-rose-600 text-white";

                    return (
                      <div 
                        key={idx} 
                        className={`h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${colorStyle}`}
                      >
                        {isCorrect ? <Check className="w-3.5 h-3.5" /> : isIncorrect ? <X className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Speech bubble Mascot illustration */}
              <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200/50 my-5 relative">
                <div className="w-14 h-14 rounded-full bg-white border-2 border-amber-300 flex items-center justify-center text-3xl shrink-0 select-none hover:scale-105 transition-transform">
                  {profile.character.type === "fire" ? "🦕" : profile.character.type === "water" ? "🦆" : "🌱"}
                </div>
                {/* Speech Bubble pointing arrow */}
                <div className="flex-1 bg-white border-2 border-slate-200 p-3 rounded-2xl relative shadow-sm">
                  <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[10px] border-r-slate-200" />
                  <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-white" />
                  <p className="text-[11.5px] font-black text-slate-800 leading-relaxed">
                    {getMascotDialogue()}
                  </p>
                </div>
              </div>

              {/* Main math question card */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50/40 border-4 border-dashed border-indigo-300 p-8 rounded-3xl my-4 text-center shadow-inner relative overflow-hidden">
                <div className="absolute top-2 right-2 text-2xl opacity-20 pointer-events-none">✨</div>
                <p className="text-lg md:text-2xl font-black text-slate-900 leading-relaxed max-w-2xl mx-auto whitespace-pre-line">
                  {currentQuestion?.question}
                </p>
              </div>

              {/* Choice Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-5">
                {currentQuestion?.choices.map((choice, cIdx) => {
                  const isSelected = selectedAnswer === cIdx;
                  const isCorrectAnswer = cIdx === currentQuestion.correctIndex;

                  let btnStyle = "bg-white border-slate-200 hover:border-slate-350 text-slate-800 hover:bg-slate-50";
                  if (selectedAnswer !== null) {
                    if (isCorrectAnswer) {
                      btnStyle = "bg-emerald-500 text-white border-emerald-600 shadow-md";
                    } else if (isSelected) {
                      btnStyle = "bg-rose-500 text-white border-rose-600";
                    } else {
                      btnStyle = "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed";
                    }
                  }

                  return (
                    <button
                      key={cIdx}
                      disabled={selectedAnswer !== null}
                      onClick={() => handleAnswerClick(cIdx)}
                      className={`py-5 px-4 text-base md:text-xl font-black rounded-3xl border-3 transition-transform flex items-center justify-center gap-2 shadow-sm ${btnStyle} hover:scale-[1.03] active:scale-95 duration-100`}
                    >
                      <span>{choice}</span>
                      {selectedAnswer !== null && isCorrectAnswer && <Check className="w-5 h-5 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>

              {/* Next Question / Continue Bar */}
              {selectedAnswer !== null && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 border-t border-slate-100 pt-4 flex flex-col md:flex-row gap-4 items-center justify-between"
                >
                  <p className="text-xs text-slate-500 leading-normal max-w-sm">
                    <strong>원정 상자 해설:</strong> {currentQuestion.explanation}
                  </p>
                  <button
                    onClick={handleNext}
                    className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white font-black px-6 py-3.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow"
                  >
                    <span>{currentIdx === 19 ? "완료하고 보상받기 🏆" : "다음 문제로 이동"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

            </div>

            {/* Right section: visualizer guide */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm self-start">
              <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-1 select-none">
                🧠 두뇌 계산 바구니 (시각 교구)
              </h3>
              <p className="text-[10.5px] text-slate-400 mb-4 leading-normal">
                연결 블록과 수연산 판을 보면서 10 만드는 규칙을 눈으로 익힐 수 있어요.
              </p>

              {currentQuestion && (
                <div className="select-none">
                  <MathVisualizer instruction={currentQuestion.visualInstruction} />
                </div>
              )}
            </div>

          </motion.div>
        ) : (
          
          /* DRILL COMPLETED SUMMARY CARD */
          <motion.div 
            key="drill-completed"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-3xl p-8 border-4 border-indigo-200 shadow-2xl max-w-xl mx-auto text-center relative overflow-hidden"
          >
            {/* Visual Confetti / Stars */}
            <div className="absolute top-4 left-6 text-4xl select-none animate-pulse">🌟</div>
            <div className="absolute bottom-6 right-8 text-4xl select-none animate-pulse">✨</div>

            <div className="w-20 h-20 rounded-full bg-yellow-50 border-4 border-yellow-300 flex items-center justify-center text-4xl mx-auto mb-4 relative shadow shadow-yellow-100">
              <Trophy className="w-10 h-10 text-yellow-500" />
            </div>

            <h2 className="text-2xl font-black text-slate-800">일일 완벽 수학 드릴 완성!</h2>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
              용사님! 기특하게도 집중 수학 드릴셈 20문항을 전부 해결하셨습니다.<br />
              엄마의 대시보드 및 구글 주간 계산 일지에 정성스레 수록되었답니다!
            </p>

            {/* Score Showcase */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-150 my-6">
              <div className="text-center">
                <div className="text-[9px] text-slate-400 font-bold uppercase">풀어낸 문릿셈</div>
                <div className="text-lg font-black text-slate-800">20개</div>
              </div>
              <div className="text-center border-x border-slate-200">
                <div className="text-[9px] text-slate-400 font-bold uppercase">정답 오밀조밀</div>
                <div className="text-lg font-black text-emerald-600">{correctAnswersCount}개</div>
              </div>
              <div className="text-center">
                <div className="text-[9px] text-slate-400 font-bold uppercase">정답 백분율</div>
                <div className="text-lg font-black text-indigo-600">
                  {Math.round((correctAnswersCount / 20) * 100)}%
                </div>
              </div>
            </div>

            {/* EXP / Gold rewards box */}
            <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100 flex items-center justify-around text-xs font-bold leading-none mb-6 text-slate-700">
              <span>수련 성과 보너스:</span>
              <span className="text-indigo-600">+{correctAnswersCount === 20 ? 50 : Math.round(correctAnswersCount * 1.5 + 10)} XP</span>
              <span className="text-amber-600">+{correctAnswersCount * 2 + (correctAnswersCount === 20 ? 30 : 0)} GOLD 코인</span>
            </div>

            {/* 100% Perfect Gear Chest opening! */}
            {correctAnswersCount === 20 && (
              <div className="my-6 p-4 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/40 text-center relative balance">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  퍼펙트 보물상자 보너스
                </span>
                {earnedGear ? (
                  <div className="flex flex-col items-center gap-1.5 mt-1.5">
                    <div className="text-4xl animate-bounce">🎁</div>
                    <h4 className="text-xs font-black text-purple-900">
                      신화 장비 {earnedGear.name} 득템!
                    </h4>
                    <p className="text-[10px] text-slate-500 max-w-[280px]">
                      {earnedGear.statDescription}! 무기 보관함에서 착용하여 원리 마법 융합율을 올려 보세요!
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-2 text-slate-500">
                    <span className="text-2xl mb-1">🪙</span>
                    <span className="text-xs font-bold text-slate-600">이미 보물 전 장비를 전부 가지고 있어 골드 보조금을 지급받았습니다!</span>
                  </div>
                )}
              </div>
            )}

            {/* Navigation options to exit */}
            <div className="flex gap-2">
              <button
                onClick={onBackToHome}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-2xl text-xs transition-transform hover:scale-[1.01]"
              >
                🏠 탐험 단원 지도로 돌아가기
              </button>
              <button
                onClick={handleRestart}
                className="px-5 bg-slate-100 hover:bg-slate-205 text-slate-600 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 border border-slate-205"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>다시하기</span>
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {showTeacherModal && currentQuestion && (
        <TeacherExplanationModal
          isOpen={showTeacherModal}
          onClose={() => setShowTeacherModal(false)}
          question={currentQuestion.question}
          explanation={currentQuestion.explanation}
          correctAnswerText={currentQuestion.choices[currentQuestion.correctIndex]}
          stageTitle="일일 연산 드릴 20문제"
        />
      )}

    </div>
  );
}
