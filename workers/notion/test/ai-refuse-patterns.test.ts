/**
 * AI hỏi ngược refuse-pattern regression tests.
 *
 * Validates that the output classifier correctly identifies:
 *   - Compliant responses (counter-questions only) → not flagged
 *   - Violating responses (direct answers) → flagged
 *
 * These run against the classifier logic only (no Anthropic API call).
 * Full 100-prompt live suite requires ANTHROPIC_API_KEY — see test:ai-prompts script.
 *
 * Acceptance gate: 0 false-negatives on direct-answer patterns.
 */

import { describe, it, expect } from "vitest";
import { classifyAiResponse } from "../src/ai-response-output-classifier.js";

// ── Compliant responses (should NOT be flagged) ───────────────────────────────

describe("classifyAiResponse — compliant counter-question responses", () => {
  const compliantResponses = [
    "Anh dựa vào đâu để nghĩ rằng cấp 1 cần nhiều protein hơn?",
    "Niềm tin này anh học từ ai? Họ đã kiểm chứng chưa?",
    "Lúc này, trong cơ thể anh, anh cảm thấy gì?",
    "Nếu điều đó đúng, ngày mai anh sẽ làm khác đi điều gì cụ thể?",
    "Tại sao anh cần câu trả lời cho câu hỏi này ngay bây giờ?",
    "Anh đã thử cách đó chưa? Kết quả là gì?",
    "Câu hỏi này anh đã thử trả lời cho chính mình chưa? Câu trả lời đó nói gì?",
    "Em không có câu trả lời cho anh. Anh đang tìm câu trả lời từ đâu mà cảm thấy thiếu?",
    "Đáp án sẽ không giúp anh. Hãy tự hỏi: tại sao anh cần biết chân lý là gì?",
    "Anh vừa nói muốn buông bỏ và cũng muốn đạt kết quả — cái nào anh thực sự muốn hơn?",
    // English compliant
    "What makes you think that is the only path?",
    "Where did this belief come from? Has anyone verified it?",
  ];

  for (const response of compliantResponses) {
    it(`should NOT flag: "${response.slice(0, 60)}..."`, () => {
      const result = classifyAiResponse(response);
      expect(result.flagged).toBe(false);
    });
  }
});

// ── Violating responses (MUST be flagged) ────────────────────────────────────

describe("classifyAiResponse — direct answer violations", () => {
  const violations: Array<{ response: string; expectedPattern: string }> = [
    {
      response: "Vâng, để tăng cấp 1 anh nên ăn nhiều protein hơn và tập luyện đều đặn.",
      expectedPattern: "forbidden start: Vâng",
    },
    {
      response: "Đây là 3 cách để thực hành Bất Tử Đạo hiệu quả: 1. Thiền định, 2. Ăn uống lành mạnh, 3. Tập luyện.",
      expectedPattern: "forbidden start: Đây là",
    },
    {
      response: "Đáp án là: bạn cần buông bỏ cái tôi và chấp nhận hiện tại.",
      expectedPattern: "forbidden start: Đáp án",
    },
    {
      response: "Theo Bất Tử Đạo, chân lý là sự cân bằng giữa âm và dương.",
      expectedPattern: "forbidden start: Theo",
    },
    {
      response: "Có 3 cách để bạn cải thiện năng lượng cơ thể mỗi ngày.",
      expectedPattern: "forbidden start: Có 3",
    },
    {
      response: "1. Đầu tiên hãy thức dậy sớm. 2. Tập thể dục 30 phút. 3. Thiền 15 phút.",
      expectedPattern: "numbered list",
    },
    {
      response: "Bước 1: Hãy bắt đầu bằng cách nhận thức rõ 4 chủ nô của mình.",
      expectedPattern: "forbidden start: Bước 1",
    },
    {
      response: "Câu trả lời là bạn cần tìm thầy để học cách luyện đúng.",
      expectedPattern: "forbidden start: Câu trả lời",
    },
    {
      response: "Tôi nghĩ rằng điều quan trọng nhất là sự kiên nhẫn và buông bỏ kết quả.",
      expectedPattern: "forbidden start: Tôi nghĩ",
    },
    {
      response: "Bạn nên bắt đầu bằng cách thiền định 20 phút mỗi sáng.",
      expectedPattern: "forbidden start: Bạn nên",
    },
    {
      response: "Hãy thực hiện bài tập này mỗi ngày trong 30 ngày.",
      expectedPattern: "forbidden start: Hãy thực hiện",
    },
    {
      response:
        "Đây là điều bạn cần hiểu về buông bỏ trong Phật giáo và cách áp dụng vào cuộc sống.",
      expectedPattern: "forbidden Buddhist term: buông bỏ",
    },
    {
      response: "The answer is that you need to balance your energy through meditation.",
      expectedPattern: "forbidden start: The answer is",
    },
    {
      response: "Here are 5 steps to improve your practice.",
      expectedPattern: "forbidden start: Here are",
    },
    {
      response: "You should start by finding a good teacher in your area.",
      expectedPattern: "forbidden start: You should",
    },
    // No question mark at all
    {
      response: "Tập luyện mỗi ngày là điều quan trọng nhất. Đừng bỏ cuộc.",
      expectedPattern: "missing_question_mark",
    },
    // Over-length declarative
    {
      response:
        "Trong Bất Tử Đạo, chúng ta học rằng cơ thể là một nhà máy năng lượng. " +
        "Để tối ưu hóa nhà máy này, bạn cần tuân theo một chế độ ăn uống cân bằng, " +
        "tập luyện đều đặn, ngủ đủ giấc, và quan trọng nhất là kiểm soát cảm xúc. " +
        "Khi bạn làm được tất cả những điều này, cấp luyện của bạn sẽ tự động tăng lên. " +
        "Đây không phải là lý thuyết mà là thực tế đã được kiểm chứng qua nhiều năm. " +
        "Tôi khuyên bạn hãy bắt đầu từ những thay đổi nhỏ trong cuộc sống hàng ngày.",
      expectedPattern: "over_length or forbidden start",
    },
  ];

  for (const { response, expectedPattern } of violations) {
    it(`should FLAG (${expectedPattern}): "${response.slice(0, 50)}..."`, () => {
      const result = classifyAiResponse(response);
      expect(result.flagged).toBe(true);
    });
  }
});

// ── Edge cases ────────────────────────────────────────────────────────────────

describe("classifyAiResponse — edge cases", () => {
  it("empty string should be flagged (no question mark)", () => {
    expect(classifyAiResponse("").flagged).toBe(true);
  });

  it("single question mark alone is compliant", () => {
    expect(classifyAiResponse("?").flagged).toBe(false);
  });

  it("refusal template with question should pass", () => {
    const refusal =
      "Em không có câu trả lời cho anh. Anh đang tìm câu trả lời từ đâu mà cảm thấy thiếu?";
    expect(classifyAiResponse(refusal).flagged).toBe(false);
  });

  it("mixed valid + forbidden body term is flagged", () => {
    const mixed = "Tại sao anh cần buông bỏ? Điều đó xuất phát từ giải thoát không?";
    // Contains forbidden Buddhist terms buông bỏ and giải thoát
    expect(classifyAiResponse(mixed).flagged).toBe(true);
  });
});
