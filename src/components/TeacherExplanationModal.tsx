import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { GraduationCap, Lightbulb, CheckCircle2, ArrowRight, BookOpen, Volume2 } from "lucide-react";

interface TeacherExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  explanation: string;
  correctAnswerText?: string;
  stageTitle?: string;
}

export default function TeacherExplanationModal({
  isOpen,
  onClose,
  question,
  explanation,
  correctAnswerText,
  stageTitle
}: TeacherExplanationModalProps) {
  if (!isOpen) return null;

  // Split explanation into steps if there are double newlines or standard markers
  const steps = explanation.split("\n").filter(line => line.trim().length > 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        {/* Modal Backdrop Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden border-4 border-amber-400 shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header Banner - Cheon Jong-Hyeon Math Lab Style */}
          <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 p-4 shrink-0 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/20 rounded-xl">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full block w-fit">
                  천종현수학연구소 원리 코칭
                </span>
                <h3 className="text-base font-black tracking-tight leading-tight">
                  원리 멘토 천선생님의 수리 비법 교실 👨‍🏫
                </h3>
              </div>
            </div>
            {stageTitle && (
              <span className="bg-amber-950/20 px-3 py-1 text-xs font-black rounded-lg">
                {stageTitle}
              </span>
            )}
          </div>

          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Teacher Greeting and Avatar Bubble */}
            <div className="flex items-center gap-4 bg-amber-500/10 p-5 rounded-2xl border-2 border-amber-400/50">
              <div className="w-16 h-16 rounded-full border-4 border-amber-400 overflow-hidden shrink-0 shadow-lg relative animate-bounce">
                <img 
                  src="/src/assets/images/teacher_character_1782021491297.jpg" 
                  referrerPolicy="no-referrer" 
                  alt="원리 멘토 천선생님" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-amber-850">
                  천선생님의 생각 더하기 💡
                </h4>
                <p className="text-sm font-bold text-slate-705 leading-relaxed">
                  “방금 풀어본 사고력 연산은 정성스럽게 한 조각씩 따라가면 수의 원리가 보여요! 대장님, 저와 함께 비법 칠판을 집중해서 한 알 한 알 짚어볼까요?”
                </p>
              </div>
            </div>

            {/* Blackboard Screen with Math Formula Visualizer */}
            <div className="bg-emerald-950 rounded-2xl p-6 border-4 border-emerald-800 shadow-inner relative overflow-hidden font-mono text-white">
              {/* Subtle design accents */}
              <div className="absolute top-2 right-2 text-[10px] text-emerald-400 font-bold tracking-widest uppercase select-none">
                원리 셈 초록 칠판 • blackboard
              </div>
              
              {/* Original Question */}
              <div className="border-b border-emerald-800 pb-4 mb-4">
                <span className="text-xs text-amber-300 font-black block mb-1">
                  [문제 탐구 🧩]
                </span>
                <p className="text-base md:text-lg font-black leading-relaxed text-slate-100 whitespace-pre-line">
                  {question}
                </p>
              </div>

              {/* Correct Answer Display */}
              {correctAnswerText && (
                <div className="flex items-center gap-2 mb-4 bg-emerald-900/60 border border-emerald-600/50 p-3.5 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <span className="text-sm text-slate-205 font-black">
                    반짝이는 핵심 정답: <span className="text-yellow-300 text-lg font-extrabold">{correctAnswerText}</span>
                  </span>
                </div>
              )}

              {/* Step-by-Step Interactive Guide */}
              <div className="space-y-3">
                <span className="text-xs text-amber-300 font-black block mb-0.5 animate-pulse">
                  [천선생님의 1:1 과외 비법 전수 👨‍🏫]
                </span>
                <div className="space-y-3.5 text-sm md:text-base leading-relaxed text-slate-100">
                  {steps.map((step, idx) => {
                    const isStepMarker = step.includes("단계:") || step.includes("Step");
                    return (
                      <div 
                        key={idx}
                        className={`p-3 rounded-2xl transition-all font-black ${
                          isStepMarker 
                            ? "bg-emerald-900/40 border-l-6 border-amber-400 pl-4 text-yellow-100" 
                            : "bg-emerald-950/40 border border-emerald-900"
                        }`}
                      >
                        {step}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Series Reference badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-pink-50 rounded-xl border border-pink-100 flex items-center gap-2">
                <span className="text-lg">📚</span>
                <div>
                  <h5 className="text-[11px] font-black text-pink-700 leading-tight">
                    TOP 사고력 수학 연계
                  </h5>
                  <p className="text-[9px] text-slate-500">
                    직관 교구와 창의융합형 연산 탐구
                  </p>
                </div>
              </div>
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex items-center gap-2">
                <span className="text-lg">💡</span>
                <div>
                  <h5 className="text-[11px] font-black text-sky-700 leading-tight">
                    따라하면 풀리는 초등수학 연계
                  </h5>
                  <p className="text-[9px] text-slate-500">
                    원리 중심 개념 쪼개기 훈련
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-black px-6 py-3.5 rounded-2xl shadow-md transition-all flex items-center gap-1 w-full sm:w-auto justify-center"
            >
              <span>이해했어요! 모험 계속하기 🔥</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
