import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Sparkles, User, Shield, HelpCircle, Trophy, RefreshCw } from "lucide-react";
import { AgeGroup, UserProfile, CharacterState } from "../types";
import { STAGES, CHARACTER_TEMPLATES } from "../constants";

interface StudentLoginProps {
  onLoginSuccess: (profile: UserProfile, studentId: string) => void;
  initialProfile: UserProfile;
}

export default function StudentLogin({ onLoginSuccess, initialProfile }: StudentLoginProps) {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [profileFound, setProfileFound] = useState<UserProfile | null>(null);

  // Tutorial Flow States
  const [inTutorial, setInTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(1); // 1: Choose Partner, 2: Explain Rules, 3: Enter Nickname & Go!
  
  // Custom temporary registers
  const [tempType, setTempType] = useState<"fire" | "water" | "leaf">("fire");
  const [tempAge, setTempAge] = useState<AgeGroup>(AgeGroup.K7);
  const [tempName, setTempName] = useState("");

  // Search profile on backend server
  const handleCheckId = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = studentId.trim();
    if (!id) return;

    setLoading(true);
    setErrorText("");
    try {
      const res = await fetch(`/api/profiles/${encodeURIComponent(id)}`);
      const data = await res.json();
      if (data.success && data.profile) {
        setProfileFound(data.profile);
      } else {
        // ID is new, launch tutorial first!
        setErrorText("");
        setTempName(id); // default name as ID
        setInTutorial(true);
        setTutorialStep(1);
      }
    } catch (err) {
      console.error(err);
      // Fallback - check local storage
      const saved = localStorage.getItem(`wonri_math_profile_${id}`);
      if (saved) {
        setProfileFound(JSON.parse(saved));
      } else {
        setTempName(id);
        setInTutorial(true);
        setTutorialStep(1);
      }
    } finally {
      setLoading(false);
    }
  };

  // Resume playing with the found profile
  const handleResume = (resumeFromLastItem: boolean) => {
    if (!profileFound) return;
    
    let updatedProfile = { ...profileFound };
    if (!resumeFromLastItem) {
      // resets current tab, but leaves inventory and score intact
      updatedProfile.currentStageId = "stage-k7";
    }
    
    // Save to active localStorage
    localStorage.setItem("wonri_math_profile", JSON.stringify(updatedProfile));
    localStorage.setItem("wonri_math_registered", "true");
    localStorage.setItem("wonri_student_id", studentId.trim());
    
    onLoginSuccess(updatedProfile, studentId.trim());
  };

  // Complete Tutorial & Register new account
  const handleRegisterTutorial = async () => {
    const finalName = tempName.trim() || `${tempType === "fire" ? "불꽃" : tempType === "water" ? "푸른" : "숲의"} 용사`;
    const starterChar = CHARACTER_TEMPLATES[tempType];
    const initialStage = STAGES.find(s => s.ageGroup === tempAge) || STAGES[0];

    const newProfile: UserProfile = {
      ...initialProfile,
      name: finalName,
      ageGroup: tempAge,
      currentStageId: initialStage.id,
      character: {
        ...starterChar,
        avatarName: starterChar.avatarName
      }
    };

    // Save on backend database
    try {
      await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: studentId.trim(), profile: newProfile })
      });
    } catch (e) {
      console.warn("Could not save profile to server backend, saving locally only.");
    }

    localStorage.setItem(`wonri_math_profile_${studentId.trim()}`, JSON.stringify(newProfile));
    localStorage.setItem("wonri_math_profile", JSON.stringify(newProfile));
    localStorage.setItem("wonri_math_registered", "true");
    localStorage.setItem("wonri_student_id", studentId.trim());

    onLoginSuccess(newProfile, studentId.trim());
  };

  return (
    <div id="student-login-container" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-100 via-white to-sky-100 p-4 relative font-sans overflow-hidden">
      
      {/* Floating clouds / balloon decorations */}
      <div className="absolute top-12 left-12 text-7xl select-none opacity-20 animate-bounce duration-3000">🎈</div>
      <div className="absolute bottom-16 right-16 text-8xl select-none opacity-20 animate-pulse">☁️</div>
      <div className="absolute top-1/4 right-1/3 text-6xl select-none opacity-10">🌟</div>

      <AnimatePresence mode="wait">
        
        {/* BRANCH 1: ENTER STUDENT ID */}
        {!inTutorial && !profileFound && (
          <motion.div 
            key="login-id-screen"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl p-8 border-4 border-rose-200 shadow-2xl relative"
          >
            <div className="text-center mb-6">
              <span className="bg-amber-100 text-amber-850 text-xs font-black px-4 py-1 rounded-full uppercase tracking-widest inline-block animate-pulse">
                천종현수학 • 생각하는 원리셈
              </span>
              <h1 className="text-3xl font-black tracking-tight text-slate-800 mt-3 flex items-center justify-center gap-2">
                <span>원리셈 수학 원정대</span>
                <span className="text-2xl">⚔️</span>
              </h1>
              <p className="text-slate-500 text-xs mt-1.5 font-medium leading-relaxed">
                재미있게 놀며 공부하는 초등 연산 마법 판타지!<br />
                학습 아이디를 입력하여 지난 모험을 이어서 가볼까요?
              </p>
            </div>

            <form onSubmit={handleCheckId} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 mb-1.5 uppercase pl-1">
                  ✏️ 공부 아이디 (또는 한글 이름)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="예: 짱구, son123 등"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm font-bold text-slate-800"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-xs rounded-2xl shadow transition-all hover:scale-[1.02] flex items-center gap-1.5"
                  >
                    {loading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>입장하기</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
                {errorText && (
                  <p className="text-xs text-rose-500 font-bold mt-1.5 pl-1">
                    ⚠️ {errorText}
                  </p>
                )}
              </div>
            </form>

            <div className="border-t border-slate-150 pt-5 mt-6 text-center">
              <span className="text-[10px] text-slate-400 block leading-relaxed">
                로그인 아이디는 아이가 저번에 풀었던 내용을 서버에 안전하게 보관하여<br />
                cache를 지워도 계속 이어할 수 있게 해주는 마법 비밀열쇠랍니다!
              </span>
            </div>
          </motion.div>
        )}

        {/* BRANCH 2: PROFILE RESUME PROMPT */}
        {profileFound && (
          <motion.div 
            key="login-resume-screen"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="w-full max-w-md bg-white rounded-3xl p-8 border-4 border-indigo-200 shadow-2xl text-center relative"
          >
            {/* Cartoon Mascot Character Illustration */}
            <div className="w-24 h-24 rounded-full bg-indigo-50 border-4 border-amber-300 flex items-center justify-center text-6xl mx-auto shadow-inner select-none animate-bounce mt-2">
              {profileFound.character.type === "fire" ? (
                profileFound.character.level >= 12 ? "🐲" : profileFound.character.level >= 5 ? "🦖" : "🦕"
              ) : profileFound.character.type === "water" ? (
                profileFound.character.level >= 12 ? "🦭" : profileFound.character.level >= 5 ? "🦢" : "🦆"
              ) : (
                profileFound.character.level >= 12 ? "🐺" : profileFound.character.level >= 5 ? "🦊" : "🌱"
              )}
            </div>

            {/* Bubble dialog matching kid friendly styling */}
            <div className="bg-indigo-50 border-2 border-indigo-200 p-4 rounded-2xl relative my-5 max-w-sm mx-auto text-left">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[12px] border-b-indigo-200" />
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[10px] border-b-indigo-50" />
              <p className="text-xs font-black text-indigo-950 leading-relaxed text-center">
                “우와! 보고 싶었어요, <span className="text-rose-500 font-extrabold">{profileFound.name}</span> 용사님! ⭐<br />
                Lv.{profileFound.character.level} {profileFound.character.avatarName}가 하루 종일 목 빼고 기다렸어요! 저번 수학 모험터로 바로 연결할까요?”
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleResume(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-2xl text-sm shadow-md transition-all hover:scale-[1.01]"
              >
                👍 응! 저번에 하던 모험으로 이어서 갈래!
              </button>
              <button
                onClick={() => handleResume(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-2.5 rounded-2xl text-xs transition-all"
              >
                🏠 아니, 지도에서 새로운 공부 단원을 고를래
              </button>
              <button
                onClick={() => {
                  setProfileFound(null);
                  setInTutorial(true);
                  setTutorialStep(1);
                }}
                className="w-full text-[11px] text-rose-500 font-black mt-2 hover:underline"
              >
                ❌ 다른 이름으로 새로운 모험단 만들기
              </button>
            </div>
            
            <div className="text-[10px] text-slate-400 mt-4">
              공부 아이디: <strong className="text-slate-600">{studentId}</strong> | 골드코인: {profileFound.gold}G | 장비 {profileFound.inventory.length}개 보유 중
            </div>
          </motion.div>
        )}

        {/* BRANCH 3: INTERACTIVE CARTOON TUTORIAL */}
        {inTutorial && (
          <motion.div 
            key="tutorial-screens"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-white/95 rounded-3xl p-8 border-4 border-rose-300 shadow-2xl relative"
          >
            {/* Step Indicators */}
            <div className="flex gap-1.5 justify-center mb-6">
              {[1, 2, 3].map((step) => (
                <div 
                  key={step} 
                  className={`h-2.5 rounded-full transition-all ${
                    tutorialStep === step ? "w-8 bg-rose-500" : "w-2.5 bg-slate-200"
                  }`} 
                />
              ))}
            </div>

            {/* TUTORIAL STEP 1: SELECT MONSTER COMPANION */}
            {tutorialStep === 1 && (
              <div>
                <div className="text-center mb-4">
                  <span className="bg-rose-50 text-rose-600 text-[10px] px-3 py-1 rounded-full font-black uppercase">STEP 1. 나만의 모험가 짝꿍 고르기</span>
                  <h2 className="text-xl font-black text-slate-800 mt-1">함께 수학 비밀을 헤쳐나갈 파트너!</h2>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex gap-3 items-center mb-5">
                  <div className="text-4xl">👴🌾</div>
                  <div className="text-left">
                    <div className="text-xs font-black text-amber-900">수학 원리 신선 원리봇</div>
                    <p className="text-[11px] text-amber-800 leading-snug">
                      "오오, 어린 신참 모험가로다! 우리 천종현 수학 원정대는 가르기, 모으기부터 나눗셈과 분수까지 계산의 지혜를 모으는 영광의 훈련소지! 먼저 영혼의 짝꿍 몬스터를 한 마리 데려가게나!"
                    </p>
                  </div>
                </div>

                {/* Grid of character choices */}
                <div className="grid grid-cols-3 gap-3 my-4">
                  {/* Fire */}
                  <button
                    type="button"
                    onClick={() => setTempType("fire")}
                    className={`p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center relative ${
                      tempType === "fire"
                        ? "bg-red-50 border-red-400 shadow-md scale-102"
                        : "bg-slate-50 border-slate-100 opacity-70"
                    }`}
                  >
                    <div className="text-5xl mb-2 animate-bounce">🦕</div>
                    <span className="text-xs font-black text-red-700">불리 (불꽃)</span>
                    <span className="text-[9px] text-slate-500 font-medium mt-1 leading-none">활기차고 씩씩해요!</span>
                    {tempType === "fire" && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">선택</span>}
                  </button>

                  {/* Water */}
                  <button
                    type="button"
                    onClick={() => setTempType("water")}
                    className={`p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center relative ${
                      tempType === "water"
                        ? "bg-blue-50 border-blue-400 shadow-md scale-102"
                        : "bg-slate-50 border-slate-100 opacity-70"
                    }`}
                  >
                    <div className="text-5xl mb-2 animate-bounce">🦆</div>
                    <span className="text-xs font-black text-blue-700">아쿠 (물의보수)</span>
                    <span className="text-[9px] text-slate-500 font-medium mt-1 leading-none">신속하고 영리해요!</span>
                    {tempType === "water" && <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">선택</span>}
                  </button>

                  {/* Leaf */}
                  <button
                    type="button"
                    onClick={() => setTempType("leaf")}
                    className={`p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center relative ${
                      tempType === "leaf"
                        ? "bg-emerald-50 border-emerald-400 shadow-md scale-102"
                        : "bg-slate-50 border-slate-100 opacity-70"
                    }`}
                  >
                    <div className="text-5xl mb-2 animate-bounce">🌱</div>
                    <span className="text-xs font-black text-emerald-700">그리니 (나무집)</span>
                    <span className="text-[9px] text-slate-500 font-medium mt-1 leading-none">신중하고 똑똑해요!</span>
                    {tempType === "leaf" && <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">선택</span>}
                  </button>
                </div>

                {/* Character statement speech balloon */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-center my-4">
                  <p className="text-xs text-slate-600 italic">
                    {tempType === "fire" && "🔥 \"쿠아아앙! 원정대장님, 나랑 연산 마법 주먹으로 악당 몬스터들을 납작하게 눌려버려요!\""}
                    {tempType === "water" && "🦆 \"꽉꽉! 복잡한 10칸 달걀판에 부족한 짝꿍 모으기를 제일 멋지게 채워줄게요! 같이 가요!\""}
                    {tempType === "leaf" && "🌱 \"새싹새싹! 수식을 자르고 쪼개 부수는 신비한 탐험을 좋아해요. 정확히 해결해봐요!\""}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setTutorialStep(2)}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold py-3 rounded-2xl text-sm shadow flex items-center justify-center gap-1.5 mt-5"
                >
                  <span>훌륭한 파트너네요! 다음으로 넘어가기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* TUTORIAL STEP 2: STORY RULES EXPLAINED */}
            {tutorialStep === 2 && (
              <div>
                <div className="text-center mb-4">
                  <span className="bg-rose-50 text-rose-600 text-[10px] px-3 py-1 rounded-full font-black uppercase">STEP 2. 마법 수학 원정대의 규칙!</span>
                  <h2 className="text-xl font-black text-slate-800 mt-1">우리 탐험엔 두 가지 모험단이 있어요!</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                  <div className="p-4 bg-rose-50 border border-rose-200/60 rounded-2xl relative">
                    <span className="absolute top-2.5 right-2.5 text-2xl">⚔️</span>
                    <h3 className="text-xs font-black text-rose-700 mb-1">1. 원리 모험 전투</h3>
                    <p className="text-[11px] text-rose-900 leading-normal pl-0.5">
                      수식을 풀며 몬스터와 수 가르기 전투를 벌여요! 정답을 연속해서 맞출수록 크리티컬 대포 공격이 나가며, 몬스터가 떨어뜨린 골드로 상점에서 고성능 검과 투구를 장만할 수 있습니다!
                    </p>
                  </div>
                  <div className="p-4 bg-sky-50 border border-sky-200/60 rounded-2xl relative">
                    <span className="absolute top-2.5 right-2.5 text-2xl">📝</span>
                    <h3 className="text-xs font-black text-sky-700 mb-1">2. 집중 드릴 마법단</h3>
                    <p className="text-[11px] text-sky-900 leading-normal pl-0.5">
                      게임 전투 화면 없이 오롯이 아이 눈높이에 커스터마이징된 20개 집중 공부 세트입니다! 시각 도구인 10-frame 바둑주판과 동수누가 묶음 등을 보며 기초를 탄탄하고 조밀하게 튼튼히 다집니다.
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl flex gap-3 items-center my-4">
                  <div className="text-4xl animate-bounce">🎁</div>
                  <div className="text-left flex-1">
                    <h4 className="text-xs font-bold text-purple-950">특별 일일 장비 아이템 5종 시스템!</h4>
                    <p className="text-[11.5px] text-purple-900 leading-snug">
                      드릴 20문제를 완벽 정답(100% Correct)을 가거나, 일일 무작위 5퀴즈 퀘스트를 성공하면, 캐릭터의 학습 한계를 깨줄 엄청난 수련 무기인 <strong className="text-purple-700">‘지혜의 깃털펜’</strong>, <strong className="text-purple-700">‘반짝이는 연필’</strong> 등 5대 비보가 우르르 떨어집니다!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTutorialStep(3)}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold py-3 rounded-2xl text-sm shadow flex items-center justify-center gap-1.5 mt-5"
                >
                  <span>수학 마법 규칙 이해완료!</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* TUTORIAL STEP 3: NICKNAME & REGISTER */}
            {tutorialStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-2">
                  <span className="bg-rose-50 text-rose-600 text-[10px] px-3 py-1 rounded-full font-black uppercase">STEP 3. 대장 이름 적고 모험단 등록</span>
                  <h2 className="text-xl font-black text-slate-800 mt-1">용사님의 칭호와 단계 정하기!</h2>
                </div>

                {/* Explorer ID / Name Input */}
                <div>
                  <label className="block text-xs font-black text-slate-705 mb-1.5 uppercase pl-1">
                    ⚔️ 용사의 이름 (또는 ID)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="이름이나 ID 입력"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm font-bold text-slate-800"
                  />
                </div>

                {/* Select Grade AgeGroup */}
                <div>
                  <label className="block text-xs font-black text-slate-505 mb-1.5 uppercase pl-1">
                    🎓 학년(눈높이 공식 단위 설정)
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {Object.entries(AgeGroup).map(([key, value]) => {
                      const desc = {
                        [AgeGroup.K7]: "10 이하 덧셈과 가르기",
                        [AgeGroup.G1]: "수 보수와 20이하 연산",
                        [AgeGroup.G2]: "세로셈 & 구구단의 묶음",
                        [AgeGroup.G3]: "두 자리 나눗셈 & 분할 분수"
                      };
                      const selected = tempAge === value;
                      return (
                        <button
                          type="button"
                          key={key}
                          onClick={() => setTempAge(value)}
                          className={`p-2.5 text-left rounded-xl border-2 transition-all flex flex-col justify-between ${
                            selected 
                              ? "bg-rose-50/75 border-rose-500 text-rose-800 shadow" 
                              : "bg-slate-50/50 border-slate-100 hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          <span className="text-[11.5px] font-black">{value}</span>
                          <span className="text-[9.5px] opacity-75 leading-tight mt-0.5">{desc[value]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Register */}
                <button
                  type="button"
                  onClick={handleRegisterTutorial}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black py-4 rounded-2xl text-sm shadow-xl hover:shadow-2xl transition-all"
                >
                  수학 마법 원정대 1일차 대탐험 출발! 🚀
                </button>
              </div>
            )}

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
