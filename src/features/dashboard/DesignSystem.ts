/**
 * DESIGN SYSTEM TOKENS
 * 
 * Note: These are mirrored in src/index.css for Tailwind.
 * We keep hex values here for components that need to perform
 * color math (like adding opacity) or for dynamic style props.
 */
export const DS = {
    colors: {
        primary: "#1F6FD5",
        navy: "#1B2D48",
        teal: "#17A2B8",
        orange: "#F59E0B",
        success: "#16A34A",
        error: "#DC2626",
        textPrimary: "#0F1E2E",
        textSecondary: "#4A5568",
        textMuted: "#8FA3BB",
        border: "#DDE5F0",
        primaryLight: "#EBF3FF",
        tealLight: "#E8F8FB",
        orangeLight: "#FFF7ED",
        successLight: "#F0FDF4",
        errorLight: "#FEF2F2",
        cardBg: "#FFFFFF",
        cardBorder: "#E4EAF2",
        inputBg: "#F5F8FC",
        primaryDark: "#1558B0",
    }
} as const;
