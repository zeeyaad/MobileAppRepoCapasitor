import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { Btn } from "../features/dashboard/DashboardComponents";
import { useToast } from "../Component/StaffPagesComponents/ui/use-toast";
import type { ExploreSport, TimeSlotOption } from "../features/dashboard/types";
import { useNavigate } from "react-router-dom";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80";

function getFullUrl(path?: string | null) {
    if (!path || path === "null") return null;
    const cleanPath = path.trim();
    if (cleanPath.startsWith("http") || cleanPath.startsWith("data:")) return cleanPath;
    const normalizedPath = cleanPath.replace(/\\/g, "/");
    const finalPath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
    return `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}${finalPath}`;
}

const pickPositiveAmount = (...values: Array<number | string | null | undefined>): number => {
    for (const value of values) {
        const parsed = Number(value);
        if (Number.isFinite(parsed) && parsed > 0) {
            return parsed;
        }
    }
    return 0;
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

interface MemberSubscriptionApi {
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
    price?: number | string;
    field?: {
        name_ar?: string;
        name_en?: string;
    };
}

interface TeamApi {
    id: string;
    name_ar?: string;
    name_en?: string;
    subscription_price?: number | string;
    max_participants?: number;
}

interface SportApi {
    id: number;
    name_ar?: string;
    name_en?: string;
    sport_image?: string | null;
    price?: number | string;
    training_fee?: number | string;
    training_schedules?: SportScheduleApi[];
    teams?: TeamApi[];
}

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

export default function MemberSubscribePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [sports, setSports] = useState<ExploreSport[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [joining, setJoining] = useState(false);

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

            navigate(`/member/payment?${params.toString()}`);
        },
        [navigate]
    );

    const loadSports = useCallback(async () => {
        try {
            setLoading(true);
            
            // Try the new endpoint first, fallback to old one
            let response;
            try {
                response = await api.get("/sports/public");
            } catch {
                console.log("Trying fallback endpoint...");
                response = await api.get("/public/sports");
            }
            
            const data = response.data.data || response.data;

            if (!Array.isArray(data)) {
                setSports([]);
                return;
            }

            const subscriptionMap: Record<string, SubscriptionLookup> = {};
            if (user?.member_id) {
                try {
                    const subRes = await api.get(`/member-subscriptions/${user.member_id}/subscriptions`);
                    const rawSubscriptions =
                        (Array.isArray(subRes.data?.data?.subscriptions) && subRes.data.data.subscriptions) ||
                        (Array.isArray(subRes.data?.data) && subRes.data.data) ||
                        (Array.isArray(subRes.data?.subscriptions) && subRes.data.subscriptions) ||
                        [];

                    rawSubscriptions.forEach((rawSub: unknown) => {
                        const sub = rawSub as MemberSubscriptionApi;
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
                    console.warn("Failed to load member subscriptions", error);
                }
            }

            const mapped: ExploreSport[] = data.map((rawSport) => {
                const sportFromApi = rawSport as SportApi;
                const schedules = Array.isArray(sportFromApi.training_schedules) ? sportFromApi.training_schedules : [];
                const teams = Array.isArray(sportFromApi.teams) ? sportFromApi.teams : [];

                const sportPrice = pickPositiveAmount(
                    sportFromApi.price,
                    sportFromApi.training_fee,
                    ...teams.map(t => t.subscription_price)
                );

                const slots: TimeSlotOption[] = schedules.length > 0
                    ? schedules.map((schedule) => ({
                        id: schedule.id,
                        teamId: schedule.team_id,
                        time: `${(schedule.start_time || "").slice(0, 5)} - ${(schedule.end_time || "").slice(0, 5)}`,
                        days: schedule.days_ar || schedule.days_en || "-",
                        court: schedule.field?.name_ar || schedule.field?.name_en || "ملعب خارجي",
                        price: pickPositiveAmount(schedule.training_fee, schedule.price, sportPrice),
                        spots: 10,
                    }))
                    : [];

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

                return {
                    id: sportFromApi.id,
                    memberId: user?.member_id,
                    name: sportFromApi.name_ar || sportFromApi.name_en || "رياضة غير مسمى",
                    nameEn: sportFromApi.name_en || "",
                    icon: getIconForSport(sportFromApi.name_ar || sportFromApi.name_en || ""),
                    img:
                        getFullUrl(sportFromApi.sport_image) ||
                        FALLBACK_IMAGES[sportFromApi.name_ar || ""] ||
                        FALLBACK_IMAGES[sportFromApi.name_en || ""] ||
                        DEFAULT_IMAGE,
                    slots,
                    defaultPrice: sportPrice,
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
            if (mapped.length > 0) {
                setSelectedSportId(mapped[0].id);
            }
        } catch (error) {
            console.error("Failed to load sports from backend:", error);
            toast({ title: "خطأ", description: "فشل في تحميل الرياضات من الخادم", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [isPendingPaymentSubscription, toast, user?.member_id]);

    useEffect(() => {
        loadSports();
    }, [loadSports]);

    const selectedSport = sports.find(s => s.id === selectedSportId);
    
    useEffect(() => {
        if (selectedSport) {
            setSelectedSlotId(selectedSport.joinedSlotId ?? selectedSport.pendingPayment?.slotId ?? null);
        }
    }, [selectedSport]);

    const handleJoin = async () => {
        if (!selectedSport) return;
        
        const joined = selectedSport.joined;
        if (joined) return;

        const pendingPayment = selectedSport.pendingPayment ?? null;
        const hasPendingPayment = !!pendingPayment;

        const selectedSlot = selectedSport.slots.find((s) => s.id === selectedSlotId) ?? null;
        const pendingSlot = pendingPayment?.slotId
            ? selectedSport.slots.find((s) => s.id === pendingPayment.slotId) ?? null
            : null;
        const actionSlot = selectedSlot ?? pendingSlot;

        if (hasPendingPayment) {
            if (!actionSlot) return;
            const isChangingSlot = selectedSlot && selectedSlot.id !== pendingPayment.slotId;
            if (isChangingSlot && selectedSlot && selectedSlot.teamId) {
                setJoining(true);
                try {
                    try {
                        await api.patch(`/member-subscriptions/${pendingPayment.subscriptionId}/cancel`);
                    } catch {}
                    const response = await api.post("/member-subscriptions/subscribe", {
                        team_id: selectedSlot.teamId,
                        member_id: selectedSport.memberId,
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
                    goToPaymentPage({
                        sportName: selectedSport.name,
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
                goToPaymentPage({
                    sportName: selectedSport.name,
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
            const response = await api.post("/member-subscriptions/subscribe", {
                team_id: selectedSlot.teamId,
                member_id: selectedSport.memberId,
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
                throw new Error("Subscription ID is missing. Cannot open payment page.");
            }

            goToPaymentPage({
                sportName: selectedSport.name,
                slot: selectedSlot,
                subscriptionId: nextPayment.subscriptionId,
                paymentReference: nextPayment.paymentReference,
                amount: nextPayment.amount,
                currency: nextPayment.currency,
            });
        } catch (error) {
            console.error("Failed to join sport:", error);
            
            // Check for duplicate subscription error (usually 409 or specific error message)
            const axiosError = error as { response?: { data?: { message?: string }; status?: number } };
            const errorMessage = axiosError?.response?.data?.message || "";
            if (errorMessage.includes("already subscribed") || axiosError?.response?.status === 409) {
                toast({ title: "تنبيه", description: "أنت مشترك بالفعل في هذا الفريق", variant: "default" });
                loadSports(); // Reload to get actual joined status
            } else {
                toast({ title: "خطأ", description: "فشل في الانضمام للرياضة", variant: "destructive" });
            }
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4 h-[calc(100vh-120px)]">
                <div className="w-12 h-12 border-4 border-ds-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-ds-text-secondary font-bold">جارٍ تحميل الرياضات...</p>
            </div>
        );
    }

    const actionSlot = selectedSport?.slots.find((s) => s.id === selectedSlotId) ?? null;
    const joinedStatus = String(selectedSport?.joinedStatus || "").toLowerCase();
    const isPendingReview = joinedStatus === "pending" || joinedStatus === "pending_admin_approval";

    return (
        <div className="animate-fade-up h-[calc(100vh-140px)] flex flex-col mt-4 pl-6 pr-2 mb-6" dir="rtl">
            <div className="mb-5 flex-shrink-0 flex items-center gap-2">
                <span className="text-ds-primary text-[32px]">🏅</span>
                <h1 className="text-[24px] font-black text-ds-primary tracking-tight">اشترك في رياضة جديدة</h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[500px]">
                {/* Right side: Sports List */}
                <div className="w-full lg:w-[380px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col flex-shrink-0">
                    <div className="p-5 border-b border-gray-100 bg-gradient-to-l from-gray-50/80 to-transparent rounded-t-2xl">
                        <h2 className="text-[17px] font-extrabold text-ds-primary">الرياضات المتاحة</h2>
                        <p className="text-[12px] text-ds-text-secondary mt-1">اختر رياضة لعرض فرقها ومواعيد تدريبها</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar bg-white rounded-b-2xl">
                        {sports.map(sport => {
                            const isSelected = sport.id === selectedSportId;
                            
                            return (
                                <div 
                                    key={sport.id}
                                    onClick={() => setSelectedSportId(sport.id)}
                                    className={`relative overflow-hidden flex items-center justify-between p-3.5 cursor-pointer rounded-xl transition-all duration-300 ${
                                        isSelected 
                                        ? "bg-ds-primary shadow-md transform scale-[0.98] mr-2" 
                                        : "bg-transparent hover:bg-gray-50 border border-transparent hover:border-gray-100"
                                    }`}
                                >
                                    {isSelected && <div className="absolute inset-0 bg-gradient-to-r from-ds-primary to-ds-primary-dark opacity-100 z-0"></div>}
                                    
                                    <div className="flex items-center gap-4 w-full relative z-10">
                                        <div className="text-right flex-1">
                                            <h3 className={`font-bold text-[14px] transition-colors ${isSelected ? "text-white" : "text-ds-text-primary"}`}>{sport.name}</h3>
                                            <p className={`text-[11px] mt-0.5 transition-colors ${isSelected ? "text-white/80" : "text-ds-text-secondary"}`}>{sport.nameEn || "Sport"}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {sports.length === 0 && (
                            <div className="p-8 text-center text-ds-text-muted text-sm italic">
                                لا توجد رياضات متاحة
                            </div>
                        )}
                    </div>
                </div>

                {/* Left side: Sport Details Widget */}
                <div className="flex-1 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col min-h-0 relative overflow-hidden">
                    {selectedSport ? (
                        <>
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-ds-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            
                            <div className="p-7 border-b border-gray-100 bg-white/50 backdrop-blur-sm rounded-t-2xl flex justify-between items-start relative z-10">
                                <div className="text-right">
                                    <h2 className="text-[26px] font-black text-ds-primary tracking-tight">{selectedSport.name}</h2>
                                    <p className="text-[14px] text-ds-text-secondary mt-1">دوري {selectedSport.name} الداخلية</p>
                                </div>
                                <div className="text-gray-300 font-medium text-sm mt-1">
                                    {selectedSport.nameEn || "Basketball"}
                                </div>
                            </div>
                            
                            <div className="px-7 py-5">
                                <h3 className="text-[17px] font-bold text-ds-text-primary mb-1">الخطوة ١ — اختر الفريق</h3>
                                <p className="text-[13px] text-ds-text-secondary">كل فريق له مواعيد تدريب خاصة به</p>
                            </div>

                            <div className="flex-1 overflow-y-auto px-7 pb-6 space-y-3 custom-scrollbar relative z-10">
                                {selectedSport.slots.length > 0 ? (
                                    selectedSport.slots.map(slot => {
                                        const isSel = selectedSlotId === slot.id;
                                        const isFull = slot.spots === 0;
                                        const isJoinedSlot = selectedSport.joinedSlotId === slot.id && selectedSport.joined;
                                        
                                        return (
                                            <div
                                                key={slot.id}
                                                onClick={() => !isFull && !selectedSport.joined && setSelectedSlotId(slot.id)}
                                                className={`p-4 border-[1.5px] rounded-xl transition-all duration-200 group ${
                                                    isSel
                                                        ? "border-ds-primary bg-[#F0F7FF] shadow-[0_4px_12px_rgb(0,0,0,0.05)] transform scale-[1.01]"
                                                        : isJoinedSlot
                                                            ? "border-ds-success bg-ds-success/5"
                                                            : "border-gray-100 bg-white hover:border-ds-primary/30 hover:shadow-sm"
                                                } ${
                                                    isFull && !isJoinedSlot
                                                        ? "opacity-55 cursor-default group-hover:transform-none"
                                                        : selectedSport.joined
                                                            ? "cursor-default group-hover:transform-none"
                                                            : "cursor-pointer"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        {!selectedSport.joined && (
                                                            <div className={`w-[22px] h-[22px] rounded-full border-[2px] flex items-center justify-center transition-colors ${isSel ? "border-ds-primary bg-ds-primary" : "border-gray-300 group-hover:border-ds-primary/50"}`}>
                                                                {isSel && <div className="w-[8px] h-[8px] rounded-full bg-white" />}
                                                            </div>
                                                        )}
                                                        {isJoinedSlot && <span className="text-[18px]">✅</span>}
                                                        <span className={`font-extrabold text-[15px] transition-colors ${isSel ? "text-ds-primary" : isJoinedSlot ? "text-ds-success" : "text-gray-700"}`}>
                                                            ⏰ {slot.time}
                                                        </span>
                                                    </div>
                                                    <div className={`rounded-xl px-3.5 py-1.5 text-[13px] font-black transition-colors ${isSel ? "bg-ds-primary text-white" : isJoinedSlot ? "bg-ds-success text-white" : "bg-gray-50 text-gray-700 border border-gray-100"}`}>
                                                        <span className="text-[14px]">{slot.price.toLocaleString("ar-EG")}</span> ج.م
                                                    </div>
                                                </div>
                                                <div className={`flex gap-5 text-[13px] text-gray-500 ${selectedSport.joined ? "" : "pr-9"}`}>
                                                    <span className="flex items-center gap-1.5"><span className="text-[15px] grayscale opacity-70">📍</span> {slot.court}</span>
                                                    <span className="flex items-center gap-1.5"><span className="text-[15px] grayscale opacity-70">📅</span> {slot.days}</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-12 px-6 flex flex-col items-center justify-center text-center text-ds-text-muted text-sm italic border-[1.5px] border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                                        <span className="text-3xl mb-3 opacity-30 grayscale">🏀</span>
                                        <p>لا توجد فرق متاحة لهذه الرياضة حالياً</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-white rounded-b-2xl shadow-[0_-4px_20px_rgb(0,0,0,0.02)] relative z-10">
                                <div className="w-[190px]">
                                    <Btn
                                        onClick={handleJoin}
                                        disabled={selectedSport.joined || joining || (!selectedSport.pendingPayment && (!selectedSlotId || actionSlot?.spots === 0))}
                                        variant={selectedSport.joined ? "ghost" : selectedSport.pendingPayment ? "primary" : "primary"}
                                        fullWidth
                                        className="py-3.5 text-[14px] rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                                    >
                                        {joining
                                            ? "⏳ جاري..."
                                            : selectedSport.pendingPayment
                                                ? "💳 الدفع"
                                                : selectedSport.joined && isPendingReview
                                                    ? "⏳ قيد المراجعة"
                                                    : selectedSport.joined
                                                        ? "✓ مشترك"
                                                        : "تقديم طلب الاشتراك"}
                                    </Btn>
                                </div>
                                
                                <div className="flex flex-col items-end">
                                    <span className="text-[12px] text-ds-text-secondary mb-1 font-medium">قيمة الاشتراك</span>
                                    {actionSlot ? (
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-[13px] text-gray-400 font-bold">ج.م</span>
                                            <span className="text-[28px] font-black text-ds-primary tracking-tight">
                                                {actionSlot.price.toLocaleString("ar-EG")}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-[28px] font-black text-gray-300">
                                            -
                                        </span>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-ds-text-muted p-8">
                            <span className="text-5xl mb-5 opacity-40 grayscale">🏆</span>
                            <p className="font-medium text-[15px]">اختر رياضة من القائمة لعرض التفاصيل</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
