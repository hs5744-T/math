/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgeGroup, QuizQuestion } from "./types";

const SPECIAL_QUESTIONS: { [key in AgeGroup]: QuizQuestion[] } = {
  [AgeGroup.K7]: [
    {
      question: `[사고력 🧩 - TOP 사고력: 규칙인형] 수 마법 상자에 참새가 3마리 들어가면 5마리가 되어 나오고, 토끼가 6마리 들어가면 8마리가 되어 나옵니다. 이 신기한 수 상자에 꽃사슴 4마리가 동시에 들어가면 몇 마리가 되어 나올까요?`,
      choices: ["5마리", "6마리", "7마리", "8마리"],
      correctIndex: 1,
      visualInstruction: `BOND_GATHER:4:2:6:수 상자 합체`,
      explanation: `이 술래 수 마법 상자는 들어간 동물의 숫자보다 항상 2만큼 더 커지는 규칙을 가지고 있어요! 4마리가 들어가면 4 + 2 = 6마리가 되어 나온답니다.`
    },
    {
      question: `[심화 💡 - 따라하면 풀리는 초등수학] 차근차근 단계별로 따라가 보아요!\n1단계: 아기용 불리가 딸기 4알을 맛있게 먹었어요.\n2단계: 그다음 바나나를 딸기 먹은 양보다 3개 더 많이 먹었습니다.\n3단계: 불리가 먹은 과일은 모두 몇 개일까요?`,
      choices: ["9개", "11개", "7개", "10개"],
      correctIndex: 1,
      visualInstruction: `BOND_GATHER:4:7:11:딸기와 바나나 모으기`,
      explanation: `1단계: 딸기의 수는 4개입니다.\n2단계: 바나나는 딸기보다 3개 더 많으므로 4 + 3 = 7개입니다.\n3단계: 전체 과일은 딸기 4개와 바나나 7개를 더한 4 + 7 = 11개입니다!`
    },
    {
      question: `[사고력 🧩 - TOP 사고력: 거울나라] 거울 나라 요정이 숫자 카드 '8'을 세로선 방향으로 반을 똑 잘랐습니다. 이때 왼쪽 반 글자 모양은 어떤 신비한 숫자 모양과 닮았을까요?`,
      choices: ["숫자 3", "숫자 0", "숫자 1", "숫자 5"],
      correctIndex: 0,
      visualInstruction: `BOND_SPLIT:8:3:3:거울속의 8 자르기`,
      explanation: `숫자 8을 세로로 똑같이 자르고 대칭 거울을 비치면 왼쪽 부분이 숫자 '3'과 아주 쏙 빼닮게 생겼답니다.`
    },
    {
      question: `[심화 💡 - 따라하면 풀리는 초등수학] 아래 순서의 마법 단계를 차례대로 열쇠를 돌리듯 풀어보아요.\n1단계: 수 8을 반으로 갈라 똑같은 크기의 수 2개로 만듭니다. (4와 4)\n2단계: 갈라진 두 숫자 중 하나에 3을 모아줍니다. (7)\n3단계: 마지막으로 여기에 2를 덜어냅니다. 최종 숫자는 무엇인가요?`,
      choices: ["4", "5", "6", "7"],
      correctIndex: 1,
      visualInstruction: `COUNTER_SUB:7:2:5:단계별 뺄셈`,
      explanation: `1단계: 8을 반으로 나누면 4와 4가 됩니다.\n2단계: 4에 3을 더하면 4 + 3 = 7이 됩니다.\n3단계: 7에서 2를 빼면 7 - 2 = 5가 됩니다. 정답은 5입니다!`
    }
  ],
  [AgeGroup.G1]: [
    {
      question: `[사고력 🧩 - TOP 사고력: 신비한 저울] 균형 잡힌 양팔 저울이 있습니다. 왼쪽에 마법사 장난감 장화 3개와 1kg 황금 열매가 놓여 있고, 오른쪽에는 13kg짜리 무거운 보석 상자가 놓여 저울이 똑바로 평평합니다. 장화 3개의 무게가 모두 같을 때, 장난감 장화 1개의 무게는 몇 kg일까요?`,
      choices: ["3kg", "4kg", "2kg", "5kg"],
      correctIndex: 1,
      visualInstruction: `FRAME10_REGROUP_ADD:6:6:12:4:2:저울 수평수 계산`,
      explanation: `저울의 평평함을 깨지 않고 양쪽에서 똑같이 1kg씩을 덜어내면, 왼쪽에는 장화 3개만 남고 오른쪽에는 12kg이 됩니다. 장화 3개의 무게 총합이 12kg이므로, 12를 셋으로 똑같이 나누어 담으면 장화 1개는 4kg이 됩니다. (4 + 4 + 4 = 12)`
    },
    {
      question: `[심화 💡 - 따라하면 풀리는 초등수학] 한 번에 풀리지 않는 어려운 징검다리 카드 문제입니다. 단계를 밟아보아요!\n1단계: 3, 5, 9 세 장의 카드 중 오직 두 장만 뽑아 만들 수 있는 가장 큰 덧셈 결과는? (9+5=14)\n2단계: 나머지 한 장의 숫자(3)와의 차이를 구하세요. 최종 답은 몇일까요?`,
      choices: ["10", "11", "12", "13"],
      correctIndex: 1,
      visualInstruction: `FRAME10_REGROUP_SUB:14:3:11:4:1:카드 단차 정리`,
      explanation: `1단계: 가장 큰 두 수는 9와 5이므로, 가장 큰 합은 9 + 5 = 14입니다.\n2단계: 사용하지 않은 남은 카드의 숫자는 3입니다. 14와 3의 차이는 14 - 3 = 11이 정답이 자리를 잡습니다!`
    },
    {
      question: `[사고력 🧩 - TOP 사고력: 보수 징검다리] 징검다리에 일정한 보수 규칙이 걸린 숫자들이 적혀 있습니다. [ 19, 16, 13, ( ), 7 ] 괄호 안에 들어갈 가장 자연스러운 8세 대전사의 숫자는 무엇일까요?`,
      choices: ["11", "10", "9", "8"],
      correctIndex: 0,
      visualInstruction: `FRAME10_COMP:7:3:10칸 채우기`,
      explanation: `이 징검다리의 앞 숫자에서 뒤 숫자로 갈 때마다 계속 3씩 작아지는 규칙이 있습니다! 19 - 3 = 16, 16 - 3 = 13이고, 13 - 3 = 10입니다. 10 - 3 = 7이 성립하므로 괄호 안의 숫자는 10입니다.`
    },
    {
      question: `[심화 💡 - 따라하면 풀리는 초등수학] 차근차근 보수 원리로 푸는 마법 단계 구슬 퀴즈!\n1단계: 달걀판 10칸을 채우는 보수 게임에서 7의 보수를 구하세요. (3)\n2단계: 이 보수 숫자에 15를 더하세요. (18)\n3단계: 거기서 다시 9를 뺀 최종 결과는 무엇일까요?`,
      choices: ["8", "9", "10", "11"],
      correctIndex: 1,
      visualInstruction: `FRAME10_REGROUP_SUB:18:9:9:8:1:마법의 보수단계`,
      explanation: `1단계: 10칸 중 7을 채웠을 때 남는 7의 10의 보수는 10 - 7 = 3입니다.\n2단계: 보수 3에 15를 더해주면 3 + 15 = 18이 됩니다.\n3단계: 18 - 9 = 9이므로 최종 수리 정답은 9가 됩니다!`
    }
  ],
  [AgeGroup.G2]: [
    {
      question: `[사고력 🧩 - TOP 사고력: 연산기호 술사] 수 식 [ 8 □ 4 = 15 □ 3 ] 가 참이 되도록 네모 상자들의 비밀 기호를 적절히 채우려 합니다. 빈칸에 들어갈 짝꿍 기호는 차례대로 무엇일까요?`,
      choices: ["+, -", "×, +", "-, /", "+, ×"],
      correctIndex: 0,
      visualInstruction: `BASE10_ADD:8:4:12:비밀 기호 탑`,
      explanation: `수식의 왼쪽과 오른쪽을 계산한 값이 하나로 똑같이 조화되도록 만들어야 해요! 왼쪽 빈칸에 '+'를 넣으면 8 + 4 = 12가 되고, 오른쪽 빈칸에 '-'를 넣으면 15 - 3 = 12가 되어 양팔저울처럼 참이 수립됩니다.`
    },
    {
      question: `[심화 💡 - 따라하면 풀리는 초등수학] 어떤 신비한 숫자에 18을 더해야 올바른데, 실수로 18을 뺐더니 34가 성립되었습니다. 원래 완벽하게 구하려고 마음먹었던 정답 수는 과연 무엇일까요?`,
      choices: ["52", "68", "70", "74"],
      correctIndex: 2,
      visualInstruction: `BASE10_ADD:52:18:70:어떤 수 세로셈 복원`,
      explanation: `따라하며 해결해보는 어떤 수 원리 비법:\n1단계: 마음속 어떤 수에서 18을 빼서 34를 만들었으니 어떤 수는 34 + 18 = 52입니다.\n2단계: 구한 어떤 수인 52에 원래 올바르게 더하려고 했던 18을 다시 정성껏 보태어 계산하면 52 + 18 = 70이 나타난답니다!`
    },
    {
      question: `[사고력 🧩 - TOP 사고력: 성냥개비 기하학] 성냥개비로 조립된 참이 아닌 수식 [ 6 + 4 = 4 ] 가 있습니다. 성냥개비 '한 번만' 자리를 옮겨서 식을 올바른 등식으로 수리할 때, 왼쪽 끝의 숫자 6은 어떤 변형 숫자로 고쳐야 할까요?`,
      choices: ["숫자 0", "숫자 8", "숫자 9", "숫자 5"],
      correctIndex: 0,
      visualInstruction: `GRID_MULT:2:2:4:성냥개비 변형 정렬`,
      explanation: `6의 중앙 가운데를 빈 성냥개비 상태로 두고 비워둔 성냥개비를 버리거나 회전시켜 다른 계산에 맞추는 방식으로, 숫자 6을 '0'으로 변경하게 되면 0 + 4 = 4 가 기적처럼 성립하여 참이 성립합니다.`
    },
    {
      question: `[심화 💡 - 따라하면 풀리는 초등수학] 차근차근 나누어 푼다면 초등 수 연산이 한 알 배기로 풀려요!\n1단계: 한 묶음에 연필이 6자루씩 7묶음이 있습니다. 총 연필 수는? (42)\n2단계: 이 연필 중 18자루를 친구들에게 나눠주었습니다. 남은 연필 수는?\n3단계: 마지막으로 남은 연필에 4자루를 추가로 사 왔습니다. 최종 연필은 몇 자루일까요?`,
      choices: ["24자루", "28자루", "30자루", "32자루"],
      correctIndex: 1,
      visualInstruction: `BASE10_SUB:42:18:24:연필 세로셈 정리`,
      explanation: `1단계: 묶음 곱셈구구를 계산하면 6 × 7 = 42자루입니다.\n2단계: 42자루 중 18자루를 나누었으니 남아있는 연필은 42 - 18 = 24자루입니다.\n3단계: 24자루에 4자루를 합하면 24 + 4 = 28자루가 됩니다! 정답은 28입니다.`
    }
  ],
  [AgeGroup.G3]: [
    {
      question: `[사고력 🧩 - TOP 사고력: 몫의 연산 지혜] 숫자 카드 3, 5, 8 세 장을 중복 없이 한 번씩만 빈칸에 끼워 넣어 [ □□ ÷ □ ] 모양의 몫과 나눗셈 식을 직관 세팅하려 합니다. 계산 몫이 '가장 최고로 큼직'하게 나올 경우의 몫과 나머지의 조합은 무엇인가요?`,
      choices: ["몫 28, 나머지 1", "몫 27, 나머지 2", "몫 17, 나머지 1", "몫 26, 나머지 2"],
      correctIndex: 0,
      visualInstruction: `SHARE_PLATE:85:3:28:몫 분할 세팅`,
      explanation: `나눗셈 몫을 가장 최댓값으로 극대화하려면 나누어지는 두 자리 수(□□)를 보유한 숫자 카드로 만들 수 있는 최고 크기인 85로 만들고, 나누는 수(□)는 가장 미세하게 작아야 하므로 3으로 삼아야 합니다. 85 ÷ 3 을 성실히 계산하면 몫은 28 보석이고 나머지는 가뿐한 1 가루가 됩니다.`
    },
    {
      question: `[심화 💡 - 따라하면 풀리는 초등수학] 톱니바퀴 모형의 마법 장치를 해부하고 따라가 봅시다.\n1단계: 큰 톱니바퀴의 톱니 수는 24개이고, 작은 톱니바퀴의 톱니 수는 8개입니다. 두 바퀴가 정확히 맞물려 맞섭니다.\n2단계: 큰 톱니바퀴가 완벽히 한 바퀴를 돌 때 작은 톱니바퀴는 몇 바퀴를 돌까요? (3바퀴)\n3단계: 그렇다면 큰 톱니바퀴가 5바퀴를 온전히 회전할 때 작은 톱니바퀴는 총 몇 바퀴나 질주할까요?`,
      choices: ["15바퀴", "12바퀴", "10바퀴", "20바퀴"],
      correctIndex: 0,
      visualInstruction: `GRID_MULT:3:5:15:톱니바퀴 회전 매칭`,
      explanation: `1단계와 2단계: 큰 톱니바퀴의 톱니(24개)는 작은 톱니(8개)의 딱 3배입니다. 큰 바퀴가 1바퀴 돌면 톱니 24개가 가야 하므로 작은 바퀴는 이미 24 ÷ 8 = 3바퀴를 쌩쌩 회전합니다.\n3단계: 큰 톱니바퀴가 5바퀴 회전했으므로, 작은 바퀴는 3바퀴씩 5번 회전하게 되어 3 × 5 = 15바퀴가 최종 정답에 안착합니다.`
    },
    {
      question: `[사고력 🧩 - TOP 사고력: 대자연 피보나치] 마법 대수학 전당의 잎맥들의 갈래 수가 규칙적으로 나선 성장합니다. [ 1, 2, 3, 5, 8, 13, ( ), 34 ] 빈칸 괄호 안에 흐름상 자연 연산되어 솟아날 규칙의 숫자는 무엇일까요?`,
      choices: ["21", "20", "22", "19"],
      correctIndex: 0,
      visualInstruction: `AREA_MULT:3:7:21:피보나치 나선 성장`,
      explanation: `잎맥들의 성장은 앞의 이웃한 두 항의 숫자를 더해 다음 세대 숫자를 지어내는 '피보나치 수열(1+2=3, 2+3=5, 3+5=8...)'을 이끕니다. 따라서 8과 그 앞선 13을 더해주면 8 + 13 = 21 이라는 보물 숫자가 피어납니다.`
    },
    {
      question: `[심화 💡 - 따라하면 풀리는 초등수학] 빵과 조각의 등분 마법 가이드 단계!\n1단계: 피자 한 판의 전체를 8조각으로 똑같이 등분 나눴습니다.\n2단계: 그중 3조각을 동생이 먹고 2조각을 내가 먹었습니다.\n3단계: 남은 피자의 양은 전체 피자 한 판의 몇 분의 몇인지 구해 보세요.`,
      choices: ["8분의 3", "8분의 4", "8분의 5", "8분의 2"],
      correctIndex: 0,
      visualInstruction: `FRACTION_CIRCLE:3:8:피자 조각 등분할`,
      explanation: `1단계와 2단계: 피자 전체 8조각 중 동생(3)과 내(2)가 먹은 총조각의 수는 3 + 2 = 5조각입니다.\n3단계: 남은 피자는 8조각에서 먹은 5조각을 뺀 8 - 5 = 3조각이 깔끔하게 남아 장식합니다. 즉, 전체의 '8분의 3'이 정답이 됩니다.`
    }
  ]
};

/**
 * Handles generating standard math questions on the client side based on
 * AgeGroup, active difficulty, and selected concepts.
 */
export function generateLocalQuestion(
  ageGroup: AgeGroup,
  difficultyRank: "쉬움" | "보통" | "어려움" | "지옥"
): QuizQuestion {
  // 35% chance by default, but highly sensitive to chosen difficultyRank!
  let specialChance = 0.35;
  if (difficultyRank === "쉬움") specialChance = 0.05;
  else if (difficultyRank === "보통") specialChance = 0.35;
  else if (difficultyRank === "어려움") specialChance = 0.70;
  else if (difficultyRank === "지옥") specialChance = 1.0; // Entirely Critical/Advanced problems!

  if (Math.random() < specialChance) {
    const list = SPECIAL_QUESTIONS[ageGroup];
    if (list && list.length > 0) {
      const selected = list[Math.floor(Math.random() * list.length)];
      // Clone it to avoid modifying the original constants
      return { ...selected };
    }
  }

  const diffIndex = ["쉬움", "보통", "어려움", "지옥"].indexOf(difficultyRank);

  if (ageGroup === AgeGroup.K7) {
    // Stage 1: Kindergarten (7세)
    const types = ["bond_split", "bond_gather", "basic_add", "basic_sub"];
    const quizType = types[Math.floor(Math.random() * types.length)];
    
    let maxNum = 5;
    if (diffIndex === 1) maxNum = 10;
    if (diffIndex === 2) maxNum = 15;
    if (diffIndex === 3) maxNum = 20;

    if (quizType === "bond_split") {
      // 가르기 (e.g. 7 splitting into 3 and ?)
      const parent = 3 + Math.floor(Math.random() * (maxNum - 3));
      const child1 = 1 + Math.floor(Math.random() * (parent - 1));
      const child2 = parent - child1;

      const question = `[가르기 훈련] 마법 구슬 ${parent}알을 상자 두 개로 나누어 담으려고 해요. 첫 번째 상자에 ${child1}알을 담았다면, 두 번째 상자에는 몇 알을 담아야 할까요?\n(${parent}은 ${child1}와 []로 갈라집니다!)`;
      const choices = generateChoices(child2, maxNum);

      return {
        question,
        choices: choices.map(c => `${c}알`),
        correctIndex: choices.indexOf(child2),
        visualInstruction: `BOND_SPLIT:${parent}:${child1}:${child2}:마법 구슬 가르기`,
        explanation: `${parent}알 중에서 ${child1}알을 먼저 덜어내면, 남는 것은 바로 ${child2}알입니다! 그래서 ${parent}을 ${child1}와 ${child2}(으)로 가를 수 있어요.`
      };
    } else if (quizType === "bond_gather") {
      // 모으기 (e.g. 2 and 4 makes ?)
      const num1 = 1 + Math.floor(Math.random() * (Math.floor(maxNum / 2)));
      const num2 = 1 + Math.floor(Math.random() * (Math.floor(maxNum / 2)));
      const result = num1 + num2;

      const question = `[모으기 훈련] 꼬마 요정 친구들이 딸기 ${num1}개와 바나나 ${num2}개를 함께 가방에 모았어요. 가방 안의 과일은 모두 몇 개가 될까요?\n(${num1}와 ${num2}를 모으면 []가 됩니다!)`;
      const choices = generateChoices(result, maxNum);

      return {
        question,
        choices: choices.map(c => `${c}개`),
        correctIndex: choices.indexOf(result),
        visualInstruction: `BOND_GATHER:${num1}:${num2}:${result}:과일 모으기`,
        explanation: `${num1}에서 ${num2}만큼 하나씩 더 세어가면 돼요! 수 상자에서 ${num1}개 카드와 ${num2}개 카드를 서로 부딪혀 모으면 총 ${result}개가 된답니다.`
      };
    } else if (quizType === "basic_add") {
      const num1 = 1 + Math.floor(Math.random() * (Math.floor(maxNum * 0.6)));
      const num2 = 1 + Math.floor(Math.random() * (Math.floor(maxNum * 0.3)));
      const sum = num1 + num2;

      const question = `[더하기 동산] 아기용 불리가 꽃송이 ${num1}개를 모았는데, 나비가 보라꽃 ${num2}개를 보태주었어요. 불리가 가진 꽃은 모두 몇 송이일까요?\n(${num1} + ${num2} = ? )`;
      const choices = generateChoices(sum, maxNum);

      return {
        question,
        choices: choices.map(c => `${c}송이`),
        correctIndex: choices.indexOf(sum),
        visualInstruction: `COUNTER_ADD:${num1}:${num2}:${sum}:꽃송이 더하기`,
        explanation: `${num1} 다음에 ${num2} 만큼 손가락으로 가볍게 더 세어보세요. ${num1}을 머리에 담고, ${num2}개를 낱개로 펼치면 쉽게 계산할 수 있어요! (답은 ${sum})`
      };
    } else {
      // basic_sub
      const sum = 3 + Math.floor(Math.random() * (maxNum - 2));
      const sub = 1 + Math.floor(Math.random() * (sum - 1));
      const res = sum - sub;

      const question = `[빼기 동산] 물오리 아쿠가 쿠키 ${sum}개를 주웠는데 배고픈 친구에게 ${sub}개를 나누어 주었습니다. 아쿠에게 남은 쿠키는 몇 개일까요?\n(${sum} - ${sub} = ? )`;
      const choices = generateChoices(res, maxNum);

      return {
        question,
        choices: choices.map(c => `${c}개`),
        correctIndex: choices.indexOf(res),
        visualInstruction: `COUNTER_SUB:${sum}:${sub}:${res}:쿠키 덜어내기`,
        explanation: `전체 ${sum}개에서 주어버린 만큼 빗금을 쳐서 없애보아요! ${sum}에서 거꾸로 ${sub}을 거슬러 세어도 ${res}개가 짠 하고 발견된답니다.`
      };
    }
  }

  else if (ageGroup === AgeGroup.G1) {
    // Stage 2: 8세 (초1) - 20이하의 연산, 10의 보수
    const types = ["complement_10", "add_regroup", "sub_regroup"];
    const quizType = types[Math.floor(Math.random() * types.length)];

    if (quizType === "complement_10") {
      const num1 = 1 + Math.floor(Math.random() * 8); // 1 to 9
      const complement = 10 - num1;
      const question = `[10의 보수 훈련] 10칸 달걀 판에 달걀이 ${num1}개 놓여 있습니다. 달걀 판을 딱 맞춰 꽉 채우려면 몇 개의 달걀이 더 있어야 할까요?\n(${num1} + [] = 10)`;
      const choices = generateChoices(complement, 10);

      return {
        question,
        choices: choices.map(c => `${c}개`),
        correctIndex: choices.indexOf(complement),
        visualInstruction: `FRAME10_COMP:${num1}:${complement}:10칸 채우기`,
        explanation: `10은 ${num1}의 찰떡궁합 짝꿍 수인 ${complement}(으)로 만들어져요! 이를 '10의 보수'라고 하며, 모든 큰 덧셈의 가장 중요한 주춧돌이랍니다.`
      };
    } else if (quizType === "add_regroup") {
      // 20이하 받아올림 덧셈 (e.g. 8 + 6)
      const num1 = 6 + Math.floor(Math.random() * 4); // 6,7,8,9
      const num2 = 4 + Math.floor(Math.random() * 5); // 4,5,6,7,8
      const sum = num1 + num2;

      const need = 10 - num1;
      const remains = num2 - need;

      const question = `[받어올림 비법] 신비한 크리스탈 광산에 붉은 크리스탈 ${num1}개와 푸른 크리스탈 ${num2}개가 떨어져 있습니다. 광장에 모아 상자(10칸들이)에 넣어 세어보니 모두 몇 과일인가요?\n(${num1} + ${num2} = ? )`;
      const choices = generateChoices(sum, 20);

      return {
        question,
        choices: choices.map(c => `${c}개`),
        correctIndex: choices.indexOf(sum),
        visualInstruction: `FRAME10_REGROUP_ADD:${num1}:${num2}:${sum}:${need}:${remains}:크리스탈 십의 묶음`,
        explanation: `${num1}을 먼저 상자에 넣고, 10개로 꽉 채우기 위해 푸른 광석에서 ${need}개를 쏙 비려왔죠! 그럼 10개 세트 상자 1개와 낱개 ${remains}개가 남으므로 ${sum}이 됩니다! (${num1} + ${num2} = ${num1} + ${need} + ${remains} = 10 + ${remains} = ${sum})`
      };
    } else {
      // 받아내림 뺄셈 (e.g. 13 - 7)
      const sub = 5 + Math.floor(Math.random() * 5); // 5,6,7,8,9
      const res = 4 + Math.floor(Math.random() * 6); // 4 to 9
      const start = sub + res; // e.g. 13

      const baseUnit = start - 10; // e.g. 3
      const innerTake = sub - baseUnit; // e.g. 4

      const question = `[받아내림 극복] 던전에 보물상자 황금 열쇠가 ${start}개 있었는데 문을 통과하는 마법진 주술에 걸려 ${sub}개가 우르르 사라졌습니다. 살아남은 마법 열쇠는 몇 개일까요?\n(${start} - ${sub} = ? )`;
      const choices = generateChoices(res, 20);

      return {
        question,
        choices: choices.map(c => `${c}개`),
        correctIndex: choices.indexOf(res),
        visualInstruction: `FRAME10_REGROUP_SUB:${start}:${sub}:${res}:${baseUnit}:${innerTake}:열쇠 받아내림`,
        explanation: `${start}에서 뒤에 남는 낱개 ${baseUnit}개를 먼저 빼서 가뿐히 10층(10-frame)으로 만드세요! 그런 다음 남은 뺄 수 ${innerTake}개를 마저 10에서 쏙 빼주면 아주 귀여운 ${res}가 남는 답니다! (${start} - ${sub} = ${start} - ${baseUnit} - ${innerTake} = 10 - ${innerTake} = ${res})`
      };
    }
  }

  else if (ageGroup === AgeGroup.G2) {
    // Stage 3: 9세 (초2) - 두 자리 수 연산, 구구단
    const types = ["add_double", "sub_double", "multi_add_times"];
    const quizType = types[Math.floor(Math.random() * types.length)];

    if (quizType === "add_double") {
      const num1 = 25 + Math.floor(Math.random() * 40); // 25~64
      const num2 = 17 + Math.floor(Math.random() * 20); // 17~36
      const result = num1 + num2;

      const question = `[세로셈 대결] 아장아장 성벽에서 돌멩이 ${num1}개와 화강암 ${num2}개를 캐 모아 성벽을 튼튼히 보강했습니다. 성벽 수리용 돌은 전부 몇 개 일까요?\n(${num1} + ${num2} = ? )`;
      const choices = generateChoices(result, 100);

      return {
        question,
        choices: choices.map(c => `${c}개`),
        correctIndex: choices.indexOf(result),
        visualInstruction: `BASE10_ADD:${num1}:${num2}:${result}:블록 세로셈 탑`,
        explanation: `일의 자리끼리 더한 수의 일의 자리를 쓰고, 10은 무서운 점프로 십의 자리 위에 올려받습니다(받아올림)! 십의 자리 블록끼리 더하면 간단하게 ${result}에 다다릅니다.`
      };
    } else if (quizType === "sub_double") {
      const sub = 14 + Math.floor(Math.random() * 25);
      const res = 15 + Math.floor(Math.random() * 25);
      const start = sub + res; // e.g. 52 - 19

      const question = `[성벽 복구] 수리 성벽에 마법 대포탄이 ${start}발 있었는데, 용감하게 방어 전투를 치르는 동안 ${sub}발을 발사했습니다. 남아있는 마법 대포탄은 몇 발일까요?\n(${start} - ${sub} = ? )`;
      const choices = generateChoices(res, 100);

      return {
        question,
        choices: choices.map(c => `${c}발`),
        correctIndex: choices.indexOf(res),
        visualInstruction: `BASE10_SUB:${start}:${sub}:${res}:십모형 가르기`,
        explanation: `일의 자리 수에서 뺄셈이 안 될 때는 십 모형 막대기 1개를 일의 자리 낱개 10개로 변환하여 받아내림해줘요! 10에서 뺄 수를 미리 빼고 원래 낱개를 보태주면 빠르게 계산할 수 있어요.`
      };
    } else {
      // 동수누가 혹은 구구단 곱셈 원리
      const mult1 = 2 + Math.floor(Math.random() * 8); // 2 to 9
      const mult2 = 3 + Math.floor(Math.random() * 6); // 3 to 8
      const product = mult1 * mult2;

      const repeats = Array(mult2).fill(mult1).join(" + ");

      const question = `[동수누가 검술] 숲속 엘프 전사가 화살을 다발로 묶어서 발포합니다. 한 묶음에 ${mult1}개씩 들어있는 화살을 총 ${mult2}묶음 쐈습니다. 엘프 전사가 날려 보낸 화살은 모두 몇 개일까요?\n(${repeats} = ${mult1} × ${mult2} = ? )`;
      const choices = generateChoices(product, 90);

      return {
        question,
        choices: choices.map(c => `${c}개`),
        correctIndex: choices.indexOf(product),
        visualInstruction: `GRID_MULT:${mult1}:${mult2}:${product}:묶어세기 바둑판`,
        explanation: `같은 수 ${mult1}(을)를 ${mult2}번 누적하여 더해주는 원리가 바로 '곱셈(×)'입니다! 구구단 ${mult1}단을 머릿속으로 떠올려 ${mult1} × ${mult2}을 해주면 정답은 ${product}이(가) 나타납니다.`
      };
    }
  }

  else {
    // Stage 4: 10세 (초3) - 나눗셈, 곱셈 심화 및 분수
    const types = ["multi_deep", "division_basic", "fractions_basic"];
    const quizType = types[Math.floor(Math.random() * types.length)];

    if (quizType === "multi_deep") {
      const d1 = 12 + Math.floor(Math.random() * 28); // 12~39
      const d2 = 3 + Math.floor(Math.random() * 6); // 3 to 8
      const product = d1 * d2;

      const question = `[마법 제작서] 고대의 마법 주술 문서를 작성하는 슬라임 공장이 있습니다. 슬라임 하루 제작량이 ${d1}마리일 때, 총 ${d2}일 동안 가동하였다면 제작된 슬라임은 모두 몇 마리일까요?\n(${d1} × ${d2} = ? )`;
      const choices = generateChoices(product, 300);

      return {
        question,
        choices: choices.map(c => `${c}마리`),
        correctIndex: choices.indexOf(product),
        visualInstruction: `AREA_MULT:${d1}:${d2}:${product}:넓이 쪼개기 모델`,
        explanation: `${d1}를 10의 자리인 ${Math.floor(d1/10)*10}와 일의 자리인 ${d1%10}로 쪼갠 후, 각각 ${d2}을 곱해 더하는 넓이 모델을 상상해 보아요! (${Math.floor(d1/10)*10}×${d2} = ${Math.floor(d1/10)*10*d2})와 (${d1%10}×${d2} = ${d1%10*d2})의 합은 ${product}마리가 됩니다.`
      };
    } else if (quizType === "division_basic") {
      const quotient = 3 + Math.floor(Math.random() * 7); // 3 to 9
      const divisor = 2 + Math.floor(Math.random() * 7); // 2 to 8
      const dividend = quotient * divisor;

      const question = `[숲의 만찬 나누기] 꼬마 드래곤 불리가 숲을 보존한 답례로 마법 금딸기 ${dividend}알을 얻었습니다. 이 금딸기를 동료 ${divisor}마리에게 똑같이 나누어 준다면, 한 명당 가질 수 있는 딸기는 몇 개일까요?\n(${dividend} ÷ ${divisor} = ? )`;
      const choices = generateChoices(quotient, 15);

      return {
        question,
        choices: choices.map(c => `${c}개씩`),
        correctIndex: choices.indexOf(quotient),
        visualInstruction: `SHARE_PLATE:${dividend}:${divisor}:${quotient}:분배 마법 접시`,
        explanation: `나눗셈(÷)은 똑같이 갈라서 나눠 담는 원리예요! ${dividend}를 ${divisor}개의 둥근 접시에 순서대로 1동전씩 돌려가며 똑같이 나누어 주면, 한 접시 위에 고르게 ${quotient}개씩 올라갑니다. (${divisor} × ${quotient} = ${dividend}의 구구단 역법을 기억하세요!)`
      };
    } else {
      // fractions_basic (전체와 부분 분할)
      const denominator = 4 + Math.floor(Math.random() * 5); // 4 to 8 (e.g., 6)
      const numerator = 1 + Math.floor(Math.random() * (denominator - 2)); // 1 to denom-2
      
      const question = `[차원의 피자 가르기] 마법의 달콤한 초코 전트 케이크가 온전한 동그라미로 1판 구워졌습니다. 대장장이 요정이 이 케이크를 똑같이 ${denominator}조각으로 자른 뒤, 배고픈 아기용에게 ${numerator}조각을 구워 주었습니다. 아기용이 받은 양은 케이크 전체의 몇 분의 몇일까요?`;
      
      const choices = [
        `${denominator}분의 ${numerator}`,
        `${denominator}분의 ${numerator + 1}`,
        `${denominator + 1}분의 ${numerator}`,
        `${numerator}분의 ${denominator}`
      ];
      // Shuffle choices slightly to mix index but ensure exact answer exists
      const correctText = `${denominator}분의 ${numerator}`;
      // In case duplicates creep in
      const uniqueChoices = Array.from(new Set(choices));
      while (uniqueChoices.length < 4) {
        uniqueChoices.push(`${denominator}분의 ${Math.floor(Math.random()*denominator) + 1}`);
      }
      // Ensure exact correct one is in there
      if (!uniqueChoices.includes(correctText)) {
        uniqueChoices[0] = correctText;
      }
      // Shuffle
      const finalChoices = shuffleArray(uniqueChoices);
      const correctIndex = finalChoices.indexOf(correctText);

      return {
        question,
        choices: finalChoices,
        correctIndex,
        visualInstruction: `FRACTION_CIRCLE:${numerator}:${denominator}:전체와 분할 원`,
        explanation: `전체를 똑같이 등분한 총 조각 수(${denominator})가 분모(아래)가 되고, 내가 선택하거나 가져간 주황색 조각 수(${numerator})가 분자(위)가 돼요! 그래서 기호로는 '${denominator}분의 ${numerator}'라고 표현한답니다.`
      };
    }
  }
}

/**
 * Generates options with one correct answer and three logical distractors.
 */
function generateChoices(correct: number, max: number): number[] {
  const result = [correct];
  const offsetAttempts = [-1, 1, -2, 2, -10, 10, -5, 5];
  
  for (const offset of offsetAttempts) {
    if (result.length >= 4) break;
    const val = correct + offset;
    if (val > 0 && val !== correct && !result.includes(val)) {
      result.push(val);
    }
  }

  // If still not enough, generate random
  while (result.length < 4) {
    const val = Math.max(1, correct + Math.floor(Math.random() * 10) - 5);
    if (!result.includes(val)) {
      result.push(val);
    }
  }

  // Let's sort to keep kids-friendly ordering or just shuffle
  return shuffleArray(result);
}

function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
