import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, Sparkles, Trophy, Home, ArrowLeft, RefreshCw, Star, Info } from "lucide-react";
import { AgeGroup, UserProfile, QuizQuestion } from "../types";
import { generateLocalQuestion } from "../mathGenerator";
import { INITIAL_SHOP_ITEMS } from "../constants";
import MathVisualizer from "./MathVisualizer";
import TeacherExplanationModal from "./TeacherExplanationModal";

interface DailyFiveQuizProps {
  profile: UserProfile;
  studentId: string;
  onBackToHome: () => void;
  onUpdateProfile: (newProfile: UserProfile) => void;
  appsScriptUrl: string;
}

export default function DailyFiveQuiz({ profile, studentId, onBackToHome, onUpdateProfile, appsScriptUrl }: DailyFiveQuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(5).fill(null));
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [earnedGear, setEarnedGear] = useState<any | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  // Teacher modal explanation state
  const [showTeacherModal, setShowTeacherModal] = useState(false);

  // Generate 5 random math questions spanning addition, subtraction, multiplication
  useEffect(() => {
    const qList: QuizQuestion[] = [];
    for (let i = 0; i < 5; i++) {
      qList.push(generateLocalQuestion(profile.ageGroup, profile.difficultyRank));
    }
    setQuestions(qList);
    setInitialized(true);
  }, [profile.ageGroup, profile.difficultyRank]);

  const handleAnswerClick = (choiceIdx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(choiceIdx);

    const isCorrect = choiceIdx === questions[currentIdx].correctIndex;
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
    if (currentIdx < 4) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setQuizCompleted(true);
      
      const correctCount = answers.filter(a => a === true).length;
      const isPerfect = correctCount === 5;
      const percentage = Math.round((correctCount / 5) * 100);

      // standard rewards
      const expReward = isPerfect ? 50 : correctCount * 5;
      const goldReward = correctCount * 4 + (isPerfect ? 15 : 0);

      let luckyGear: any = null;
      if (isPerfect) {
        // Grant 1 of the 5 special equipments probabilistically
        const specials = INITIAL_SHOP_ITEMS.filter(item => item.id.startsWith("sp_"));
        if (specials.length > 0) {
          // Select item randomly
          const randomItem = specials[Math.floor(Math.random() * specials.length)];
          // Only add to inventory if they don't already have it
          if (!profile.inventory.some(e => e.id === randomItem.id)) {
            luckyGear = randomItem;
            setEarnedGear(randomItem);
          }
        }
      }

      // Record score history to GSheets local DB server
      try {
        await fetch("/api/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: studentId,
            name: profile.name,
            mode: "일일 5퀴즈 마법 미션",
            stage: "마법 화살 5곡 훈련",
            correctCount,
            totalCount: 5,
            percentage,
            expGained: expReward,
            goldGained: goldReward,
            appsScriptUrl: appsScriptUrl || undefined
          })
        });
      } catch (e) {
        console.warn(e);
      }

      // Update student profile with values
      let updatedProfile = { ...profile };
      updatedProfile.gold += goldReward;

      // Handle Character Level & EXP Progress
      let expAmt = expReward;
      let currentExp = profile.character.exp + expAmt;
      let currentLvl = profile.character.level;
      let nextExpLimit = profile.character.nextLevelExp;

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

      // Record tracking scores
      updatedProfile.stats = {
        ...profile.stats,
        totalSolved: profile.stats.totalSolved + 5,
        totalCorrect: profile.stats.totalCorrect + correctCount
      };

      // Set Completed Daily Mission indicator in memory
      localStorage.setItem("wonri_math_profile", JSON.stringify(updatedProfile));
      onUpdateProfile(updatedProfile);
    }
  };

  const handleRestart = () => {
    const qList: QuizQuestion[] = [];
    for (let i = 0; i < 5; i++) {
      qList.push(generateLocalQuestion(profile.ageGroup, profile.difficultyRank));
    }
    setQuestions(qList);
    setCurrentIdx(0);
    setAnswers(Array(5).fill(null));
    setSelectedAnswer(null);
    setQuizCompleted(false);
    setEarnedGear(null);
  };

  if (!initialized || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-700">일일 연산 마법 5곡 준비 중...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const correctCount = answers.filter(a => a === true).length;

  return (
    <div id="daily-five-quiz-container" className="max-w-4xl mx-auto p-2 md:p-4 space-y-6">
      
      {/* Mini top bar header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-205 text-slate-700 text-xs font-black rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>돌아가기</span>
          </button>
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black rounded-lg transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>홈으로</span>
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs font-black bg-amber-50 rounded px-2.5 py-1 text-amber-800 border border-amber-200">
          <span>🎯 일일 무작위 5퀴즈 퀘스트</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!quizCompleted ? (
          <motion.div 
            key="drill-active"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Question Screen */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
              
              {/* Question progress */}
              <div>
                <div className="flex justify-between items-center text-xs font-black text-slate-400 mb-2 px-1">
                  <span>일일 마법 미션 (덧셈 • 뺄셈 • 곱셈 융합)</span>
                  <span className="text-indigo-600 font-extrabold">{currentIdx + 1} / 5 문항</span>
                </div>

                {/* Stars visual progress indicators */}
                <div className="flex gap-4 p-3.5 bg-indigo-50/40 rounded-2xl border border-indigo-100/60 justify-center">
                  {answers.map((ans, idx) => {
                    const active = currentIdx === idx;
                    const right = ans === true;
                    const wrong = ans === false;
                    
                    let starColor = "text-slate-300";
                    if (active) starColor = "text-indigo-400 animate-pulse scale-120";
                    else if (right) starColor = "text-amber-400 drop-shadow";
                    else if (wrong) starColor = "text-rose-400";
                    
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <Star className={`w-7 h-7 fill-current transition-all ${starColor}`} />
                        <span className="text-[9px] text-slate-400 font-bold mt-1">상자 {idx + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Speech bubble Mascot instructions */}
              <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200/50 my-2 relative">
                <div className="w-14 h-14 rounded-full bg-white border-2 border-amber-300 flex items-center justify-center text-3xl shrink-0 select-none animate-bounce">
                  {profile.character.type === "fire" ? "🦖" : profile.character.type === "water" ? "🦢" : "🦊"}
                </div>
                <div className="flex-1 bg-white border-2 border-slate-200 p-3 rounded-2xl relative shadow-sm">
                  {/* bubble triangle pointing */}
                  <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[10px] border-r-slate-200" />
                  <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-white" />
                  <p className="text-[11.5px] font-black text-slate-700 leading-relaxed">
                    {selectedAnswer !== null ? (
                      selectedAnswer === currentQuestion.correctIndex 
                        ? "“으아앗 정답 조준 명중! 💥 용사님의 명철한 두뇌가 무기 대포를 충전하고 있어요! 기세를 몰아 다음 관문으로!”"
                        : "“틀려도 완전 괜찮아요! 💖 원리를 천천히 아래의 힌트 주판 상자로 깨치면 다음번엔 무조건 맞출 수 있으니까요!”"
                    ) : (
                      `“일일 마법 미션의 ${currentIdx + 1}번째 퀴즈입니다! 침착하게 전체와 부분, 빈 상자를 채울 찰떡 짝꿍 수들을 찾아보세요!”`
                    )}
                  </p>
                </div>
              </div>

              {/* Math Question Display */}
              <div className="bg-amber-50/20 border-2 border-dashed border-amber-200/60 p-6 rounded-2xl my-2">
                <p className="text-sm font-extrabold text-slate-800 leading-relaxed max-w-lg mx-auto whitespace-pre-line text-center">
                  {currentQuestion?.question}
                </p>
              </div>

              {/* Choices Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {currentQuestion?.choices.map((choice, cIdx) => {
                  const isSelected = selectedAnswer === cIdx;
                  const isCorrectAnswer = cIdx === currentQuestion.correctIndex;

                  let btnStyle = "bg-white border-slate-200 hover:border-slate-350 text-slate-800";
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
                      className={`py-4 px-2 text-sm font-black rounded-2xl border-2 transition-transform flex items-center justify-center gap-1.5 ${btnStyle} hover:scale-[1.01]`}
                    >
                      <span>{choice}</span>
                      {selectedAnswer !== null && isCorrectAnswer && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>

              {/* Continue handle */}
              {selectedAnswer !== null && (
                <div className="mt-6 border-t border-slate-100 pt-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                    <strong>원정 상자 해설:</strong> {currentQuestion.explanation}
                  </p>
                  <button
                    onClick={handleNext}
                    className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white font-black px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-1 shadow"
                  >
                    <span>{currentIdx === 4 ? "미션 보고서 받기 🏆" : "다음 퀴즈로 계속"}</span>
                  </button>
                </div>
              )}

            </div>

            {/* Right section: visualizer guide */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm self-start">
              <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-1">
                ⚙️ 원리 해독 매직 힌트
              </h3>
              <p className="text-[10.5px] text-slate-400 mb-4 leading-normal">
                상자와 조각 가이드를 보며 원리로 생각하는 능력을 키워보세요. 
              </p>

              {currentQuestion && (
                <div className="select-none">
                  <MathVisualizer instruction={currentQuestion.visualInstruction} />
                </div>
              )}
            </div>

          </motion.div>
        ) : (
          
          /* COMPLETED SCREEN */
          <motion.div 
            key="quiz-completed-box"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 border-4 border-amber-200 shadow-2xl max-w-md mx-auto text-center relative"
          >
            <div className="absolute top-4 left-6 text-4xl select-none animate-pulse">✨</div>

            <div className="w-18 h-18 rounded-full bg-amber-50 border-4 border-amber-300 flex items-center justify-center text-3xl mx-auto mb-4 relative shadow shadow-amber-100">
              <Trophy className="w-10 h-10 text-amber-500" />
            </div>

            <h2 className="text-xl font-black text-slate-800">일일 5퀴즈 퀘스트 완료!</h2>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
              기특해요! 덧셈 뺄셈 곱셈 연산이 융합된 무작위 마법 5관문을 완료했습니다.
            </p>

            {/* Scoring details */}
            <div className="grid grid-cols-2 gap-3 bg-slate-5 pr-2 pl-2 bg-slate-50 border border-slate-150 rounded-2xl p-4 my-5 items-center justify-center">
              <div className="text-center">
                <div className="text-[9px] text-slate-500 font-bold">맞춘 상자 수십율</div>
                <div className="text-lg font-black text-emerald-600">{correctCount} / 5 개</div>
              </div>
              <div className="text-center border-l border-slate-205">
                <div className="text-[9px] text-slate-500 font-bold">정답 마스터 비율</div>
                <div className="text-lg font-black text-amber-600">{correctCount * 20}%</div>
              </div>
            </div>

            {/* Standard Reward text */}
            <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-150 inline-flex items-center justify-center gap-3 text-xs font-black text-amber-950 mb-5 w-full">
              <span>수련 성사 획득:</span>
              <span>+{correctCount === 5 ? 50 : correctCount * 5} XP</span>
              <span>+{correctCount * 4 + (correctCount === 5 ? 15 : 0)} G</span>
            </div>

            {/* Special Gold reward chests */}
            {correctCount === 5 && (
              <div className="my-5 p-4 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/40 text-center relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  퍼펙트 5/5 특별 기회!
                </span>
                {earnedGear ? (
                  <div className="flex flex-col items-center gap-1.5 mt-1">
                    <div className="text-3xl">🎁</div>
                    <h4 className="text-xs font-black text-purple-900 leading-none">
                      스페셜 진보 장비 [{earnedGear.name}] 발견!
                    </h4>
                    <span className="text-[9px] text-purple-700 bg-purple-100 font-black px-2 py-0.5 rounded-full mt-1.5">
                      {earnedGear.statDescription}
                    </span>
                    <p className="text-[9px] text-slate-500 max-w-[240px] leading-snug">
                      무작위 행운 기회로 보물 장비가 보관함(무기고)에 영구 추가되었습니다! 마이 페이지나 무기상점에서 능력을 장착해보세요!
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-2 text-slate-500">
                    <span className="text-2xl mb-1">👑</span>
                    <span className="text-[10px] font-bold text-slate-600">축하합니다! 이미 5공 특유 보물을 전부 보유 상태이므로 골드 보너스 보조를 지급했습니다!</span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={onBackToHome}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-2xl text-xs transition-transform"
            >
              🏠 칭호 모험단으로 날아가기
            </button>
            <button
              onClick={handleRestart}
              className="text-xs text-indigo-600 font-extrabold block mx-auto mt-4 hover:underline"
            >
              🔄 한 번 더 도전해서 상자 열기
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {showTeacherModal && questions[currentIdx] && (
        <TeacherExplanationModal
          isOpen={showTeacherModal}
          onClose={() => setShowTeacherModal(false)}
          question={questions[currentIdx].question}
          explanation={questions[currentIdx].explanation}
          correctAnswerText={questions[currentIdx].choices[questions[currentIdx].correctIndex]}
          stageTitle="일일 5퀴즈 미션"
        />
      )}

    </div>
  );
}
