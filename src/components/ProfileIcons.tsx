import React from 'react';

// Common style for hand-drawn look: stroke cap round, stroke join round, thicker stroke widths, and broken lines.
export const PROFILE_ICONS: Record<string, React.FC<{ size?: number; color?: string; className?: string }>> = {
    dog: ({ size = 24, color = 'currentColor', className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Face outline */}
            <path d="M16 14 A 6 6 0 0 1 8 14" /> 
            <path d="M8 14 A 4 4 0 0 1 8 6 A 5 5 0 0 1 16 6 A 4 4 0 0 1 16 14" />
            {/* Ears */}
            <path d="M8 6 C 5 3, 2 5, 3 9 C 4 12, 6 12, 6 10" />
            <path d="M16 6 C 19 3, 22 5, 21 9 C 20 12, 18 12, 18 10" />
            {/* Eyes */}
            <circle cx="10" cy="10" r="1.5" fill={color} stroke="none" />
            <circle cx="14" cy="10" r="1.5" fill={color} stroke="none" />
            <circle cx="9.8" cy="9.8" r="0.5" fill="#FFF" stroke="none" /> {/* Eye glint */}
            <circle cx="13.8" cy="9.8" r="0.5" fill="#FFF" stroke="none" />
            {/* Nose and Mouth */}
            <ellipse cx="12" cy="13" rx="2" ry="1.5" fill={color} stroke="none" />
            <path d="M12 14.5 V 16 C 11 17, 13 17, 12 16" />
            {/* Collar/Body */}
            <path d="M7 16 C 6 18, 5 22, 5 22 L 19 22 C 19 22, 18 18, 17 16" />
            <path d="M6 17 C 10 19, 14 19, 18 17" strokeWidth="2" />
            <circle cx="12" cy="19" r="1.5" fill={color} stroke="none" />
        </svg>
    ),
    rabbit: ({ size = 24, color = 'currentColor', className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Face */}
            <path d="M17 14 C 17 18, 14 21, 12 21 C 10 21, 7 18, 7 14 C 7 10, 10 8, 12 8 C 14 8, 17 10, 17 14 Z" />
            {/* Ears (long and specific) */}
            <path d="M9 9 C 9 3, 6 1, 6 4 C 6 7, 8 10, 8 10" />
            <path d="M15 9 C 15 3, 18 1, 18 4 C 18 7, 16 10, 16 10" />
            <path d="M7.5 5 V 7 M 16.5 5 V 7" strokeWidth="1" /> {/* Inner ear marks */}
            {/* Eyes */}
            <circle cx="10" cy="13" r="1.5" fill={color} stroke="none" />
            <circle cx="14" cy="13" r="1.5" fill={color} stroke="none" />
            <circle cx="9.8" cy="12.8" r="0.5" fill="#FFF" stroke="none" />
            <circle cx="13.8" cy="12.8" r="0.5" fill="#FFF" stroke="none" />
            {/* Nose and mouth */}
            <path d="M11 15.5 L 12 16.5 L 13 15.5 Z" fill={color} />
            <path d="M12 16.5 L 12 18 C 11 19, 13 19, 12 18" />
            {/* Whiskers */}
            <path d="M7 14 L 3 13 M 7 15 L 2 15 M 7 16 L 3 17" strokeWidth="1" />
            <path d="M17 14 L 21 13 M 17 15 L 22 15 M 17 16 L 21 17" strokeWidth="1" />
        </svg>
    ),
    chicken: ({ size = 24, color = 'currentColor', className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Body */}
            <path d="M14 6 C 13 8, 8 8, 6 13 C 4 18, 6 20, 6 20 L 16 20 C 16 20, 19 16, 17 11 C 18 8, 15 6, 14 6 Z" />
            {/* Tail */}
            <path d="M6 13 C 3 11, 2 13, 4 15 C 2 16, 2 18, 5 18" />
            {/* Comb */}
            <path d="M14 6 C 13 3, 14 2, 15 4 C 16 2, 18 3, 17 5 C 19 6, 18 7, 17 7" strokeWidth="1.5" fill={color} />
            {/* Beak */}
            <path d="M17 8 L 22 9 L 18 10 Z" fill={color} />
            {/* Eye */}
            <circle cx="15.5" cy="8.5" r="1.5" fill={color} stroke="none" />
            <circle cx="15.3" cy="8.3" r="0.5" fill="#FFF" stroke="none" />
            {/* Wattle (부리 아래 수염) */}
            <path d="M17 10 C 18 13, 15 13, 16 10" fill={color} />
            {/* Wing */}
            <path d="M10 12 C 14 12, 15 15, 12 17 C 9 18, 7 16, 10 12 Z" />
            <path d="M10 14 L 12 15 M 9 16 L 11 16" strokeWidth="1" />
            {/* Feet */}
            <path d="M9 20 V 23 M 7 23 L 9 23 L 11 23 M 9 23 V 24" strokeWidth="1.5" />
            <path d="M13 20 V 23 M 11 23 L 13 23 L 15 23 M 13 23 V 24" strokeWidth="1.5" />
        </svg>
    ),
    snake: ({ size = 24, color = 'currentColor', className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Body */}
            <path d="M8 8 C 4 8, 4 14, 8 14 C 14 14, 14 20, 8 20 C 4 20, 3 18, 2 17" strokeWidth="4" />
            {/* Head */}
            <path d="M8 8 C 12 8, 14 6, 16 6 C 19 6, 20 9, 17 11 C 15 12, 12 10, 8 10" strokeWidth="1.5" fill="#fff" />
            {/* Eye */}
            <circle cx="16" cy="8" r="1.5" fill={color} stroke="none" />
            <circle cx="16.2" cy="7.8" r="0.5" fill="#FFF" stroke="none" />
            {/* Tongue */}
            <path d="M19 9 L 22 9 L 23 8 M 22 9 L 23 10" strokeWidth="1" stroke="#e11d48" />
            {/* Patterns */}
            <path d="M6 12 L 8 12 M 10 15 L 12 16 M 10 19 L 8 19 M 5 18 L 4 19" strokeWidth="1" />
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
