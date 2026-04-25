import React from "react";
import type { ToastType } from "./types";

export const Toast: React.FC<{ msg: string; type: ToastType; onClose: () => void }> = ({ msg, type, onClose }) => (
    <div
        className={`fixed bottom-3 left-3 right-3 sm:bottom-6 sm:left-auto sm:right-6 z-[9999] px-4 py-3 rounded-lg font-bold text-[13px] shadow-2xl flex items-center gap-3.5 max-w-none sm:max-w-[360px] animate-toast-in rtl text-white ${type === 'success' ? 'bg-ds-success' : 'bg-ds-error'}`}
    >
        <span className="flex-1 leading-relaxed">{msg}</span>
        <button
            onClick={onClose}
            className="bg-transparent border-none text-white/80 cursor-pointer text-[16px] hover:text-white transition-colors"
        >
            ✕
        </button>
    </div>
);
