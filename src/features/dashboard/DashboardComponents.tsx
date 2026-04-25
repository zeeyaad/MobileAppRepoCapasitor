import React, { type CSSProperties, memo } from "react";

/** Elevated white card */
export const Card: React.FC<{ children: React.ReactNode; style?: CSSProperties; className?: string; accentColor?: string }> = memo(({
    children, style, className = "", accentColor
}) => (
    <div
        className={`bg-white rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-ds-border transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 ${className}`}
        style={{
            ...style,
            borderTop: accentColor ? `4px solid ${accentColor}` : undefined
        }}
    >
        {children}
    </div>
));

/** Status badge pill */
export const Badge: React.FC<{ label: string; color: string }> = memo(({ label, color }) => (
    <span
        className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wide border"
        style={{
            backgroundColor: color + "1A",
            color: color,
            borderColor: color + "33",
        }}
    >
        {label}
    </span>
));

/** Thin progress bar */
export const ProgressBar: React.FC<{ value: number; max: number; color: string }> = memo(({ value, max, color }) => (
    <div className="h-[7px] rounded-full bg-ds-border overflow-hidden">
        <div
            className="h-full rounded-full transition-all duration-900 ease-[cubic-bezier(.4,0,.2,1)]"
            style={{
                width: `${Math.min(100, Math.round((value / max) * 100))}%`,
                backgroundColor: color,
            }}
        />
    </div>
));

/** Typed button system */
export interface BtnProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "orange" | "ghost" | "danger" | "teal";
    disabled?: boolean;
    style?: CSSProperties;
    fullWidth?: boolean;
    className?: string;
}

export const Btn: React.FC<BtnProps> = memo(({
    children, onClick, variant = "primary", disabled = false, style, fullWidth, className = ""
}) => {
    const variants = {
        primary: "bg-ds-primary text-white hover:brightness-110",
        orange: "bg-ds-orange text-white hover:brightness-110",
        teal: "bg-ds-teal text-white hover:brightness-110",
        ghost: "bg-transparent text-ds-primary border-[1.5px] border-ds-primary hover:bg-ds-primary/5",
        danger: "bg-ds-error text-white hover:brightness-110",
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                inline-flex items-center justify-center gap-2 h-[42px] px-[22px] 
                rounded-full text-[13px] font-bold cursor-pointer border-none 
                transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed
                tracking-tight font-[Cairo]
                ${fullWidth ? 'w-full' : ''}
                ${variants[variant]}
                ${className}
            `}
            style={style}
        >
            {children}
        </button>
    );
});

/** Stat chip used in training cards */
export const StatChip: React.FC<{ icon: string; label: string; val: number | string; color: string }> = memo(({ icon, label, val, color }) => (
    <div
        className="text-center p-3 rounded-xl border flex-1 transition-all hover:scale-[1.02]"
        style={{
            backgroundColor: color + "08",
            borderColor: color + "15",
        }}
    >
        <div className="text-[18px] mb-1">{icon}</div>
        <div className="text-[22px] font-black leading-tight tracking-tight mb-0.5" style={{ color }}>{val}</div>
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</div>
    </div>
));
