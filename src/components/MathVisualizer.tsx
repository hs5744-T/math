/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  ChevronRight, 
  HelpCircle, 
  Apple, 
  Grid3X3,
  CircleDot
} from "lucide-react";

interface MathVisualizerProps {
  instruction: string;
}

export default function MathVisualizer({ instruction }: MathVisualizerProps) {
  if (!instruction) return null;

  const parts = instruction.split(":");
  const type = parts[0];

  switch (type) {
    case "BOND_SPLIT": {
      // BOND_SPLIT:parent:child1:child2:label
      const parent = parseInt(parts[1]) || 0;
      const child1 = parseInt(parts[2]) || 0;
      const child2 = parseInt(parts[3]) || 0;
      const label = parts[4] || "수 가르기";

      return (
        <div id="visualizer-bond-split" className="p-4 bg-white rounded-2xl shadow-sm border border-pink-100 flex flex-col items-center">
          <h4 className="text-xs font-bold text-pink-600 mb-4 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> {label} 원리수식 (가르기)
          </h4>
          <div className="relative w-64 h-48 flex items-center justify-center">
            {/* SVG Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              <line x1="128" y1="40" x2="64" y2="140" stroke="#fbcfe8" strokeWidth="4" strokeDasharray="4" />
              <line x1="128" y1="40" x2="192" y2="140" stroke="#fbcfe8" strokeWidth="4" strokeDasharray="4" />
            </svg>

            {/* Parent Bubble */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="absolute top-2 w-16 h-16 rounded-full bg-pink-500 text-white font-black text-xl flex flex-col items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform"
              style={{ left: "calc(50% - 32px)", zIndex: 1 }}
            >
              <span>{parent}</span>
              <div className="flex flex-wrap gap-0.5 justify-center max-w-[40px] mt-0.5">
                {Array.from({ length: Math.min(parent, 10) }).map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-white rounded-full opacity-80" />
                ))}
              </div>
            </motion.div>

            {/* Child 1 Bubble */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="absolute bottom-4 left-6 w-14 h-14 rounded-full bg-rose-400 text-white font-extrabold text-base flex flex-col items-center justify-center shadow-md border-2 border-white"
              style={{ zIndex: 1 }}
            >
              <span>{child1}</span>
              <div className="flex flex-wrap gap-0.5 justify-center max-w-[32px] mt-0.5">
                {Array.from({ length: Math.min(child1, 8) }).map((_, i) => (
                  <div key={i} className="w-0.5 h-0.5 bg-white rounded-full" />
                ))}
              </div>
            </motion.div>

            {/* Child 2 Bubble (Missing target) */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="absolute bottom-4 right-6 w-14 h-14 rounded-full bg-amber-400 text-white font-extrabold text-base flex flex-col items-center justify-center shadow-md border-2 border-dashed border-amber-300 animate-pulse"
              style={{ zIndex: 1 }}
            >
              <span className="text-black font-black">?</span>
              <span className="text-[10px] text-amber-900 mt-0.2">({child2})</span>
            </motion.div>
          </div>
          <p className="text-xs text-slate-500 text-center mt-2 max-w-[240px]">
            {parent}를 {child1}와 오른쪽 상자의 <strong className="text-pink-600 font-bold">정답 수</strong>로 가를 수 있어요!
          </p>
        </div>
      );
    }

    case "BOND_GATHER": {
      // BOND_GATHER:num1:num2:result:label
      const num1 = parseInt(parts[1]) || 0;
      const num2 = parseInt(parts[2]) || 0;
      const result = parseInt(parts[3]) || 0;
      const label = parts[4] || "수 모으기";

      return (
        <div id="visualizer-bond-gather" className="p-4 bg-white rounded-2xl shadow-sm border border-emerald-100 flex flex-col items-center">
          <h4 className="text-xs font-bold text-emerald-600 mb-4 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> {label} 원리수식 (모으기)
          </h4>
          <div className="relative w-64 h-48 flex items-center justify-center">
            {/* SVG Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line x1="64" y1="40" x2="128" y2="140" stroke="#a7f3d0" strokeWidth="4" strokeDasharray="4" />
              <line x1="192" y1="40" x2="128" y2="140" stroke="#a7f3d0" strokeWidth="4" strokeDasharray="4" />
            </svg>

            {/* Input 1 */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute top-2 left-6 w-14 h-14 rounded-full bg-teal-400 text-white font-bold text-lg flex flex-col items-center justify-center shadow-sm"
            >
              <span>{num1}</span>
            </motion.div>

            {/* Input 2 */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute top-2 right-6 w-14 h-14 rounded-full bg-cyan-400 text-white font-bold text-lg flex flex-col items-center justify-center shadow-sm"
            >
              <span>{num2}</span>
            </motion.div>

            {/* Result (Gathered) */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-2 w-18 h-18 rounded-full bg-emerald-500 text-white font-black text-2xl flex flex-col items-center justify-center shadow-lg border-4 border-emerald-200"
              style={{ left: "calc(50% - 36px)" }}
            >
              <span>{result}</span>
              <div className="flex flex-wrap gap-0.5 justify-center max-w-[48px] mt-0.5">
                {Array.from({ length: Math.min(result, 12) }).map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-white rounded-full" />
                ))}
              </div>
            </motion.div>
          </div>
          <p className="text-xs text-slate-500 text-center mt-2">
            왼쪽의 {num1}와 오른쪽의 {num2}를 한 곳에 모으면 총 <strong className="text-emerald-600 font-bold">{result}</strong>이(가) 완성됩니다.
          </p>
        </div>
      );
    }

    case "COUNTER_ADD": {
      // COUNTER_ADD:num1:num2:sum:label
      const num1 = parseInt(parts[1]) || 0;
      const num2 = parseInt(parts[2]) || 0;
      const sum = parseInt(parts[3]) || 0;
      const label = parts[4] || "더하기";

      return (
        <div id="visualizer-counter-add" className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <h4 className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-1">
            <Apple className="w-3.5 h-3.5 text-red-500" /> {label} 직관 카운팅
          </h4>
          <div className="flex flex-col gap-2 items-center">
            {/* Visual block count */}
            <div className="flex items-center gap-4 py-2 px-4 bg-slate-50 rounded-xl">
              <div className="flex flex-wrap gap-1 max-w-[120px] justify-center border-r border-slate-200 pr-3">
                {Array.from({ length: num1 }).map((_, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.2 }}
                    className="w-5 h-5 bg-rose-500 rounded-md border border-rose-600 shadow-sm flex items-center justify-center text-[9px] text-white font-extrabold"
                  >
                    {i + 1}
                  </motion.div>
                ))}
              </div>
              <span className="font-black text-slate-600 text-lg">+</span>
              <div className="flex flex-wrap gap-1 max-w-[120px] justify-center pl-1">
                {Array.from({ length: num2 }).map((_, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.2 }}
                    className="w-5 h-5 bg-blue-500 rounded-md border border-blue-600 shadow-sm flex items-center justify-center text-[9px] text-white font-extrabold"
                  >
                    +{i + 1}
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="text-center mt-1">
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                {num1}에서 시작해서 한 칸씩 {num2}개 더 세어가요!
              </span>
            </div>
          </div>
        </div>
      );
    }

    case "COUNTER_SUB": {
      // COUNTER_SUB:sum:sub:res:label
      const sum = parseInt(parts[1]) || 0;
      const sub = parseInt(parts[2]) || 0;
      const res = parseInt(parts[3]) || 0;
      const label = parts[4] || "빼기";

      return (
        <div id="visualizer-counter-sub" className="p-4 bg-white rounded-2xl shadow-sm border border-rose-100 flex flex-col items-center">
          <h4 className="text-xs font-bold text-rose-600 mb-3 flex items-center gap-1">
            <Apple className="w-3.5 h-3.5 text-rose-500" /> {label} 덜어내기 개별셈
          </h4>
          <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-wrap gap-1 justify-center max-w-[280px] py-3 px-4 bg-rose-50/50 rounded-xl">
              {Array.from({ length: sum }).map((_, i) => {
                const isRemoved = i >= sum - sub;
                return (
                  <motion.div 
                    key={i}
                    animate={isRemoved ? { opacity: 0.35, scale: 0.9 } : {}}
                    className={`relative w-6 h-6 rounded-md shadow-sm border flex items-center justify-center text-[10px] font-black ${
                      isRemoved 
                        ? "bg-slate-200 border-slate-300 text-slate-500" 
                        : "bg-amber-400 border-amber-500 text-amber-950"
                    }`}
                  >
                    {i + 1}
                    {isRemoved && (
                      <div className="absolute inset-0 flex items-center justify-center text-red-600 font-extrabold text-xs">
                        ✕
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <span className="text-xs text-rose-800 font-semibold">
              전체 {sum}개 중에서 {sub}개를 <strong className="text-red-500">✕ 표시</strong>로 밀어내면 {res}개가 남아요!
            </span>
          </div>
        </div>
      );
    }

    case "FRAME10_COMP": {
      // FRAME10_COMP:num1:complement
      const num1 = parseInt(parts[1]) || 0;
      const complement = parseInt(parts[2]) || 0;

      return (
        <div id="visualizer-frame10-comp" className="p-4 bg-white rounded-2xl shadow-sm border border-amber-100 flex flex-col items-center">
          <h4 className="text-xs font-bold text-amber-600 mb-3 flex items-center gap-1">
            <Grid3X3 className="w-4 h-4 text-amber-500" /> 원리셈 10칸 달걀판 채우기
          </h4>
          <div className="grid grid-cols-5 gap-1.5 p-2 bg-slate-100 rounded-xl border border-slate-300 shadow-inner">
            {Array.from({ length: 10 }).map((_, i) => {
              const filled = i < num1;
              return (
                <div 
                  key={i} 
                  className="w-10 h-10 bg-white border border-slate-300 rounded-lg flex items-center justify-center relative shadow-sm"
                >
                  {filled ? (
                    <motion.div 
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="w-7 y-7 w-7 h-7 rounded-full bg-rose-500 border border-rose-600 shadow-md flex items-center justify-center"
                    >
                      <span className="text-[10px] text-white font-bold">{i+1}</span>
                    </motion.div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-amber-100 border-2 border-dashed border-amber-300 flex items-center justify-center animate-pulse">
                      <span className="text-[9px] text-amber-500 font-bold">?</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <span className="text-xs text-slate-500 mt-2 text-center">
            빨간알 <strong className="text-rose-500">{num1}개</strong> + 빈칸 <strong className="text-amber-500">{complement}개</strong> = 총 <strong className="text-slate-800">10칸</strong>
          </span>
        </div>
      );
    }

    case "FRAME10_REGROUP_ADD": {
      // FRAME10_REGROUP_ADD:num1:num2:sum:need:remains:label
      const num1 = parseInt(parts[1]) || 0;
      const num2 = parseInt(parts[2]) || 0;
      const sum = parseInt(parts[3]) || 0;
      const need = parseInt(parts[4]) || 0;
      const remains = parseInt(parts[5]) || 0;

      return (
        <div id="visualizer-regroup-add" className="p-4 bg-white rounded-2xl shadow-sm border border-orange-100 flex flex-col items-center">
          <h4 className="text-xs font-bold text-orange-600 mb-3 flex items-center gap-1">
            <Grid3X3 className="w-4 h-4 text-orange-500" /> 10의 묶음 만들기 원리 (받아올림)
          </h4>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Box 1: Full or filling to 10 */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-500 mb-1">묶음 상자 (10)</span>
              <div className="grid grid-cols-5 gap-1 p-1 px-1.5 bg-rose-50 border border-rose-200 rounded-lg shadow-inner">
                {Array.from({ length: 10 }).map((_, i) => {
                  const isRed = i < num1;
                  const isBorrowed = i >= num1 && i < num1 + need;
                  return (
                    <div key={i} className="w-6 h-6 bg-white border border-slate-200 rounded flex items-center justify-center text-[8px]">
                      {isRed && (
                        <div className="w-4 h-4 rounded-full bg-rose-500" />
                      )}
                      {isBorrowed && (
                        <motion.div 
                          animate={{ scale: [0.8, 1.1, 1] }} 
                          transition={{ repeat: Infinity, duration: 2 }} 
                          className="w-4 h-4 rounded-full bg-blue-500 border border-dashed border-blue-200" 
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-400 rotate-90 md:rotate-0" />

            {/* Remaining items */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-500 mb-1">남은 낱개 ({remains})</span>
              <div className="flex flex-wrap gap-1 p-2 bg-blue-50 border border-blue-200 rounded-lg min-w-[70px] min-h-[40px] items-center justify-center">
                {Array.from({ length: remains }).map((_, i) => (
                  <div key={i} className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[7px] text-white">
                    ★
                  </div>
                ))}
                {remains === 0 && <span className="text-[9px] text-slate-400">없음</span>}
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-3 text-center bg-orange-50 px-3 py-1.5 rounded-lg max-w-[320px]">
            {num1}에 보수 <strong className="text-rose-600 font-bold">{need}</strong>만큼을 더 빌려와서 <strong className="text-orange-600 font-bold">10개 카드 상자 1개</strong>를 완성하고, 파란 알 <strong className="text-blue-600 font-bold">{remains}개</strong>가 낱개로 남아서 총합 <strong className="text-slate-900 font-bold">{sum}</strong>이 돼요!
          </p>
        </div>
      );
    }

    case "BASE10_ADD": {
      // BASE10_ADD:num1:num2:result
      const num1 = parseInt(parts[1]) || 0;
      const num2 = parseInt(parts[2]) || 0;
      const result = parseInt(parts[3]) || 0;

      const num1Tens = Math.floor(num1 / 10);
      const num1Ones = num1 % 10;
      const num2Tens = Math.floor(num2 / 10);
      const num2Ones = num2 % 10;

      return (
        <div id="visualizer-base10-add" className="p-4 bg-white rounded-2xl shadow-sm border border-teal-100 flex flex-col items-center">
          <h4 className="text-xs font-bold text-teal-600 mb-3 flex items-center gap-1">
            <CircleDot className="w-4 h-4 text-teal-500" /> 세로셈 수 모형 블록 원리
          </h4>
          <div className="w-full flex justify-around gap-2 my-2">
            {/* Num 1 Blocks */}
            <div className="flex flex-col items-center bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
              <span className="text-[10px] font-bold text-slate-600 mb-1">{num1}</span>
              <div className="flex gap-2">
                {/* Tens (Rods) */}
                <div className="flex flex-col gap-0.5" title={`${num1Tens}0`}>
                  {num1Tens > 0 ? Array.from({ length: num1Tens }).map((_, i) => (
                    <div key={i} className="w-3 h-10 bg-emerald-500 border border-emerald-600 rounded flex flex-col justify-between p-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div key={j} className="h-1 bg-white/20 rounded-sm" />
                      ))}
                    </div>
                  )) : <div className="text-[8px] text-slate-400">-</div>}
                </div>
                {/* Ones */}
                <div className="grid grid-cols-2 gap-0.5" title={`${num1Ones}`}>
                  {num1Ones > 0 ? Array.from({ length: num1Ones }).map((_, i) => (
                    <div key={i} className="w-2_5 h-2.5 w-3 h-3 bg-teal-400 border border-teal-500 rounded" />
                  )) : <div className="text-[8px] text-slate-400">-</div>}
                </div>
              </div>
            </div>

            <div className="flex items-center text-slate-400 font-bold">+</div>

            {/* Num 2 Blocks */}
            <div className="flex flex-col items-center bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
              <span className="text-[10px] font-bold text-slate-600 mb-1">{num2}</span>
              <div className="flex gap-2">
                {/* Tens (Rods) */}
                <div className="flex flex-col gap-0.5">
                  {num2Tens > 0 ? Array.from({ length: num2Tens }).map((_, i) => (
                    <div key={i} className="w-1.5 h-10 bg-emerald-500 border border-emerald-600 rounded flex flex-col justify-between p-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div key={j} className="h-1 bg-white/20 rounded-sm" />
                      ))}
                    </div>
                  )) : <div className="text-[8px] text-slate-400">-</div>}
                </div>
                {/* Ones */}
                <div className="grid grid-cols-2 gap-0.5">
                  {num2Ones > 0 ? Array.from({ length: num2Ones }).map((_, i) => (
                    <div key={i} className="w-3 h-3 bg-teal-400 border border-teal-500 rounded" />
                  )) : <div className="text-[8px] text-slate-400">-</div>}
                </div>
              </div>
            </div>

            <div className="flex items-center text-slate-400 font-bold">=</div>

            {/* Sum Block representation */}
            <div className="flex flex-col items-center bg-teal-50 p-2 rounded-xl text-center border border-teal-200">
              <span className="text-[10px] font-bold text-teal-800 mb-1">{result}</span>
              <div className="flex gap-2">
                {/* Tens */}
                <div className="flex flex-col gap-0.5">
                  {Array.from({ length: Math.floor(result / 10) }).map((_, i) => (
                    <div key={i} className="w-3 h-10 bg-emerald-500 border border-emerald-600 rounded-sm" />
                  ))}
                </div>
                {/* Ones */}
                <div className="grid grid-cols-2 gap-0.5">
                  {Array.from({ length: result % 10 }).map((_, i) => (
                    <div key={i} className="w-3 h-3 bg-teal-400 border border-teal-500 rounded-sm" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 text-center mt-1">
            십 모형 막대기(길쭉한 블록)는 10개, 일 모형 큐브는 1개 단위를 표현해요!
          </span>
        </div>
      );
    }

    case "GRID_MULT": {
      // GRID_MULT:mult1:mult2:product
      const m1 = parseInt(parts[1]) || 0;
      const m2 = parseInt(parts[2]) || 0;
      const product = parseInt(parts[3]) || 0;

      return (
        <div id="visualizer-grid-mult" className="p-4 bg-white rounded-2xl shadow-sm border border-emerald-100 flex flex-col items-center">
          <h4 className="text-xs font-bold text-emerald-600 mb-3 flex items-center gap-1">
            <Grid3X3 className="w-4 h-4 text-emerald-500" /> 곱셈구구 동수누가 묶어세기 바둑판
          </h4>
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-wrap gap-2 justify-center max-w-[280px]">
              {Array.from({ length: m2 }).map((_, bIdx) => (
                <div 
                  key={bIdx} 
                  className="flex flex-col gap-0.5 p-1 bg-emerald-50 border border-emerald-200 rounded shadow-sm hover:scale-105 transition-transform"
                >
                  <span className="text-[8px] font-black text-emerald-800 text-center">{bIdx + 1}번째 묶음</span>
                  <div className="flex gap-0.5 justify-center">
                    {Array.from({ length: m1 }).map((_, iIdx) => (
                      <div key={iIdx} className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-600 flex items-center justify-center text-[5px] text-white">
                        {/* Numeric progression index helper */}
                        {bIdx * m1 + iIdx + 1}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600 text-center bg-slate-50 px-2.5 py-1 rounded-md">
              <strong className="text-emerald-600">{m1}개씩</strong> 총 <strong className="text-emerald-600">{m2}번</strong> 뛰어 세면 <strong className="text-slate-900">{product}</strong>가 완성되는 원리예요!
            </p>
          </div>
        </div>
      );
    }

    case "SHARE_PLATE": {
      // SHARE_PLATE:dividend:divisor:quotient
      const dividend = parseInt(parts[1]) || 0;
      const divisor = parseInt(parts[2]) || 0;
      const quotient = parseInt(parts[3]) || 0;

      return (
        <div id="visualizer-share-plate" className="p-4 bg-white rounded-2xl shadow-sm border border-sky-100 flex flex-col items-center">
          <h4 className="text-xs font-bold text-sky-600 mb-3 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-500" /> 똑같이 나누기 (나눗셈 기초)
          </h4>
          <div className="flex flex-wrap gap-4 items-center justify-center py-2 px-3 bg-sky-50/50 rounded-2xl max-w-[340px]">
            {Array.from({ length: divisor }).map((_, dIdx) => (
              <div 
                key={dIdx} 
                className="w-16 h-16 rounded-full bg-white border border-sky-300 shadow-sm flex flex-col items-center justify-center p-1 relative"
              >
                <div className="absolute top-1 text-[7px] text-sky-400 font-bold">접시 {dIdx + 1}</div>
                {/* Little apples/berries inside */}
                <div className="flex flex-wrap gap-0.5 justify-center mt-2 max-w-[40px]">
                  {Array.from({ length: quotient }).map((_, iIdx) => (
                    <motion.div 
                      key={iIdx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: iIdx * 0.05 }}
                      className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-600 flex items-center justify-center relative"
                    >
                      <span className="absolute -top-1 right-0 w-1 h-1 bg-green-500 rounded-full" />
                    </motion.div>
                  ))}
                </div>
                <div className="text-[9px] font-black text-sky-900 mt-1">{quotient}개</div>
              </div>
            ))}
          </div>
          <span className="text-[10px] text-slate-500 text-center mt-2">
            전체 개수 <strong className="text-rose-500 font-bold">{dividend}개</strong>를 똑같이 <strong className="text-sky-600 font-bold">{divisor}개 접시</strong>로 나눈 결과는 <strong className="text-slate-900 font-bold">{quotient}개씩</strong>입니다.
          </span>
        </div>
      );
    }

    case "FRACTION_CIRCLE": {
      // FRACTION_CIRCLE:numerator:denominator
      const num = parseInt(parts[1]) || 0;
      const denom = parseInt(parts[2]) || 0;

      const angle = (num / denom) * 360;

      return (
        <div id="visualizer-fraction-circle" className="p-4 bg-white rounded-2xl shadow-sm border border-purple-100 flex flex-col items-center">
          <h4 className="text-xs font-bold text-purple-600 mb-3 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" /> 전체 중 조각 원리 (분수)
          </h4>
          <div className="flex items-center gap-6 my-2 bg-slate-50 p-3 rounded-2xl">
            {/* Pie Circle Visualizer */}
            <div className="relative w-20 h-20 rounded-full bg-slate-200 shadow-inner flex items-center justify-center overflow-hidden border border-slate-300">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                {Array.from({ length: denom }).map((_, idx) => {
                  const sliceAngle = 360 / denom;
                  const startAngle = idx * sliceAngle;
                  const endAngle = (idx + 1) * sliceAngle;
                  
                  // Convert polar to cartesian
                  const radStart = (startAngle - 90) * (Math.PI / 180);
                  const radEnd = (endAngle - 90) * (Math.PI / 180);
                  
                  const r = 40;
                  const x1 = 40 + r * Math.cos(radStart);
                  const y1 = 40 + r * Math.sin(radStart);
                  const x2 = 40 + r * Math.cos(radEnd);
                  const y2 = 40 + r * Math.sin(radEnd);
                  
                  const isLarge = sliceAngle > 180 ? 1 : 0;
                  const pathData = `M40,40 L${x1},${y1} A${r},${r} 0 ${isLarge},1 ${x2},${y2} Z`;
                  
                  const isSelected = idx < num;
                  
                  return (
                    <path 
                      key={idx} 
                      d={pathData} 
                      fill={isSelected ? "#ec4899" : "#ffffff"} 
                      stroke="#cbd5e1" 
                      strokeWidth="1.5"
                      className="transition-colors duration-300"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Fraction Fraction Math UI Label */}
            <div className="flex flex-col items-center justify-center border-l border-slate-250 pl-4">
              <div className="text-xs text-slate-500 font-bold mb-0.5">분수 기호</div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-black text-rose-500" title="분자 (조각 수)">{num}</span>
                <div className="w-8 h-0.5 bg-slate-400 my-0.5" />
                <span className="text-sm font-black text-slate-800" title="분모 (전체 조각)">{denom}</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 text-center px-2">
            둥근 판을 똑같이 <strong className="text-slate-800 font-bold">{denom}등분</strong>한 것 중 빨갛게 칠한 <strong className="text-pink-600 font-bold">{num}조각</strong>의 양이랍니다!
          </span>
        </div>
      );
    }

    default:
      return (
        <div id="visualizer-fallback" className="p-3 bg-slate-50 text-slate-600 border border-slate-200 text-xs rounded-xl flex items-center justify-center gap-2">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>시각적 수 연산 가이드 준비 중 ({type})</span>
        </div>
      );
  }
}
