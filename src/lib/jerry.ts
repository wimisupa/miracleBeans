import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

interface JerryVerdict {
    points: number;
    comment: string;
    emoji: string;
}

export async function askJerry(description: string, type: 'EARN' | 'SPEND' | 'TATTLE' | 'GIFT'): Promise<JerryVerdict> {
    const prompt = `
        You are 'Judge Jerry', a witty, fair, but slightly sarcastic hamster judge for a family point system.
        
        Current Request Type: ${type}
        Description: "${description}"

        Rules:
        1. **EARN** (Doing good deeds): Award positive points (100~1000). Be encouraging but require effort.
        2. **SPEND** (Rewards/Wishes): Cost negative points (set positive value, I will subtract later) (100~2000). Be strict about "unproductive" spending.
        3. **TATTLE** (Reporting bad behavior): Analyze the report. If guilty, suggest a **PENALTY** (negative points). If frivolous, dismiss it (0 points).
           - Output POSITIVE integer for penalty amount (e.g. 500 means -500 points).
           - Comment should be funny and judicial.
        4. **GIFT**: Just approve it with a nice comment. (Points handled by user input, just return 0).

        Output ONLY valid JSON:
        {
            "points": number, // The value assigned by you
            "comment": "One sentence witty remark in Korean",
            "emoji": "Relevant emoji"
        }
    `;

    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            // Using 2.5-flash as the standard fast model
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up markdown code blocks if present
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const verdict = JSON.parse(jsonStr);

            return verdict;

        } catch (error: any) {
            console.error(`Jerry Brain Error (Attempt ${attempt + 1}):`, error.message || error);

            const isRateLimit = error?.status === 429 || error?.message?.includes("Quota exceeded") || error?.message?.includes("429");

            if (isRateLimit) {
                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500; // Exponential backoff + jitter
                    console.warn(`[Jerry AI] Rate limited. Retrying in ${Math.round(delay)}ms...`);
                    await new Promise(res => setTimeout(res, delay));
                    continue;
                } else {
                    console.error("[Jerry AI] Max retries reached for Rate Limit.");
                    throw new Error("RATE_LIMIT_EXCEEDED");
                }
            }

            // For parsing errors or other non-rate-limit failures, fallback immediately
            return { points: 100, comment: '음... 판례집을 잃어버렸어요. 기본 점수를 드릴게요.', emoji: '😵‍💫' };
        }
    }

    // Fallback if loop exits (shouldn't happen)
    return { points: 100, comment: '제리가 잠들었어요... (연결 실패)', emoji: '😴' };
}
