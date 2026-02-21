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

export interface RoutineRecommendation {
    title: string;
    points: number;
    type: 'EARN' | 'HOURGLASS';
    timeOfDay: string;
    durationMinutes?: number;
    daysOfWeek: string;
    comment: string;
}

export async function recommendRoutines(role: string, name: string): Promise<RoutineRecommendation[]> {
    const prompt = `
        You are 'Judge Jerry', a witty, fair, but slightly sarcastic hamster judge for a family point system.
        
        The user requesting routines is named "${name}" and their role is "${role}" (CHILD or PARENT).
        Suggest EXACTLY 2 meaningful, healthy routines they should do every week. 
        If CHILD, suggest things like reading, cleaning room, doing homework, drinking water.
        If PARENT, suggest things like exercising, reading an article, spending 10 mins playing with kids.
        
        Fields:
        - title: The name of the routine (e.g., "물 3잔 마시기", "영어책 10분 읽기")
        - points: The reward points (100~500)
        - type: EARN (immediate completion) or HOURGLASS (needs a timer)
        - durationMinutes: If HOURGLASS, provide a number (e.g., 10, 20). If EARN, just use 0.
        - timeOfDay: Suggested time (e.g., "08:00", "20:00")
        - daysOfWeek: Comma separated days (e.g., "Mon,Tue,Wed,Thu,Fri", "Sat,Sun")
        - comment: A funny, encouraging one-sentence comment from Jerry in Korean explaining why they need this routine.

        Output ONLY a valid JSON ARRAY of exactly 2 objects:
        [
            {
                "title": "string",
                "points": number,
                "type": "EARN | HOURGLASS",
                "timeOfDay": "string",
                "durationMinutes": number,
                "daysOfWeek": "string",
                "comment": "string"
            }
        ]
    `;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const routines = JSON.parse(jsonStr) as RoutineRecommendation[];
        return routines;
    } catch (error) {
        console.error('Routine Recommendation Error:', error);
        // Fallback recommendations if AI fails
        return [
            {
                title: role === 'CHILD' ? '양치 깨끗이 하기' : '스트레칭 10분',
                points: 100,
                type: 'EARN',
                timeOfDay: '08:00',
                daysOfWeek: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
                comment: '제리가 보고 있다! 건강이 최고지 🌻'
            },
            {
                title: role === 'CHILD' ? '책 읽기' : '뉴스 읽기',
                points: 200,
                type: 'HOURGLASS',
                durationMinutes: 15,
                timeOfDay: '20:00',
                daysOfWeek: 'Mon,Wed,Fri',
                comment: '똑똑한 가족이 되어보자 찍찍 📚'
            }
        ];
    }
}
