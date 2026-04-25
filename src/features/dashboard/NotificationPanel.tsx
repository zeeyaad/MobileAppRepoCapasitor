import React, { useRef, useEffect } from "react";
import type { Notification } from "./types";

const NOTIFS_MOCK: Notification[] = [
    { id: 1, icon: "⚽", title: "تدريب كرة القدم غداً", msg: "الثلاثاء 5:00 م — ملعب 1", time: "منذ 10 دقائق", read: false },
    { id: 2, icon: "✅", title: "تأكيد الانضمام", msg: "انضممت إلى رياضة كرة السلة بنجاح", time: "منذ ساعة", read: false },
];

export const NotificationPanel: React.FC<{
    onClose: () => void;
    notifications?: Notification[];
    onMarkAllRead?: () => void;
    onMarkRead?: (id: number) => void;
}> = ({ onClose, notifications, onMarkAllRead, onMarkRead }) => {
    const list = notifications || NOTIFS_MOCK;
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    return (
        <div
            ref={ref}
            className="absolute top-[58px] w-[min(380px,calc(100vw-1rem))] bg-white rounded-xl shadow-ds-hover border border-ds-border z-[200] overflow-hidden animate-fade-up rtl"
            style={{ insetInlineEnd: 0 }}
        >
            <div className="px-3.5 py-4 border-b border-ds-border flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[15px]">الإشعارات</span>
                    {list.some(n => !n.read) && (
                        <button
                            onClick={onMarkAllRead}
                            className="text-[10px] bg-ds-primary/10 text-ds-primary px-2 py-0.5 rounded-full font-bold hover:bg-ds-primary hover:text-white transition-all"
                        >
                            تحديد الكل كمقروء
                        </button>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="bg-transparent border-none cursor-pointer text-[16px] text-ds-text-muted hover:text-ds-text-primary transition-colors"
                >
                    ✕
                </button>
            </div>

            <div className="max-h-[70vh] sm:max-h-[390px] overflow-y-auto scrollbar-hide">
                {list.length === 0 ? (
                    <div className="p-10 text-center text-ds-text-muted italic text-[13px]">لا توجد إشعارات حالياً</div>
                ) : (
                    list.map(n => (
                        <div
                            key={n.id}
                            onClick={() => onMarkRead?.(n.id)}
                            className={`px-3.5 py-4 flex gap-3.5 items-start border-b border-ds-border last:border-b-0 cursor-pointer transition-colors ${n.read ? 'bg-white hover:bg-ds-border/5' : 'bg-ds-primary-light hover:bg-ds-primary/10'}`}
                        >
                            <span className="text-[24px] shrink-0">{n.icon}</span>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="font-bold text-[13px] text-ds-text-primary leading-tight">{n.title}</div>
                                    {n.read && <span className="text-[9px] text-ds-text-muted font-bold">مقروء</span>}
                                </div>
                                <div className="text-[11px] text-ds-text-secondary leading-relaxed">{n.msg}</div>
                                <div className="text-[10px] text-ds-text-muted mt-1.5">{n.time}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
