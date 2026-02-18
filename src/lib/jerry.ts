// Simple heuristic-based AI for now
// In the future, this can be replaced with a call to Google Gemini API

interface JerryVerdict {
    points: number;
    comment: string;
    emoji: string;
}

export async function askJerry(description: string, type: 'EARN' | 'SPEND'): Promise<JerryVerdict> {
    const desc = description.toLowerCase();

    // EARN logic (Helping the family)
    if (type === 'EARN') {
        if (desc.includes('설거지') || desc.includes('그릇')) return { points: 500, comment: '반짝반짝 깨끗하게 부탁해!', emoji: '🍽️' };
        if (desc.includes('청소') || desc.includes('정리')) return { points: 600, comment: '방이 깨끗해지면 기분도 좋아져!', emoji: '🧹' };
        if (desc.includes('안마') || desc.includes('주무르기')) return { points: 1000, comment: '효도에는 큰 보상이 따르지!', emoji: '💆' };
        if (desc.includes('심부름')) return { points: 300, comment: '빠르고 정확하게 다녀오기!', emoji: '🏃' };
        if (desc.includes('공부') || desc.includes('숙제')) return { points: 200, comment: '지식도 쌓고 뽀도 쌓고!', emoji: '📚' };

        // Default for Earn
        return { points: 100, comment: '가족을 위한 마음 칭찬해!', emoji: '👍' };
    }

    // SPEND logic (Rewards)
    else {
        if (desc.includes('게임') || desc.includes('피파')) return { points: 1000, comment: '1시간 즐겁게 게임해!', emoji: '🎮' };
        if (desc.includes('유튜브') || desc.includes('영상')) return { points: 500, comment: '재밌는 영상 30분!', emoji: '📺' };
        if (desc.includes('간식') || desc.includes('과자')) return { points: 300, comment: '맛있게 먹어!', emoji: '🍪' };

        // Default for Spend
        return { points: 500, comment: '신중하게 사용하기!', emoji: '💸' };
    }
}
