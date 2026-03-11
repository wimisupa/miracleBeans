import React from 'react';

// Common style for hand-drawn look: stroke cap round, stroke join round, thicker stroke widths, and broken lines.
export const PROFILE_ICONS: Record<string, React.FC<{ size?: number; color?: string; className?: string }>> = {
    // 1. Rat (Jerry as a Judge - Simpler, clearer)
    rat: ({ size = 24, color = 'currentColor', className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Judge wig base */}
            <path d="M4 12 C 4 7, 20 7, 20 12" stroke="#ddd" strokeWidth="3" />
            <path d="M3 15 C 5 15, 6 12, 4 12 M 21 15 C 19 15, 18 12, 20 12" stroke="#ddd" strokeWidth="2" />
            
            {/* Mouse Face Silhouette */}
            <path d="M8 11 C 12 18, 16 11, 16 11 Z" fill="#fff" />
            <path d="M8 11 L 12 18 L 16 11" />
            
            {/* Big round ears popping out */}
            <circle cx="7" cy="8" r="2.5" />
            <circle cx="17" cy="8" r="2.5" />
            
            {/* Simple dot eyes and nose */}
            <circle cx="10.5" cy="12" r="1.2" fill={color} stroke="none" />
            <circle cx="13.5" cy="12" r="1.2" fill={color} stroke="none" />
            <circle cx="12" cy="16" r="1.5" fill={color} stroke="none" />
            
            {/* Judge gavel */}
            <line x1="16" y1="18" x2="21" y2="13" strokeWidth="1.5" />
            <rect x="19" y="11" width="3" height="4" rx="1" transform="rotate(45 20.5 13)" fill="#fff" />
        </svg>
    ),

    // 2. Cow (Iconic horns and nose ring)
    cow: ({ size = 24, color = 'currentColor', className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Head */}
            <path d="M7 9 C 7 5, 17 5, 17 9 L 18 16 C 18 20, 6 20, 6 16 Z" />
            {/* Horns */}
            <path d="M7 8 C 4 6, 3 9, 3 9 M 17 8 C 20 6, 21 9, 21 9" strokeWidth="2" />
            {/* Ears */}
            <path d="M6 11 L 2 13 C 2 13, 3 15, 6 13 M 18 11 L 22 13 C 22 13, 21 15, 18 13" />
            {/* Big Snout oval */}
            <ellipse cx="12" cy="17" rx="6" ry="3" />
            {/* Nostrils */}
            <circle cx="9.5" cy="17" r="1" fill={color} stroke="none" />
            <circle cx="14.5" cy="17" r="1" fill={color} stroke="none" />
            {/* Eyes */}
            <circle cx="9" cy="12" r="1" fill={color} stroke="none" />
            <circle cx="15" cy="12" r="1" fill={color} stroke="none" />
        </svg>
    ),

    // 3. Tiger (Stripes and strong cheeks)
    tiger: ({ size = 24, color = 'currentColor', className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Face shape (square-ish circle) */}
            <rect x="5" y="6" width="14" height="14" rx="6" />
            {/* Round ears */}
            <path d="M7 6 A 3 3 0 0 1 4 9 M 17 6 A 3 3 0 0 0 20 9" />
            {/* Crown stripes '王' */}
            <path d="M10 8 H 14 M 9 10 H 15 M 12 8 V 11" strokeWidth="1.5" />
            {/* Cheek stripes */}
            <path d="M5 13 L 8 13.5 M 5 15 L 8 14.5 M 19 13 L 16 13.5 M 19 15 L 16 14.5" />
            {/* Eyes & Nose/Mouth */}
            <path d="M8 13 L 10 13 M 16 13 L 14 13" strokeWidth="2" />
            <path d="M12 15 L 11 17 Q 12 18, 13 17 Z" fill={color} />
        </svg>
    ),

    // 4. Rabbit (Long ears, minimalist)
    rabbit: ({ size = 24, color = 'currentColor', className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Head */}
            <circle cx="12" cy="16" r="6" />
            {/* Long ears */}
            <path d="M8 11 Q 6 2, 9 2 Q 12 2, 11 11 M 16 11 Q 18 2, 15 2 Q 12 2, 13 11" />
            {/* Inner ear lines */}
            <path d="M9 5 V 9 M 15 5 V 9" />
            {/* Eyes */}
            <circle cx="9.5" cy="15" r="1" fill={color} stroke="none" />
            <circle cx="14.5" cy="15" r="1" fill={color} stroke="none" />
            {/* X Mouth/Nose */}
            <path d="M11 18 L 13 20 M 13 18 L 11 20" strokeWidth="1" />
        </svg>
    ),

    // 5. Dragon (Body coiled like a sea creature/snake with legs)
    dragon: ({ size = 24, color = 'currentColor', className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Swirling Body S-curve */}
            <path d="M4 14 C 4 9, 8 7, 12 10 C 16 13, 20 11, 20 6" strokeWidth="2.5" />
            <path d="M4 14 C 4 19, 9 21, 14 19" strokeWidth="2.5" />
            
            {/* Dragon Head (Top Right) */}
            <path d="M19 5 L 21 6 L 22 4" strokeWidth="1.5" /> {/* Horn */}
            <circle cx="20" cy="6" r="1.5" fill="#fff" strokeWidth="1.5" /> {/* Head bump */}
            <path d="M21 7 L 19 8 L 22 9 Z" fill={color} /> {/* Snout/Mouth open */}
            
            {/* Small Legs/Claws */}
            <path d="M9 10 L 7 12 M 7 12 L 5 11" /> {/* Front leg */}
            <path d="M11 18 L 13 21 M 13 21 L 11 22" /> {/* Back leg */}
            
            {/* Back Spikes */}
            <path d="M6 9 L 7 7 M 11 10 L 12 8 M 15 11 L 16 9 M 8 19 L 9 21 M 14 17 L 15.5 19" strokeWidth="1" stroke="#e11d48" />
        </svg>
    ),

    // 6. Snake (Coiled abstract 'S')
    snake: ({ size = 24, color = 'currentColor', className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Snake Body Coiled up */}
            <path d="M12 9 C 9 9, 6 11, 7 14 C 8 18, 16 14, 17 18 C 18 21, 14 22, 10 21" strokeWidth="3" />
            {/* Snake Head pointing out */}
            <path d="M12 9 C 14 9, 17 6, 15 4 C 13 2, 10 5, 12 9 Z" fill="#fff" strokeWidth="1.5" />
            {/* Eye */}
            <circle cx="13" cy="5" r="1" fill={color} stroke="none" />
            {/* Forked Tongue */}
            <path d="M15 4 L 18 2 L 20 3 M 18 2 L 19 1" strokeWidth="1" stroke="#e11d48" />
        </svg>
    ),

    // 7. Horse (Side profile with mane)
    horse: ({ size = 24, color = 'currentColor', className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Head and Neck Profile */}
            <path d="M17 10 L 14 4 L 8 5 L 5 12 L 4 19 C 7 21, 10 20, 11 18 L 13 13 C 15 13, 17 18, 17 21" />
            {/* Mane */}
            <path d="M14 4 C 16 6, 19 10, 18 15" strokeWidth="2" stroke="#aaa" strokeDasharray="4 2" />
            {/* Eye and Nostril */}
            <circle cx="9" cy="11" r="1" fill={color} stroke="none" />
            <circle cx="6" cy="17" r="1.5" fill={color} stroke="none" />
            {/* Perked Ear */}
            <path d="M11 5 L 12 2 L 14 4" />
        </svg>
    ),

    // 8. Sheep (Simple cloud shape with curved horns)
    sheep: ({ size = 24, color = 'currentColor', className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Wooly Cloud Body */}
            <path d="M12 4 Q 15 4 16 6 Q 20 6 19 10 Q 22 14 18 17 Q 15 20 12 19 Q 9 20 6 17 Q 2 14 5 10 Q 4 6 8 6 Q 9 4 12 4 Z" fill="#fff" />
            {/* Smooth Face */}
            <path d="M9 11 C 9 9, 15 9, 15 11 C 15 16, 13 19, 12 19 C 11 19, 9 16, 9 11 Z" fill="#eee" />
            {/* Curved Horns (Aries style) */}
            <path d="M6 10 C 2 10, 2 15, 5 16 C 8 17, 9 13, 7 11 S 3 12, 4 14" />
            <path d="M18 10 C 22 10, 22 15, 19 16 C 16 17, 15 13, 17 11 S 21 12, 20 14" />
            {/* Sleepy Eyes & Y Nose */}
            <path d="M10.5 13 H 11.5 M 12.5 13 H 13.5" strokeLinecap="round" />
            <path d="M12 15 V 17 M 11 16 L 12 17 L 13 16" />
        </svg>
    ),

    // 9. Monkey (Heart-faced curves)
    monkey: ({ size = 24, color = 'currentColor', className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Round Head */}
            <circle cx="12" cy="12" r="7" />
            {/* Big C ears */}
            <path d="M5 10 A 3 3 0 0 0 5 14 M 19 10 A 3 3 0 0 1 19 14" />
            {/* Heart-shaped face marking */}
            <path d="M12 10 C 14 6, 18 9, 16 13 C 15 15, 12 17, 12 17 C 12 17, 9 15, 8 13 C 6 9, 10 6, 12 10 Z" fill="#eee" stroke="none" />
            <path d="M12 10 C 14 6, 18 9, 16 13 C 15 15, 12 17, 12 17 C 12 17, 9 15, 8 13 C 6 9, 10 6, 12 10 Z" />
            {/* Eyes and Mouth */}
            <circle cx="9.5" cy="12" r="1.5" fill={color} stroke="none" />
            <circle cx="14.5" cy="12" r="1.5" fill={color} stroke="none" />
            <path d="M10 15 Q 12 16 14 15" />
        </svg>
    ),

    // 10. Chicken (Comb and Beak stand out)
    chicken: ({ size = 24, color = 'currentColor', className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Simple bulbous body */}
            <circle cx="12" cy="14" r="6" />
            {/* 3-point Comb */}
            <path d="M12 8 C 10 5, 8 7, 9 9 M 12 8 C 12 4, 15 5, 14 8 M 14 8 C 17 6, 17 9, 15 10" stroke="#e11d48" strokeWidth="2" />
            {/* Triangle Beak & Wattle */}
            <polygon points="17.5,13 22,14 18,15" fill={color} strokeLinejoin="miter" />
            <path d="M17 15 C 18 18, 15 18, 16 15" stroke="#e11d48" fill="#e11d48" />
            {/* Eye */}
            <circle cx="15" cy="12" r="1" fill={color} stroke="none" />
            {/* Wing curve */}
            <path d="M7 13 L 13 13 C 13 13, 11 17, 7 15 Z" />
            {/* Tail feathers */}
            <path d="M6 14 C 2 12, 2 16, 6 16" />
        </svg>
    ),

    // 11. Dog (Retriever side profile - smooth, distinct snout, hanging ear)
    dog: ({ size = 24, color = 'currentColor', className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Head and Snout Profile */}
            <path d="M11 6 C 14 6, 17 8, 17 11 L 17 17 C 17 20, 14 21, 10 20 L 7 20 C 5 20, 4 18, 4 16 C 4 14, 6 13, 8 13 L 9 13 C 9 10, 8 8, 11 6 Z" />
            
            {/* Retriever's Floppy Ear (Long and smooth) */}
            <path d="M12 9 C 14 9, 16 11, 15 15 C 14 18, 11 17, 11 14 C 10 11, 10 9, 12 9 Z" fill="#fff" />
            
            {/* Nose (Prominent pointer nose) */}
            <ellipse cx="4.5" cy="15" rx="1.5" ry="1.2" fill={color} stroke="none" />
            
            {/* Gentle, expressive Eye */}
            <circle cx="10" cy="11" r="1.2" fill={color} stroke="none" />
            
            {/* Mouth/Smile line */}
            <path d="M5 18 Q 7 19, 9 18" />
        </svg>
    ),

    // 12. Pig (Simple circle with large prominent snout)
    pig: ({ size = 24, color = 'currentColor', className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Round face */}
            <circle cx="12" cy="13" r="7" />
            {/* Inverted V Folded ears */}
            <path d="M7 8 L 5 3 L 8.5 6 Z" />
            <path d="M17 8 L 19 3 L 15.5 6 Z" />
            {/* Prominent Snout (Center oval) */}
            <ellipse cx="12" cy="14" rx="3.5" ry="2.5" fill="#fff" />
            <circle cx="10.5" cy="14" r="0.8" fill={color} stroke="none" />
            <circle cx="13.5" cy="14" r="0.8" fill={color} stroke="none" />
            {/* Tiny Eyes wide apart */}
            <circle cx="8" cy="11" r="1" fill={color} stroke="none" />
            <circle cx="16" cy="11" r="1" fill={color} stroke="none" />
        </svg>
    )
};

type ProfileIconProps = {
    name: string;
    size?: number;
    color?: string;
    className?: string;
};

export const ProfileIconDisplay: React.FC<ProfileIconProps> = ({ name, size = 24, color = 'currentColor', className }) => {
    const Icon = PROFILE_ICONS[name] || PROFILE_ICONS['dog']; // dog as fallback
    return <Icon size={size} color={color} className={className} />;
};

export const ProfileIconPicker: React.FC<{
    selected: string;
    onSelect: (name: string) => void;
    color?: string;
}> = ({ selected, onSelect, color = '#607D8B' }) => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem', padding: '0.5rem' }}>
            {Object.keys(PROFILE_ICONS).map((iconName) => (
                <button
                    key={iconName}
                    type="button"
                    onClick={() => onSelect(iconName)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px',
                        background: selected === iconName ? 'var(--color-primary)' : 'var(--bg-main)',
                        border: selected === iconName ? '2px solid #FFC107' : '2px solid transparent',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: selected === iconName ? 'var(--shadow-sm)' : 'none'
                    }}
                >
                    <ProfileIconDisplay name={iconName} size={32} color={selected === iconName ? '#FFFFFF' : color} />
                </button>
            ))}
        </div>
    );
};
