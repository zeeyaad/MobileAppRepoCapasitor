import React from "react";
import { useTranslation } from "react-i18next";

// ─── Props Interface ────────────────────────────────────────────────────────
export interface SportCardProps {
    /** Arabic display title of the sport */
    title: string;
    /** URL of the sport cover image */
    image: string;
    /** Training days, e.g. "السبت - الثلاثاء - الخميس" */
    days: string;
    /** Training time range, e.g. "11:00 - 13:00" */
    time: string;
    /** Court / location name */
    location: string;
    /** Monthly price in EGP */
    price: number;
    /** Whether the user has already joined this sport */
    joined?: boolean;
    /** Optional click handler for the join button */
    onJoin?: () => void;
    /** Current status label, e.g. "نشط", "قيد الانتظار", "منتهي" */
    status?: string;
    /** Subscription end date ISO string, e.g. "2026-03-10" */
    endDate?: string;
    /** Callback when user clicks the Rejoin button */
    onRejoin?: () => void;
}

// ─── Helper: Is today on or past the end date? ──────────────────────────────
const isExpiredOrToday = (endDate?: string): boolean => {
    if (!endDate || endDate === "-") return false;
    const end = new Date(endDate);
    if (isNaN(end.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return today >= end;
};

// ─── Helper: Days remaining until end date ──────────────────────────────────
const daysUntilExpiry = (endDate?: string): number | null => {
    if (!endDate || endDate === "-") return null;
    const end = new Date(endDate);
    if (isNaN(end.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
};

// ─── SportCard Component ────────────────────────────────────────────────────
const SportCard: React.FC<SportCardProps> = ({
    title,
    image,
    days,
    time,
    location,
    price,
    joined = false,
    onJoin,
    status = "نشط",
    endDate,
    onRejoin,
}) => {
    const { t, i18n } = useTranslation("team");
    const isRtl = i18n.resolvedLanguage?.startsWith('ar') || i18n.language.startsWith('ar');
    const expiredOrToday = isExpiredOrToday(endDate);
    const daysLeft = daysUntilExpiry(endDate);
    const expiresVerySOon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;

    return (
        <div
            dir={isRtl ? "rtl" : "ltr"}
            className="
                w-full bg-white rounded-2xl shadow-md overflow-hidden
                transition-all duration-300 ease-out
                hover:-translate-y-1 hover:shadow-xl
                border border-gray-100
            "
        >
            {/* ── Image Section ── */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    loading="lazy"
                    decoding="async"
                    width={800}
                    height={384}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80";
                    }}
                />

                {/* Gradient overlay: bottom → top */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Sport title + trophy — bottom-right */}
                <div className={`absolute bottom-3 ${isRtl ? 'right-4' : 'left-4'} flex items-center gap-2`}>
                    <span className="text-2xl">🏆</span>
                    <span className="text-white text-lg font-extrabold drop-shadow-md leading-tight">
                        {title}
                    </span>
                </div>

                {/* JOINED / Expiry badge — top-left */}
                {(joined || status === "نشط" || status === "active") && (
                    <span
                        className={`
                            absolute top-3 ${isRtl ? 'left-3' : 'right-3'}
                            text-white text-xs font-bold
                            px-3 py-1 rounded-full shadow-md
                            flex items-center gap-1
                            ${expiredOrToday ? "bg-orange-500" : expiresVerySOon ? "bg-yellow-500" : "bg-green-500"}
                        `}
                    >
                        {expiredOrToday 
                            ? `⏰ ${t("sport_card.status.expired_today")}` 
                            : expiresVerySOon 
                                ? `⚠️ ${t("sport_card.status.expires_in", { days: daysLeft })}` 
                                : `✓ ${t("explore_sports.status.joined")}`}
                    </span>
                )}
            </div>

            {/* ── Card Body ── */}
            <div className="p-5 space-y-4">

                {/* ── Expiry Warning Banner ── */}
                {expiresVerySOon && !expiredOrToday && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                        <span className="text-lg">⚠️</span>
                        <p className={`text-xs font-semibold text-yellow-700 ${isRtl ? 'text-right' : 'text-left'}`}>
                            {daysLeft === 0 ? t("sport_card.alerts.expires_today") : t("sport_card.alerts.expires_soon", { days: daysLeft, unit: daysLeft === 1 ? t("notifications.time.day") : t("notifications.time.days") })}
                        </p>
                    </div>
                )}

                {expiredOrToday && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                        <span className="text-lg">🔔</span>
                        <p className={`text-xs font-semibold text-orange-700 ${isRtl ? 'text-right' : 'text-left'}`}>
                            {t("sport_card.alerts.expired")}
                        </p>
                    </div>
                )}

                {/* A) Training Schedule */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2.5">
                    <p className={`text-sm font-bold text-blue-700 flex items-center gap-1.5 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                        <span>🗓</span>
                        <span>{t("sport_card.schedule_title")}</span>
                    </p>

                    {/* Days */}
                    <div className={`flex items-center gap-2 text-sm text-gray-700 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                        <span className="text-base">📅</span>
                        <span className="font-medium">{days}</span>
                    </div>

                    {/* Time */}
                    <div className={`flex items-center gap-2 text-sm text-gray-700 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                        <span className="text-base">⏰</span>
                        <span className="font-medium">{time}</span>
                    </div>

                    {/* Location */}
                    <div className={`flex items-center gap-2 text-sm text-gray-700 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                        <span className="text-base">📍</span>
                        <span className="font-medium">{location}</span>
                    </div>
                </div>

                {/* B) End Date + Monthly Price row */}
                <div className="grid grid-cols-2 gap-2">
                    {/* End Date */}
                    <div className={`bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 flex flex-col gap-0.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                        <span className="text-[11px] text-gray-400 font-medium">{t("sport_card.expiry_date")}</span>
                        <span className={`text-sm font-bold ${expiredOrToday ? "text-orange-600" : expiresVerySOon ? "text-yellow-600" : "text-gray-700"}`}>
                            {endDate && endDate !== "-" ? new Date(endDate).toLocaleDateString(isRtl ? "ar-EG" : "en-US", { year: "numeric", month: "short", day: "numeric" }) : t("explore_sports.slots.unknown_time")}
                        </span>
                    </div>

                    {/* Monthly Price */}
                    <div className={`bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 flex flex-col gap-0.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                        <span className={`text-[11px] text-gray-400 font-medium flex items-center gap-1 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                            <span>💰</span>
                            <span>{t("explore_sports.slots.monthly_cost")}</span>
                        </span>
                        <div className={`flex items-baseline gap-1 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                            <span className="text-base font-black text-amber-500">
                                {price > 0 ? price.toLocaleString(isRtl ? "ar-EG" : "en-US") : "—"}
                            </span>
                            {price > 0 && <span className="text-[10px] text-gray-400 font-medium">{t("sports.currency")}</span>}
                        </div>
                    </div>
                </div>

                {/* C) Action Button based on Status */}
                {expiredOrToday ? (
                    <button
                        onClick={onRejoin}
                        className={`
                            w-full py-3 rounded-xl text-sm font-bold text-white
                            bg-gradient-to-l from-orange-400 to-red-400
                            hover:from-orange-500 hover:to-red-500
                            active:scale-95
                            transition-all duration-200
                            shadow-md hover:shadow-lg
                            flex items-center justify-center gap-2
                            ${isRtl ? 'flex-row' : 'flex-row-reverse'}
                        `}
                    >
                        <span>🔄</span>
                        <span>{t("explore_sports.actions.rejoin")}</span>
                    </button>
                ) : expiresVerySOon && (joined || status === "نشط" || status === "active") ? (
                    <button
                        onClick={onRejoin}
                        className={`
                            w-full py-3 rounded-xl text-sm font-bold text-white
                            bg-gradient-to-l from-yellow-500 to-amber-500
                            hover:from-yellow-600 hover:to-amber-600
                            active:scale-95
                            transition-all duration-200
                            shadow-md hover:shadow-lg
                            flex items-center justify-center gap-2
                            ${isRtl ? 'flex-row' : 'flex-row-reverse'}
                        `}
                    >
                        <span>🔄</span>
                        <span>{t("sport_card.actions.renew")}</span>
                    </button>
                ) : (status === "منتهي" || status === "expired") ? (
                    <button
                        disabled
                        className={`w-full py-3 rounded-xl text-sm font-bold bg-red-50 text-red-700 border border-red-100 flex items-center justify-center gap-2 cursor-default ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                        <span>❌</span>
                        <span>{t("sport_card.status.expired")}</span>
                    </button>
                ) : (status === "قيد الانتظار" || status === "pending") ? (
                    <button
                        disabled
                        className={`w-full py-3 rounded-xl text-sm font-bold bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center gap-2 cursor-default ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                        <span>⏳</span>
                        <span>{t("explore_sports.status.pending_review")}</span>
                    </button>
                ) : (joined || status === "نشط" || status === "active") ? (
                    <button
                        disabled
                        className={`w-full py-3 rounded-xl text-sm font-bold bg-green-50 text-green-700 border border-green-100 flex items-center justify-center gap-2 cursor-default ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                        <span>✓</span>
                        <span>{t("explore_sports.actions.already_joined")}</span>
                    </button>
                ) : (
                    <button
                        onClick={onJoin}
                        className={`
                            w-full py-3 rounded-xl text-sm font-bold text-white
                            bg-ds-primary hover:opacity-90 active:scale-95
                            transition-all duration-200
                            shadow-md hover:shadow-lg
                            flex items-center justify-center gap-2
                            ${isRtl ? 'flex-row' : 'flex-row-reverse'}
                        `}
                    >
                        <span>🏅</span>
                        <span>{t("explore_sports.actions.join_now")}</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default SportCard;
