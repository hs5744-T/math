import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent Local Database Files
const PROFILES_FILE = path.join(process.cwd(), "profiles_storage.json");
const SCORES_FILE = path.join(process.cwd(), "scores_storage.json");

// Helper: Read and Write database logs
function readProfiles() {
  if (!fs.existsSync(PROFILES_FILE)) {
    fs.writeFileSync(PROFILES_FILE, JSON.stringify({}));
  }
  try {
    const data = fs.readFileSync(PROFILES_FILE, "utf-8");
    return JSON.parse(data || "{}");
  } catch (err) {
    return {};
  }
}

function writeProfiles(data: any) {
  fs.writeFileSync(PROFILES_FILE, JSON.stringify(data, null, 2));
}

function readScores() {
  if (!fs.existsSync(SCORES_FILE)) {
    fs.writeFileSync(SCORES_FILE, JSON.stringify([]));
  }
  try {
    const data = fs.readFileSync(SCORES_FILE, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    return [];
  }
}

function writeScores(data: any) {
  fs.writeFileSync(SCORES_FILE, JSON.stringify(data, null, 2));
}

// --- PROFLES ENDPOINTS ---
app.get("/api/profiles/:id", (req, res) => {
  const profileId = req.params.id.trim();
  const db = readProfiles();
  if (db[profileId]) {
    return res.json({ success: true, profile: db[profileId] });
  }
  return res.json({ success: false, message: "프로필을 찾을 수 없습니다." });
});

app.post("/api/profiles", (req, res) => {
  const { id, profile } = req.body;
  if (!id || !profile) {
    return res.status(400).json({ success: false, message: "ID와 프로필 정보가 유효하지 않습니다." });
  }
  const db = readProfiles();
  db[id.trim()] = profile;
  writeProfiles(db);
  return res.json({ success: true, message: "프로필이 안전하게 저장되었습니다!" });
});

// --- SCORES RECORD ENDPOINTS ---
app.get("/api/scores", (req, res) => {
  const scores = readScores();
  return res.json({ success: true, count: scores.length, scores });
});

app.post("/api/scores", async (req, res) => {
  const scoreEntry = req.body; // { id, name, date, time, mode, stage, correctCount, totalCount, percentage, expGained, goldGained }
  if (!scoreEntry.id) {
    return res.status(400).json({ success: false, message: "기록할 학생 ID가 필수적입니다." });
  }
  
  const scores = readScores();
  const entry = {
    id: scoreEntry.id,
    name: scoreEntry.name || "용맹한 용사",
    date: scoreEntry.date || new Date().toISOString().split("T")[0],
    time: scoreEntry.time || new Date().toTimeString().split(" ")[0].slice(0, 5),
    mode: scoreEntry.mode || "연산 드릴스",
    stage: scoreEntry.stage || "새로운 던전",
    correctCount: scoreEntry.correctCount,
    totalCount: scoreEntry.totalCount,
    percentage: scoreEntry.percentage,
    expGained: scoreEntry.expGained || 0,
    goldGained: scoreEntry.goldGained || 0,
    timestamp: Date.now()
  };
  
  scores.unshift(entry); // Save with newest entry first
  writeScores(scores);

  // Optional Mother's App Script sheets forwarder
  let sheetsStatus = "not_configured";
  if (scoreEntry.appsScriptUrl) {
    try {
      const url = scoreEntry.appsScriptUrl;
      const payload = {
        action: "appendScore",
        ...entry
      };
      
      // Perform server-side fetch to maternal Google Sheet endpoint
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const resText = await response.text();
      sheetsStatus = `success: ${resText}`;
    } catch (e: any) {
      console.error("⚠️ Failed forwarding to Google Apps Script:", e);
      sheetsStatus = `failed: ${e.message}`;
    }
  }

  return res.json({ success: true, entry, sheetsStatus });
});

// Initialize Gemini client on the server side
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("🔔 WARNING: GEMINI_API_KEY is not defined in environment variables.");
  }
} catch (error) {
  console.error("❌ Failed to initialize GoogleGenAI client:", error);
}

// API endpoint to generate "Thinking Math" (사고력 문제)
app.post("/api/gemini/quiz", async (req, res) => {
  const { grade, difficulty, theme } = req.body;

  if (!ai) {
    // Return mock fallback question if API key is not configured so the app is always functional
    return res.json({
      success: true,
      apiKeyConfigured: false,
      data: {
        question: `[원리 왕국 모험] 아기 드래곤 불리가 맛있는 빨간 사과를 수확하고 있어요! 불리는 처음에 사과를 8개 가지고 있었는데, 숲속 친구 요정이 사과 5개를 더 선물해 주었습니다. 불리가 가진 사과는 모두 몇 개가 될까요? (10 만들기 규칙을 생각해봐요!)`,
        choices: ["11개", "12개", "13개", "14개"],
        correctIndex: 2,
        visualInstruction: "8개 자리에 사과 8개 배치, 옆에 5개 배치. 8개에서 2개를 가져와 10개 한 묶음을 만들고 남은 3개가 낱개로 있음.",
        explanation: "8에 2를 더하면 10이 돼요! 선물받은 5개 중 2개를 먼저 가져와 10알 상자를 완성하면, 낱개 사과가 3개 남아서 총 13개가 됩니다! (8 + 5 = 8 + 2 + 3 = 10 + 3 = 13)"
      }
    });
  }

  try {
    const systemPrompt = `당신은 대한민국 대표 초등학교 수학 원리 전문가(천종현수학연구소의 '원리셈' 교육 철학을 충실히 반영함)이자 즐거운 RPG 게임 작가입니다. 
7세(유치원)부터 10세(초등 3학년) 어린이들이 게임의 미션을 클리어하는 모험가가 되었다고 느끼도록 친근한 한국어 경어체(~해요, ~답니다, ~일까요?)로 창의적인 모험 스토리텔링 형태의 "수학 사고력 문제"를 생성해 주세요.

수학 원리 철학:
- 7세: 10 이하 가르기와 모으기, 한 자리 수 덧셈/뺄셈 (직관물, 블록 등으로 설명)
- 8세(초1): 20 이하의 덧셈/뺄셈, 10의 보수 개념을 통한 받아올림 준비 (10칸 프레임 주판 설명)
- 9세(초2): 두 자리 수의 받아올림과 받아내림, 구구단의 동수누가(같은 수 여러 번 더하기)와 묶음 원리 (십모형/일모형, 바둑돌 설명)
- 10세(초3): 세 자리 수 연산, 두 자리 수 곱셈, 나눗셈 분배/등분 가르기와 분수 기본 개념 (넓이 모형, 분할판 설명)`;

    const userPrompt = `다음 세부 조건에 완전히 적합한 문제를 1개 생성해 주세요.
- 대상 연령/학년: ${grade}
- 게임 전투 난이도: ${difficulty} (쉬움: 직관적, 보통: 기본 추론, 어려움: 복합 사고력 필요)
- 연산 학습 단원/개념 주제: ${theme}

출력 스키마 제약:
1. question: 어린이 용사가 마법 몬스터를 무찌르거나 상자를 여는 동화 스토리와 연관지어 자연스러운 연산 사고력을 유도할 것. 구체적이고 귀여운 소재(드래곤 불리, 아쿠벳, 숲속 과일, 슬라임)를 사용하세요.
2. choices: 보기 4개는 각각 정답 및 학생들이 겪을 수 있는 유효한 오답(받아올림 실수 등)을 정확히 산정해 배치할 것.
3. correctIndex: 정답의 인덱스 (0, 1, 2, 3 중 하나)
4. visualInstruction: 7~10세 어린이들이 머릿속으로 시각적 구조(바둑돌, 수연산 상자, 묶음 모형, 수직선 등)를 그리며 원리를 이해할 수 있게 해설에 들어갈 그림에 대한 정밀한 한국어 묘사를 제공해주세요.
5. explanation: 수식을 기계적으로 나열하지 말고, 자르고 쪼개고 붙이는 원리셈 특유의 쉬운 풀이 가이드를 구체물 묘사와 함께 작성할 것.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["question", "choices", "correctIndex", "visualInstruction", "explanation"],
          properties: {
            question: { type: Type.STRING, description: "모험 스토리와 연산 문제가 부드럽게 연계된 발문" },
            choices: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "4개의 객관식 항목"
            },
            correctIndex: { type: Type.INTEGER, description: "정답의 index (0 ~ 3)" },
            visualInstruction: { type: Type.STRING, description: "해당 문제를 쉽게 푸는 시각적 원리 도구(상자, 블록 묶음, 수직선 등) 구성 방식 묘사" },
            explanation: { type: Type.STRING, description: "원리 중심의 아주 친절하고 자상한 초등 눈높이 해설" },
          }
        }
      }
    });

    const dataText = response.text;
    if (!dataText) {
      throw new Error("Empty response from GenAI");
    }

    const quizData = JSON.parse(dataText.trim());
    return res.json({
      success: true,
      apiKeyConfigured: true,
      data: quizData
    });

  } catch (error: any) {
    console.error("❌ Gemini API request error:", error);
    // Graceful fallback to prevent screen freeze
    return res.json({
      success: true,
      apiKeyConfigured: false,
      error: error.message,
      data: {
        question: `[원리 탐험 던전] 물벼락 아쿠펏이 친구들과 달콤한 딸기를 나눠먹으려고 해요. 딸개 15개가 있었는데 아쿠펏이 6개를 먼저 맛있게 먹었어요. 친구들을 위해 남겨둔 딸기는 몇 개일까요?`,
        choices: ["8개", "9개", "10개", "11개"],
        correctIndex: 1,
        visualInstruction: "딸기 15개가 10개들이 꽉 찬 상자 1개와 낱개 5개로 서 있음. 상자에서 6개를 먹으려면 낱개 5개를 먹고 상자에서 1개를 더 가져가므로 상자에 9개가 남음.",
        explanation: "15에서 6을 뺄 때는 낱개 5개를 먼저 빼고(15 - 5 = 10), 남은 10개 상자에서 1개를 더 빼주면 쉬워요! (10 - 1 = 9) 그래서 답은 9개가 됩니다!"
      }
    });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Wonrisem Math RPG Server running on port ${PORT}`);
  });
}

startServer();
