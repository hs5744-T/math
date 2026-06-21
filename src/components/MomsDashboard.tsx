import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  Home, 
  Settings, 
  Database, 
  FileSpreadsheet, 
  CloudLightning, 
  Download, 
  Clipboard, 
  Check, 
  Sparkles, 
  RefreshCw, 
  Eye, 
  AlertCircle,
  Info
} from "lucide-react";
import { UserProfile } from "../types";

interface MomsDashboardProps {
  profile: UserProfile;
  studentId: string;
  onBackToHome: () => void;
  appsScriptUrl: string;
  onUpdateAppsScriptUrl: (url: string) => void;
  onResetAllProgress?: () => void;
}

export default function MomsDashboard({ profile, studentId, onBackToHome, appsScriptUrl, onUpdateAppsScriptUrl, onResetAllProgress }: MomsDashboardProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>("");
  const [urlInput, setUrlInput] = useState(appsScriptUrl);
  const [copiedCode, setCopiedCode] = useState(false);
  const [syncingTest, setSyncingTest] = useState(false);

  // Load scores for this student
  const fetchScores = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/scores");
      const data = await res.json();
      if (data.success && data.scores) {
        // Filter logs only belonging to this student ID
        const filtered = data.scores.filter((score: any) => score.id === studentId);
        setLogs(filtered);
      }
    } catch (e) {
      console.error("Could not fetch score logs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, [studentId]);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = urlInput.trim();
    onUpdateAppsScriptUrl(cleanUrl);
    setSyncStatus("✅ 구글 비밀 통로 URL이 안전하게 기억되었습니다!");
    setTimeout(() => setSyncStatus(""), 4000);
  };

  // Apps Script Web App standard code template
  const appsScriptCode = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Header check
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["일시", "시간", "아이디", "학생명", "학습구분", "단원/난이도", "맞춘개수", "전체개수", "정확도", "경험치보상", "골드보상"]);
    }
    
    // Append score row
    sheet.appendRow([
      data.date || new Date().toISOString().split('T')[0],
      data.time || "",
      data.id || "",
      data.name || "",
      data.mode || "",
      data.stage || "",
      data.correctCount || 0,
      data.totalCount || 0,
      (data.percentage || 0) + "%",
      data.expGained || 0,
      data.goldGained || 0
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success", "message": "성공적으로 추가되었습니다." }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Run sheet manual sync / connectivity check
  const handleManualSyncTest = async () => {
    if (!appsScriptUrl) {
      alert("먼저 구글 Apps Script 주소를 입력하고 등록해 주세요!");
      return;
    }
    setSyncingTest(true);
    setSyncStatus("");
    try {
      // Post a mock test score to the server with appsScriptUrl
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: studentId,
          name: profile.name,
          mode: "스프레드시트 원격 연결 테스트",
          stage: "연결 확인",
          correctCount: 1,
          totalCount: 1,
          percentage: 100,
          expGained: 10,
          goldGained: 10,
          appsScriptUrl: appsScriptUrl
        })
      });
      const data = await res.json();
      if (data.sheetsStatus && data.sheetsStatus.includes("success")) {
        setSyncStatus("🎉 멋져요! 구글 시트와 무선 통신 테스트 완료 및 기록 추가 성공!");
        fetchScores();
      } else {
        setSyncStatus(`⚠️ 전송은 완료되었으나 시트 스크립트에서 응답 지체됨. 설정과 배포 권한을 "Anyone"으로 하였는지 확인해주세요.`);
      }
    } catch (e: any) {
      setSyncStatus(`❌ 전송 에러 발생: ${e.message}`);
    } finally {
      setSyncingTest(false);
    }
  };

  // Export as standard backup CSV
  const handleDownloadCsv = () => {
    if (logs.length === 0) {
      alert("백업할 학습 이력이 아직 없습니다!");
      return;
    }
    const headers = "날짜,시간,아이디,이름,공부유형,단계설명,맞춘개수,전체개수,정확도,EXP획득,GOLD획득\n";
    const rows = logs.map(l => 
      `"${l.date}","${l.time}","${l.id}","${l.name}","${l.mode}","${l.stage}",${l.correctCount},${l.totalCount},"${l.percentage}%",${l.expGained},${l.goldGained}`
    ).join("\n");

    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `원리셈_수학일지_${profile.name}_백업.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="moms-dashboard-container" className="max-w-4xl mx-auto p-2 md:p-4 space-y-6">
      
      {/* Top action nav */}
      <div id="moms-top-nav" className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-755 text-xs font-black rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>돌아가기</span>
          </button>
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-755 text-xs font-black rounded-lg transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>홈으로</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">자녀 공부 감시 모드:</span>
          <span className="text-indigo-700 font-black bg-indigo-50 px-2.5 py-1 rounded border border-indigo-150 text-xs">{profile.name} (ID: {studentId})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Log database of results */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-rose-500" />
                <span>엄마 주간 연산 분석 기록실</span>
              </h2>
              <button
                onClick={fetchScores}
                className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 text-[10px] font-black text-slate-500 rounded-lg flex items-center gap-1 border border-slate-200 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>새로고침</span>
              </button>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-400 flex flex-col items-center">
                <RefreshCw className="w-8 h-8 text-rose-450 animate-spin mb-3" />
                <span className="text-[11px] font-bold">수학 탐험 점수표를 수합하는 중...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="py-20 text-center bg-slate-50 border-2 border-dashed border-slate-150 rounded-2xl">
                <div className="text-4xl mb-3">📝✨</div>
                <h4 className="text-sm font-bold text-slate-700">공부 기록이 아직 없어요!</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                  자녀가 연산 드릴, 배틀 모험을 플레이하면 이곳에 날짜, 정확도 정보가 채워지며 구글 스프레드시트에 영구 보관됩니다.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-inner max-h-[380px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100">
                      <th className="p-3 pl-4">공부 일시</th>
                      <th className="p-3">수학단 단원</th>
                      <th className="p-3">유형</th>
                      <th className="p-3">정확도 비율</th>
                      <th className="p-3 pr-4 text-center">보상</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 text-slate-700">
                        <td className="p-3 pl-4 whitespace-nowrap">
                          <span className="font-extrabold text-slate-900 block">{log.date}</span>
                          <span className="text-[9.5px] text-slate-400 font-medium block">{log.time}</span>
                        </td>
                        <td className="p-3 font-semibold text-slate-800">
                          {log.stage}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                            log.mode.includes("드릴") 
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-150" 
                              : "bg-rose-50 text-rose-700 border border-rose-150"
                          }`}>
                            {log.mode}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-slate-900">{log.correctCount} / {log.totalCount} 맞춤</span>
                            <span className={`text-[10px] font-black ${log.percentage === 100 ? "text-emerald-600" : "text-slate-400"}`}>
                              ({log.percentage}%)
                            </span>
                          </div>
                        </td>
                        <td className="p-3 pr-4 text-center whitespace-nowrap">
                          <span className="text-indigo-600 font-bold block">+{log.expGained}XP</span>
                          <span className="text-amber-600 font-bold block">+{log.goldGained}G</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Backup Download buttons */}
          {logs.length > 0 && (
            <div className="border-t border-slate-105 pt-4 mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-transform hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>엑셀 / 구글시트용 CSV 파일 백업 다운로드</span>
              </button>
            </div>
          )}

        </div>

        {/* Right Column: Google sheets cloud sync setup settings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
          <div>
            <h3 className="text-xs font-black text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>실시간 구글 시트 연동 설정</span>
            </h3>
            <p className="text-[10px] text-slate-400 leading-normal">
              아이의 연산 훈련 발자취와 오밀조밀 오답 로그를 엄마의 구글 개인 스프레드시트로 무선 원격 포워딩해 실시간 리포트를 검증해 줍니다!
            </p>
          </div>

          <form onSubmit={handleSaveUrl} className="space-y-3">
            <div>
              <label className="block text-[9.5px] font-black text-slate-500 uppercase pl-0.5 mb-1">
                🔗 구글 Web App 번호/주소 (Apps Script URL)
              </label>
              <input
                type="url"
                required
                placeholder="https://script.google.com/macros/s/.../exec"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700 font-semibold"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>비밀 통로 등록하기</span>
            </button>
          </form>

          {/* Manually Connection Test */}
          {appsScriptUrl && (
            <button
              onClick={handleManualSyncTest}
              type="button"
              disabled={syncingTest}
              className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-black text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              {syncingTest ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CloudLightning className="w-3.5 h-3.5" />
              )}
              <span>구글 시트에 수동 업로드 / 연동하기</span>
            </button>
          )}

          {syncStatus && (
            <div className="bg-slate-50 border border-emerald-150 p-2.5 rounded-lg text-emerald-800 text-[10px] font-bold leading-normal">
              {syncStatus}
            </div>
          )}

          {/* Simple step-by-step cartoon guide with collapsible trigger */}
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl">
            <h4 className="text-[10.5px] font-black text-slate-700 mb-2 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-rose-500" />
              <span>쉽고 빠른 3분 구글 연동 비법</span>
            </h4>
            
            <ol className="text-[9.5px] text-slate-500 space-y-2 leading-relaxed">
              <li>
                1. 구글 스프레드시트를 만들고 <strong>확장 프로그램(Extensions) &gt; Apps Script</strong>를 엽니다.
              </li>
              <li>
                2. 기존 코드를 전부 수거하고, 아래의 <strong>마법 소스스크립트</strong> 복사 버튼을 눌러 그 자리에 붙여넣습니다.
              </li>
              <li>
                3. 오른쪽 위 <strong>배포(Deploy) &gt; 새 배포</strong>를 누르고, 엑세스 권한을 반드시 <strong>"Anyone(모든 사람)"</strong>으로 설정해 주신 뒤 배포를 완료합니다.
              </li>
              <li>
                4. 완성된 웹 주소를 복사해 위의 상자 입력란에 붙여넣고 <strong>비밀 통로 등록</strong>을 완료하시면 됩니다!
              </li>
            </ol>

            <button
              onClick={handleCopyCode}
              type="button"
              className="w-full bg-white hover:bg-slate-100 border border-slate-205 text-slate-600 font-bold text-[9.5px] py-2 rounded-lg mt-3 transition-colors flex items-center justify-center gap-1 shrink-0 cursor-pointer"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Clipboard className="w-3 h-3" />}
              <span>{copiedCode ? "복사 성공!" : "Apps Script 마법 소스 복사하기"}</span>
            </button>
          </div>

          {/* Danger zone to reset all progress */}
          {onResetAllProgress && (
            <div className="bg-rose-50/50 border border-rose-200 p-4 rounded-2xl">
              <h4 className="text-[10.5px] font-black text-rose-700 mb-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span>엄마 관리 전용 학습 초기화</span>
              </h4>
              <p className="text-[9.5px] text-slate-500 leading-normal mb-3">
                자녀의 현재 나이대 단계, 캐릭터 레벨/진화, 보유 장비와 골드가 모두 사그라들며 초기 캐릭터 선택 화면으로 포맷됩니다.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm("정말로 아이의 공부 레벨과 탐험 현황을 처음으로 초기화할까요?")) {
                    onResetAllProgress();
                    alert("모든 단원이 성공적으로 초기화되었습니다! 지도 첫 화면으로 이동합니다.");
                    onBackToHome();
                  }
                }}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                모든 단계 및 레벨 완전히 초기화하기
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
