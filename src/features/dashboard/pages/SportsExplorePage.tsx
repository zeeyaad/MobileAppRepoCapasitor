import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { ExploreSport, TimeSlotOption, ToastType } from "../types";
import { Btn } from "../DashboardComponents";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import { localizeDays } from "../calendarUtils";

const FALLBACK_IMAGES: Record<string, string> = {
    "كرة القدم": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    Football: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    "كرة السلة": "https://images.unsplash.com/photo-1546519638405-a9d1b2f14e88?w=800&q=80",
    Basketball: "https://images.unsplash.com/photo-1546519638405-a9d1b2f14e88?w=800&q=80",
    "التنس": "https://images.unsplash.com/photo-1595435064212-36292241cf4f?w=800&q=80",
    Tennis: "https://images.unsplash.com/photo-1595435064212-36292241cf4f?w=800&q=80",
    "السباحة": "https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&q=80",
    Swim: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&q=80",
    "الكرة الطائرة": "https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&q=80",
    Volleyball: "https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&q=80",
    "جمباز": "https://images.unsplash.com/photo-1566932769119-7a1fb6d7691a?w=800&q=80",
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80";

const getFullUrl = (path: string | null) => {
    if (!path || path === "null") return null;
    const cleanPath = path.trim();
    if (cleanPath.startsWith("http") || cleanPath.startsWith("data:")) return cleanPath;
    const normalizedPath = cleanPath.replace(/\\/g, "/");
    const finalPath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
    return `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}${finalPath}`;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
    const err = error as {
        message?: string;
        response?: { data?: { message?: string; error?: string } };
        original?: { response?: { data?: { message?: string; error?: string } } };
    };

    return (
        err?.original?.response?.data?.message ||
        err?.original?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        fallback
    );
};

const pickPositiveAmount = (...values: Array<number | string | null | undefined>): number => {
    for (const value of values) {
        const parsed = Number(value);
        if (Number.isFinite(parsed) && parsed > 0) {
            return parsed;
        }
    }
    return 0;
};

const getLocalizedFieldName = (
    field: SportScheduleApi["field"] | undefined,
    isRtl: boolean,
    fallback: string
): string => {
    if (!field) return fallback;
    return isRtl
        ? field.name_ar || field.name_en || fallback
        : field.name_en || field.name_ar || fallback;
};

interface SubscriptionLookup {
    subscriptionId: number;
    teamId: string;
    status: string;
    subscriptionStatus: string;
    paymentReference: string | null;
    paymentCompletedAt: string | null;
    price: number;
}

interface TeamMemberSubscriptionApi {
    id?: number | string;
    subscription_id?: number | string;
    team_id?: string;
    status?: string;
    subscription_status?: string;
    payment_reference?: string | null;
    payment_completed_at?: string | null;
    price?: number | string;
}

interface SportScheduleApi {
    id: string;
    team_id: string;
    start_time?: string;
    end_time?: string;
    days_ar?: string;
    days_en?: string;
    training_fee?: number | string;
    field?: {
        name_en?: string;
        name_ar?: string;
    };
}

interface SportApi {
    id: number;
    name_ar?: string;
    name_en?: string;
    sport_image?: string | null;
    price?: number | string;
    training_schedules?: SportScheduleApi[];
}

interface SportCardProps {
    sport: ExploreSport;
    onStartPayment: (args: {
        sportName: string;
        slot: TimeSlotOption;
        subscriptionId: number;
        paymentReference: string;
        amount: number;
        currency: string;
    }) => void;
}

const SportCard: React.FC<SportCardProps> = React.memo(({ sport, onStartPayment }) => {
    const { t, i18n } = useTranslation("team");
    const isRtl = i18n.resolvedLanguage?.startsWith('ar') || i18n.language.startsWith('ar');
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(
        sport.joinedSlotId ?? sport.pendingPayment?.slotId ?? null
    );
    const [joining, setJoining] = useState(false);
    const joined = sport.joined;
    const joinedStatus = sport.joinedStatus;
    const pendingPayment = sport.pendingPayment ?? null;

    const selectedSlot = sport.slots.find((s) => s.id === selectedSlotId) ?? null;
    const pendingSlot = pendingPayment?.slotId
        ? sport.slots.find((s) => s.id === pendingPayment.slotId) ?? null
        : null;
    const actionSlot = selectedSlot ?? pendingSlot;
    const hasPendingPayment = !!pendingPayment;
    const normalizedJoinedStatus = String(joinedStatus || "").toLowerCase();
    const isPendingReview =
        normalizedJoinedStatus === "pending" || normalizedJoinedStatus === "pending_admin_approval";

    const isExpired = sport.endDate ? new Date(sport.endDate).getTime() < new Date().getTime() : false;
    const canRejoin = joined && isExpired;

    const handleJoin = async () => {
        if (joined && !canRejoin) {
            alert(t("explore_sports.alerts.already_active"));
            return;
        }

        if (hasPendingPayment) {
            if (!actionSlot) return;
            const isChangingSlot = selectedSlot && selectedSlot.id !== pendingPayment.slotId;
            if (isChangingSlot && selectedSlot && selectedSlot.teamId) {
                setJoining(true);
                try {
                    try {
                        await api.patch(`/team-member-subscriptions/${pendingPayment.subscriptionId}/cancel`);
                    } catch {
                        try {
                            await api.patch(`/team-members/subscriptions/${pendingPayment.subscriptionId}/cancel`);
                        } catch { /* ignore */ }
                    }
                    const response = await api.post("/team-member-subscriptions/subscribe", {
                        team_id: selectedSlot.teamId,
                        team_member_id: sport.memberId,
                    });
                    const payload = response?.data || {};
                    const subscriptionData = payload.data || {};
                    const paymentData = payload.payment || {};
                    const nextPayment = {
                        subscriptionId: Number(subscriptionData.id || subscriptionData.subscription_id),
                        paymentReference: String(paymentData.reference || subscriptionData.payment_reference || ""),
                        amount: pickPositiveAmount(paymentData.amount, subscriptionData.price, selectedSlot.price),
                        currency: String(paymentData.currency || "EGP"),
                        slotId: selectedSlot.id,
                    };
                    if (!nextPayment.subscriptionId) {
                        return;
                    }
                    onStartPayment({
                        sportName: sport.name,
                        slot: selectedSlot,
                        subscriptionId: nextPayment.subscriptionId,
                        paymentReference: nextPayment.paymentReference,
                        amount: nextPayment.amount,
                        currency: nextPayment.currency,
                    });
                } finally {
                    setJoining(false);
                }
            } else {
                onStartPayment({
                    sportName: sport.name,
                    slot: actionSlot,
                    subscriptionId: pendingPayment.subscriptionId,
                    paymentReference: pendingPayment.paymentReference || "",
                    amount: pickPositiveAmount(pendingPayment.amount, actionSlot.price),
                    currency: pendingPayment.currency,
                });
            }
            return;
        }

        if (!selectedSlot || !selectedSlot.teamId) return;

        setJoining(true);
        try {
            const response = await api.post("/team-member-subscriptions/subscribe", {
                team_id: selectedSlot.teamId,
                team_member_id: sport.memberId,
            });

            const payload = response?.data || {};
            const subscriptionData = payload.data || {};
            const paymentData = payload.payment || {};
            const nextPayment = {
                subscriptionId: Number(subscriptionData.id || subscriptionData.subscription_id),
                paymentReference: String(paymentData.reference || subscriptionData.payment_reference || ""),
                amount: pickPositiveAmount(paymentData.amount, subscriptionData.price, selectedSlot.price),
                currency: String(paymentData.currency || "EGP"),
                slotId: selectedSlot.id,
            };

            if (!nextPayment.subscriptionId && sport.memberId && selectedSlot.teamId) {
                try {
                    const subRes = await api.get(`/team-member-subscriptions/${sport.memberId}/subscriptions`);
                    const rawSubscriptions =
                        (Array.isArray(subRes.data?.data?.subscriptions) && subRes.data.data.subscriptions) ||
                        (Array.isArray(subRes.data?.data) && subRes.data.data) ||
                        (Array.isArray(subRes.data?.subscriptions) && subRes.data.subscriptions) ||
                        [];

                    const fallbackSub = rawSubscriptions.find((raw: unknown) => {
                        const sub = raw as TeamMemberSubscriptionApi;
                        const sameTeam = String(sub?.team_id || "") === String(selectedSlot.teamId || "");
                        const subStatus = String(sub?.status || "").toLowerCase();
                        return sameTeam && subStatus !== "declined" && subStatus !== "cancelled";
                    }) as TeamMemberSubscriptionApi | undefined;

                    if (fallbackSub) {
                        nextPayment.subscriptionId = Number(fallbackSub.subscription_id || fallbackSub.id || 0);
                        nextPayment.paymentReference = String(fallbackSub.payment_reference || nextPayment.paymentReference || "");
                        nextPayment.amount = pickPositiveAmount(fallbackSub.price, nextPayment.amount, selectedSlot.price);
                    }
                } catch {
                    // keep current values and fail below if subscription id is still missing
                }
            }

            if (!nextPayment.subscriptionId) {
                throw new Error("Subscription ID is missing. Cannot open payment page.");
            }

            onStartPayment({
                sportName: sport.name,
                slot: selectedSlot,
                subscriptionId: nextPayment.subscriptionId,
                paymentReference: nextPayment.paymentReference,
                amount: nextPayment.amount,
                currency: nextPayment.currency,
            });
            return;
        } catch (error) {
            console.error("Failed to join sport:", error);
            alert(getErrorMessage(error, t("sports.validation.join_failed")));
        } finally {
            setJoining(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-ds-card overflow-hidden transition-all duration-200 hover:translate-y-[-2px] hover:shadow-ds-hover border border-ds-border">
            <div className="h-[185px] relative overflow-hidden">
                <img
                    src={sport.img || DEFAULT_IMAGE}
                    alt={sport.name}
                    width="340"
                    height="185"
                    className="w-full h-full object-cover block"
                    loading="lazy"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== DEFAULT_IMAGE) {
                            target.src = DEFAULT_IMAGE;
                        }
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1B2C]/72 to-transparent to-55%" />
                <div className={`absolute bottom-3.5 ${isRtl ? 'right-4' : 'left-4'} text-white flex items-center gap-2`}>
                    <span className="text-[26px]">{sport.icon || "🏆"}</span>
                    <span className="text-[17px] font-extrabold">{sport.name}</span>
                </div>

                {(joined || hasPendingPayment) && (
                    <div
                        className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} rounded-full px-3.5 py-1 text-[11px] font-bold text-white ${hasPendingPayment
                            ? "bg-ds-orange"
                            : isPendingReview
                                ? "bg-ds-primary animate-pulse"
                                : "bg-ds-success"
                            }`}
                    >
                        {hasPendingPayment ? t("explore_sports.status.payment_required") : isPendingReview ? t("explore_sports.status.pending_review") : t("explore_sports.status.joined")}
                    </div>
                )}
            </div>

            <div className="p-[10px_10px_14px]">
                {/* ── Time Slots — always visible with radio buttons ── */}
                <div className={[
                    "mt-1 mb-3",
                    sport.slots.length > 2 ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-2"
                ].join(" ")}>
                    {sport.slots.length > 0 ? (
                        sport.slots.map((slot) => {
                            const isSel = selectedSlotId === slot.id;
                            const isFull = slot.spots === 0;
                            const isJoinedSlot = sport.joinedSlotId === slot.id && joined;
                            const isClickable = !isFull && !joined;
                            const isGrid = sport.slots.length > 2;

                            return (
                                    <div
                                        key={slot.id}
                                        dir={isRtl ? 'rtl' : 'ltr'}
                                        onClick={() => isClickable && setSelectedSlotId(slot.id)}
                                        className={[
                                            "relative rounded-xl border-2 transition-all duration-200 flex flex-col",
                                            isGrid ? "p-2.5" : "p-3",
                                            isClickable ? "cursor-pointer" : "cursor-default",
                                            isSel
                                                ? "border-ds-primary bg-ds-primary-light shadow-sm"
                                                : isJoinedSlot
                                                    ? "border-green-400 bg-green-50"
                                                    : isFull
                                                        ? "border-gray-200 bg-gray-50 opacity-60"
                                                        : "border-gray-200 bg-white hover:border-ds-primary/40 hover:bg-blue-50/30",
                                        ].join(" ")}
                                    >
                                        {/* Row 1: Days + Location */}
                                        <div className={`flex flex-col gap-y-0.5 ${isGrid ? 'text-[10px] mb-1' : 'text-[11px] mb-2'} text-gray-500 font-medium ${isRtl ? 'text-right' : 'text-left'}`}>
                                            <span className="flex items-center gap-1 shrink-0">📅 <span className="truncate">{localizeDays(slot.days, isRtl, t)}</span></span>
                                            <span className="flex items-center gap-1 shrink-0">📍 <span className="truncate">{slot.court}</span></span>
                                        </div>

                                        {/* Row 2: Radio + Time + Price */}
                                        <div className={`flex flex-col gap-y-1.5 ${isGrid ? 'mt-auto pt-1' : 'mt-auto pt-1'}`}>
                                            <div className={`flex items-center justify-between w-full gap-x-1 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                                                <div className={`flex items-center gap-1.5 min-w-0 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                                                    {/* Radio button */}
                                                    {!joined && !hasPendingPayment ? (
                                                        <div
                                                            className={[
                                                                "rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all",
                                                                isGrid ? "w-3.5 h-3.5" : "w-4 h-4",
                                                                isSel ? "border-ds-primary bg-ds-primary" : isFull ? "border-gray-300 bg-gray-100" : "border-gray-400 bg-white",
                                                            ].join(" ")}
                                                        >
                                                            {isSel && <div className={isGrid ? "w-1 h-1 rounded-full bg-white" : "w-1.5 h-1.5 rounded-full bg-white"} />}
                                                        </div>
                                                    ) : isJoinedSlot ? (
                                                        <span className={isGrid ? "text-[12px] shrink-0" : "text-[14px] shrink-0"}>✅</span>
                                                    ) : null}

                                                    {/* Time */}
                                                    <span className={`font-bold whitespace-nowrap overflow-hidden ${isGrid ? 'text-[10.5px]' : 'text-[12px]'} ${isSel ? "text-ds-primary" : isJoinedSlot ? "text-green-700" : "text-ds-text-primary"}`}>
                                                        ⏰ {slot.time}
                                                    </span>
                                                </div>

                                                {/* Price badge */}
                                                <span
                                                    className={[
                                                        "rounded-full font-black shrink-0 whitespace-nowrap",
                                                        isGrid ? "px-1.5 py-0.5 text-[9.5px]" : "px-2 py-0.5 text-[11px]",
                                                        isSel ? "bg-ds-primary text-white" : isJoinedSlot ? "bg-green-500 text-white" : "bg-amber-100 text-amber-600",
                                                    ].join(" ")}
                                                >
                                                    {slot.price.toLocaleString(isRtl ? "ar-EG" : "en-US")} {t("sports.currency")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                        })
                    ) : (
                        <div className="text-center text-ds-text-muted text-xs italic py-4 bg-gray-50 rounded-xl border border-gray-100">
                            {t("explore_sports.slots.no_slots")}
                        </div>
                    )}
                </div>

                <div
                    className={`flex justify-between items-center bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mt-2 mb-2.5 min-h-[52px] ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}
                >
                    <span className={`text-[13px] text-gray-500 flex items-center gap-1.5 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}><span>💰</span><span>{t("explore_sports.slots.monthly_cost")}</span></span>
                    {actionSlot ? (
                        <div className={`flex items-baseline gap-1 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                            <span className="text-[28px] font-black text-amber-500">
                                {actionSlot.price.toLocaleString(isRtl ? "ar-EG" : "en-US")}
                            </span>
                            <span className="text-[11px] text-gray-400 font-medium">{t("sports.currency")} / {t("calendar_utils.time.month") || "شهر"}</span>
                        </div>
                    ) : (
                        <span className="text-[13px] text-ds-text-muted">{t("explore_sports.slots.select_time")}</span>
                    )}
                </div>

                {joined ? (
                    canRejoin ? (
                        <button
                            onClick={handleJoin}
                            disabled={joining || !selectedSlot || selectedSlot.spots === 0}
                            className={`w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-l from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}
                        >
                            {joining ? t("explore_sports.actions.sending") : <><span>{t("explore_sports.actions.rejoin")}</span><span>🏅</span></>}
                        </button>
                    ) : (
                        <button
                            disabled
                            className={`w-full py-3 rounded-xl text-sm font-bold bg-green-100 text-green-700 border border-green-200 flex items-center justify-center gap-2 cursor-default ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}
                        >
                            {isPendingReview ? t("explore_sports.status.pending_review") : <><span>✓</span><span>{t("explore_sports.actions.already_joined")}</span></>}
                        </button>
                    )
                ) : hasPendingPayment ? (
                    <button
                        onClick={handleJoin}
                        disabled={joining}
                        className="w-full py-3 rounded-xl text-sm font-bold text-white bg-ds-primary hover:opacity-90 active:scale-95 transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {joining ? t("explore_sports.actions.sending") : t("explore_sports.actions.go_to_payment")}
                    </button>
                ) : (
                    <button
                        onClick={handleJoin}
                        disabled={joining || !selectedSlot || selectedSlot.spots === 0}
                        className={`w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-l from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                        {joining ? t("explore_sports.actions.sending") : <><span>{t("explore_sports.actions.join_now")}</span><span>🏅</span></>}
                    </button>
                )}
            </div>
        </div>
    );
});

const SportsExplorePage: React.FC<{ showToast: (msg: string, t: ToastType) => void; onJoined?: () => void | Promise<void> }> = (props) => {
    const { showToast } = props;
    const { user } = useAuth();
    const { t, i18n } = useTranslation("team");
    const navigate = useNavigate();
    const [sports, setSports] = useState<ExploreSport[]>([]);
    const [loading, setLoading] = useState(true);

    const currentLang = i18n.resolvedLanguage || i18n.language;
    const isRtl = currentLang.startsWith('ar');

    const isPendingPaymentSubscription = useCallback((subscription?: SubscriptionLookup) => {
        if (!subscription) return false;

        const normalizedSubscriptionStatus = String(subscription.subscriptionStatus || "").toLowerCase();
        if (normalizedSubscriptionStatus === "pending_payment") {
            return true;
        }

        const normalizedStatus = String(subscription.status || "").toLowerCase();
        const hasPaymentReference = !!subscription.paymentReference;
        const isPaymentCompleted = !!subscription.paymentCompletedAt;

        return normalizedStatus === "pending" && hasPaymentReference && !isPaymentCompleted;
    }, []);

    const goToPaymentPage = useCallback(
        (args: {
            sportName: string;
            slot: TimeSlotOption;
            subscriptionId: number;
            paymentReference: string;
            amount: number;
            currency: string;
        }) => {
            const params = new URLSearchParams({
                subscriptionId: String(args.subscriptionId),
                paymentReference: args.paymentReference,
                amount: String(args.amount),
                currency: args.currency,
                sportName: args.sportName,
                slotTime: args.slot.time,
                slotDays: args.slot.days,
                court: args.slot.court,
                slotId: args.slot.id || "",
                teamId: args.slot.teamId || "",
            });

            navigate(`/team-member/payment?${params.toString()}`);
        },
        [navigate]
    );

    const getIconForSport = (name: string): string => {
        if (!name) return "🏆";
        const normalizedName = name.toLowerCase();
        if (normalizedName.includes("قدم") || normalizedName.includes("foot")) return "⚽";
        if (normalizedName.includes("سلة") || normalizedName.includes("basket")) return "🏀";
        if (normalizedName.includes("تنس") || normalizedName.includes("tennis")) return "🎾";
        if (normalizedName.includes("سباح") || normalizedName.includes("swim")) return "🏊";
        if (normalizedName.includes("طائرة") || normalizedName.includes("volley")) return "🏐";
        if (normalizedName.includes("جمباز") || normalizedName.includes("gym")) return "🤸";
        return "🏆";
    };

    const loadSports = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get("/sports?status=active&is_active=true");
            const data = response.data.data || response.data;

            if (!Array.isArray(data)) {
                setSports([]);
                return;
            }

            const subscriptionMap: Record<string, SubscriptionLookup> = {};
            if (user?.team_member_id) {
                try {
                    const subRes = await api.get(`/team-member-subscriptions/${user.team_member_id}/subscriptions`);
                    const rawSubscriptions =
                        (Array.isArray(subRes.data?.data?.subscriptions) && subRes.data.data.subscriptions) ||
                        (Array.isArray(subRes.data?.data) && subRes.data.data) ||
                        (Array.isArray(subRes.data?.subscriptions) && subRes.data.subscriptions) ||
                        [];

                    rawSubscriptions.forEach((rawSub: unknown) => {
                        const sub = rawSub as TeamMemberSubscriptionApi;
                        if (!sub?.team_id) return;
                        const paymentCompletedAt = sub.payment_completed_at ? String(sub.payment_completed_at) : null;
                        const effectiveStatus = paymentCompletedAt ? "active" : String(sub.status || "pending");
                        const effectiveSubscriptionStatus = paymentCompletedAt
                            ? "active"
                            : String(sub.subscription_status || "pending_admin_approval");
                        subscriptionMap[sub.team_id] = {
                            subscriptionId: Number(sub.subscription_id || sub.id),
                            teamId: String(sub.team_id),
                            status: effectiveStatus,
                            subscriptionStatus: effectiveSubscriptionStatus,
                            paymentReference: sub.payment_reference ? String(sub.payment_reference) : null,
                            paymentCompletedAt,
                            price: Number(sub.price || 0),
                        };
                    });
                } catch (error) {
                    console.warn("Failed to load team member subscriptions", error);
                }
            }

            const mapped: ExploreSport[] = data.map((rawSport) => {
                const sportFromApi = rawSport as SportApi & { teams?: any[] };
                const schedules = Array.isArray(sportFromApi.training_schedules) ? sportFromApi.training_schedules : [];
                const teams = Array.isArray(sportFromApi.teams) ? sportFromApi.teams : [];

                // Fallback price from sport or any team
                const sportPrice = pickPositiveAmount(
                    sportFromApi.price,
                    (sportFromApi as any).training_fee,
                    (sportFromApi as any).subscription_price,
                    (sportFromApi as any).monthly_fee,
                    ...teams.map(t => t.subscription_price),
                    ...teams.map(t => t.training_fee),
                    ...teams.map(t => t.monthly_fee)
                );

                const slots: TimeSlotOption[] = schedules.length > 0
                    ? schedules.map((schedule) => ({
                        id: schedule.id,
                        teamId: schedule.team_id,
                        time: `${(schedule.start_time || "").slice(0, 5)} - ${(schedule.end_time || "").slice(0, 5)}`,
                        days: schedule.days_ar || schedule.days_en || "-",
                        court: getLocalizedFieldName(schedule.field, isRtl, t("explore_sports.slots.outdoor_court")),
                        price: pickPositiveAmount(schedule.training_fee, (schedule as any).price, sportPrice),
                        spots: 10,
                    }))
                    : [
                        {
                            id: `default-${sportFromApi.id}`,
                            teamId: null,
                            time: t("explore_sports.slots.unknown_time"),
                            days: "-",
                            court: "-",
                            price: sportPrice,
                            spots: 0,
                        },
                    ];

                const joinedSlot = slots.find((slot) => {
                    if (!slot.teamId) return false;
                    const subscription = subscriptionMap[slot.teamId];
                    if (!subscription) return false;
                    const status = subscription.status.toLowerCase();
                    return !isPendingPaymentSubscription(subscription) && status !== "declined" && status !== "cancelled";
                });

                const pendingPaymentSlot = slots.find((slot) => {
                    if (!slot.teamId) return false;
                    const subscription = subscriptionMap[slot.teamId];
                    return isPendingPaymentSubscription(subscription);
                });

                const pendingSubscription = pendingPaymentSlot?.teamId
                    ? subscriptionMap[pendingPaymentSlot.teamId]
                    : undefined;
                const joinedSubscription = joinedSlot?.teamId ? subscriptionMap[joinedSlot.teamId] : undefined;

                const nameAr = sportFromApi.name_ar || "";
                const nameEn = sportFromApi.name_en || "";
                const mainName = isRtl ? (nameAr || nameEn) : (nameEn || nameAr);
                const finalName = mainName || t("sports.unknown_sport");

                return {
                    id: sportFromApi.id,
                    memberId: user?.team_member_id,
                    name: finalName,
                    icon: getIconForSport(finalName),
                    img:
                        getFullUrl(sportFromApi.sport_image || (sportFromApi as any).sportImage) ||
                        FALLBACK_IMAGES[nameAr] ||
                        FALLBACK_IMAGES[nameEn] ||
                        (getIconForSport(finalName) === "⚽" ? FALLBACK_IMAGES["كرة القدم"] :
                            getIconForSport(finalName) === "🏀" ? FALLBACK_IMAGES["كرة السلة"] :
                                getIconForSport(finalName) === "🎾" ? FALLBACK_IMAGES["التنس"] :
                                    getIconForSport(finalName) === "🏊" ? FALLBACK_IMAGES["السباحة"] :
                                        getIconForSport(finalName) === "🏐" ? FALLBACK_IMAGES["الكرة الطائرة"] :
                                            getIconForSport(finalName) === "🤸" ? FALLBACK_IMAGES["جمباز"] :
                                                DEFAULT_IMAGE),
                    slots,
                    joined: !!joinedSlot,
                    joinedSlotId: joinedSlot?.id,
                    joinedStatus: joinedSubscription?.subscriptionStatus || joinedSubscription?.status,
                    pendingPayment:
                        pendingSubscription?.subscriptionId
                            ? {
                                subscriptionId: pendingSubscription.subscriptionId,
                                paymentReference: pendingSubscription.paymentReference || "",
                                amount: pickPositiveAmount(
                                    pendingSubscription.price,
                                    pendingPaymentSlot?.price,
                                    sportFromApi.price
                                ),
                                currency: "EGP",
                                slotId: pendingPaymentSlot?.id,
                            }
                            : undefined,
                };
            });

            setSports(mapped);
        } catch (error) {
            console.error("Failed to load sports from backend:", error);
            showToast(t("explore_sports.alerts.load_failed"), "error");
        } finally {
            setLoading(false);
        }
    }, [isPendingPaymentSubscription, showToast, user?.team_member_id, t]);

    useEffect(() => {
        loadSports();
    }, [loadSports]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-12 h-12 border-4 border-ds-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-ds-text-secondary font-bold">{t("explore_sports.loading")}</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-up" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className={`mb-6 sm:mb-8 ${isRtl ? 'text-right' : 'text-left'}`}>
                <h1 className="text-[24px] sm:text-[32px] font-black text-ds-text-primary tracking-tight">{t("explore_sports.title")}</h1>
                <p className="text-ds-text-secondary mt-2 text-sm sm:text-[16px] font-medium opacity-80">{t("explore_sports.subtitle")}</p>
            </div>

            {sports.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 sm:p-12 md:p-16 text-center shadow-ds-card border border-ds-border">
                    <p className="text-ds-text-muted text-lg italic">{t("explore_sports.no_sports")}</p>
                    <Btn onClick={loadSports} variant="primary">
                        {t("explore_sports.refresh")}
                    </Btn>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 sm:gap-6">
                    {sports.map((s, i) => (
                        <div key={s.id} className="animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                            <SportCard
                                sport={s}
                                onStartPayment={(paymentArgs) => {
                                    goToPaymentPage(paymentArgs);
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SportsExplorePage;
