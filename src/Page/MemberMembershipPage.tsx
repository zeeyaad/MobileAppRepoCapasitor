import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    CreditCard,
    RefreshCw,
    Tag,
} from "lucide-react";
import { Button } from "../Component/StaffPagesComponents/ui/button";
import { Badge } from "../Component/StaffPagesComponents/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../Component/StaffPagesComponents/ui/dialog";
import api from "../api/axios";

interface MembershipPlan {
    planName: string;
    planCode: string;
    membershipId: number | string;
    registrationDate: string;
    expiryDate: string;
    renewalFee: number;
    originalFee: number;
    status: string;
    totalDays: number;
    daysUsed: number;
    isInstallment: boolean;
    nextInstallmentAmount: number | null;
    nextInstallmentDate: string | null;
}

const currencyFmt = new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
});

const statusStyle = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "active") return "bg-green-100 text-green-700";
    if (s === "expired") return "bg-red-100 text-red-700";
    if (s === "pending") return "bg-amber-100 text-amber-700";
    return "bg-gray-100 text-gray-600";
};

const statusLabel = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "active") return "نشط";
    if (s === "expired") return "منتهي";
    if (s === "pending") return "قيد المراجعة";
    return status || "—";
};

function daysBetween(dateA: string, dateB: string): number {
    const a = new Date(dateA).getTime();
    const b = new Date(dateB).getTime();
    return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

export default function MemberMembershipPage() {
    const [plan, setPlan] = useState<MembershipPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [renewOpen, setRenewOpen] = useState(false);
    const [renewing, setRenewing] = useState(false);
    const [renewSuccess, setRenewSuccess] = useState(false);

    const loadMembership = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Use /auth/me to get member_id reliably for any logged-in member
            const meRes = await api.get("/auth/me");
            const meData = meRes.data?.data?.user ?? meRes.data?.user ?? meRes.data;
            const memberId: number = meData.member_id;

            let d: Record<string, unknown> = { ...meData };
            if (memberId) {
                try {
                    const memberRes = await api.get(`/members/${memberId}`);
                    const mData = memberRes.data?.data ?? memberRes.data;
                    d = { ...meData, ...mData };
                } catch {
                    // fallback to meData
                }
            }

            const planName = d.membership_plan_name ?? d.membershipPlanName ?? d.plan_name ?? null;
            const planCode = String(d.membership_plan_code ?? d.plan_code ?? "");
            const membershipId = d.membership_id ?? d.id ?? memberId;
            const regDate = String(d.registration_date ?? d.created_at ?? "");
            const expiry = String(d.expiry_date ?? d.membership_expiry ?? d.membership_expiry_date ?? "");
            let activeMembershipPlan: any = null;
            if (Array.isArray(d.memberships) && d.memberships.length > 0) {
                const sorted = [...d.memberships].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
                const active = sorted.find(m => m.status === 'active') || sorted[0];
                activeMembershipPlan = active?.membership_plan;
            }

            console.log("DEBUG Member Data:", { d, activeMembershipPlan, meData });

            let extractedRenewalFee = Number(activeMembershipPlan?.renewal_price ?? d.renewal_fee ?? d.membership_price ?? d.plan_price);
            let extractedOriginalFee = Number(activeMembershipPlan?.price ?? d.plan_price ?? d.membership_price ?? d.renewal_fee);

            if (isNaN(extractedRenewalFee)) extractedRenewalFee = 0;
            if (isNaN(extractedOriginalFee)) extractedOriginalFee = 0;

            const renewalFee = extractedRenewalFee;
            const originalFee = extractedOriginalFee;
            const memberStatus = String(d.status ?? meData.status ?? "");

            // Assume payment_status 'partial' or has an 'installment' flag means it's on installments
            const isInstallment = d.payment_status === "partial" || String(d.payment_type).toLowerCase() === "installments" || d.is_installment === true;
            let nextInstallmentAmount = null;
            let nextInstallmentDate = null;

            if (isInstallment) {
                // If backend provides specific next installment data, use it
                if (d.next_installment_amount) {
                    nextInstallmentAmount = Number(d.next_installment_amount);
                } else {
                    // Fallback: estimate next installment as half the renewal fee
                    nextInstallmentAmount = renewalFee / 2;
                }

                if (d.next_installment_date) {
                    nextInstallmentDate = String(d.next_installment_date);
                } else {
                    // Fallback: estimate next installment to be 6 months from registration
                    if (regDate) {
                        const date = new Date(regDate);
                        date.setMonth(date.getMonth() + 6);
                        nextInstallmentDate = date.toISOString().split("T")[0];
                    }
                }
            }

            if (!planName) {
                setPlan(null);
            } else {
                const today = new Date().toISOString().split("T")[0];
                const total = daysBetween(regDate, expiry);
                const used = daysBetween(regDate, today);
                setPlan({
                    planName: String(planName),
                    planCode,
                    membershipId: String(membershipId),
                    registrationDate: regDate,
                    expiryDate: expiry,
                    renewalFee,
                    originalFee,
                    status: memberStatus,
                    totalDays: total,
                    daysUsed: Math.min(used, total),
                    isInstallment,
                    nextInstallmentAmount,
                    nextInstallmentDate,
                });
            }
        } catch {
            setError("فشل في تحميل بيانات العضوية");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void loadMembership(); }, [loadMembership]);

    const handleRenew = async () => {
        setRenewing(true);
        try {
            // Placeholder — hook into real renewal endpoint when available
            await new Promise((r) => setTimeout(r, 1200));
            setRenewSuccess(true);
            setTimeout(() => {
                setRenewOpen(false);
                setRenewSuccess(false);
            }, 2000);
        } catch {
            // handle error
        } finally {
            setRenewing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2EA7C9] border-t-transparent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 flex items-start gap-3 text-sm text-red-700" dir="rtl">
                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                <span>{String(error)}</span>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="rounded-2xl border border-border bg-card p-10 text-center" dir="rtl">
                <CreditCard className="h-14 w-14 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground text-sm">لا توجد بيانات عضوية مرتبطة بهذا الحساب.</p>
            </div>
        );
    }

    const progressPct = plan.totalDays > 0 ? Math.min(100, Math.round((plan.daysUsed / plan.totalDays) * 100)) : 0;
    const daysLeft = Math.max(0, plan.totalDays - plan.daysUsed);

    return (
        <div className="space-y-4" dir="rtl">
            {/* Main plan card */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
            >
                {/* Card top stripe */}
                <div className="h-2 w-full" style={{ background: "linear-gradient(90deg, #1F3A5F, #2EA7C9)" }} />

                <div className="p-5 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#2EA7C9/10", background: "rgba(46,167,201,0.12)" }}>
                                <CreditCard className="h-7 w-7 text-[#2EA7C9]" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">خطة العضوية الحالية</p>
                                <h2 className="text-xl font-bold text-[#214474]">{plan.planName}</h2>
                                {plan.planCode && (
                                    <span className="text-xs text-muted-foreground font-mono ml-2">{plan.planCode}</span>
                                )}
                                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full inline-block mt-1">
                                    رقم العضوية: {plan.membershipId}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className={statusStyle(plan.status)}>{statusLabel(plan.status)}</Badge>
                            <Button
                                className="gap-2 bg-[#F4A623] hover:bg-[#d98f1a] text-white"
                                onClick={() => setRenewOpen(true)}
                            >
                                <RefreshCw className="h-4 w-4" />
                                تجديد العضوية
                            </Button>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                            <span>مدة الاشتراك المستخدمة</span>
                            <span>{progressPct}% · {daysLeft} يوم متبقٍ</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPct}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="h-full rounded-full"
                                style={{ background: progressPct >= 90 ? "#ef4444" : progressPct >= 70 ? "#F4A623" : "#2EA7C9" }}
                            />
                        </div>
                    </div>

                    {/* Details grid */}
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                تاريخ التسجيل
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                                {plan.registrationDate ? new Date(plan.registrationDate).toLocaleDateString("ar-EG") : "—"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                تاريخ الانتهاء / التجديد
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                                {plan.expiryDate ? new Date(plan.expiryDate).toLocaleDateString("ar-EG") : "—"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Tag className="h-3.5 w-3.5" />
                                رسوم الخطة
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                                {currencyFmt.format(plan.originalFee)}
                            </p>
                        </div>

                        <div className="rounded-xl border border-[#F4A623]/30 bg-[#FFF8EC] p-4 flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs text-[#d98f1a]">
                                <RefreshCw className="h-3.5 w-3.5" />
                                رسوم التجديد القادم
                            </div>
                            <p className="text-lg font-bold text-[#1F3A5F]">
                                {currencyFmt.format(plan.renewalFee)}
                            </p>
                        </div>
                    </div>

                    {/* Installments Section */}
                    {plan.isInstallment && (
                        <div className="mt-5 rounded-xl border border-[#2EA7C9]/30 bg-[#2EA7C9]/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#2EA7C9]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-1 text-[#214474]">
                                    <CreditCard className="h-4 w-4 text-[#2EA7C9]" />
                                    <span className="font-bold text-sm">القسط القادم</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                                    <span className="text-2xl font-black text-[#1F3A5F]">
                                        {plan.nextInstallmentAmount ? currencyFmt.format(plan.nextInstallmentAmount) : "—"}
                                    </span>
                                    <span className="text-sm font-medium text-muted-foreground">
                                        يستحق في: {plan.nextInstallmentDate ? new Date(plan.nextInstallmentDate).toLocaleDateString("ar-EG") : "—"}
                                    </span>
                                </div>
                            </div>

                            <Button className="relative z-10 bg-[#2EA7C9] hover:bg-[#258a9e] text-white whitespace-nowrap">
                                <CreditCard className="h-4 w-4 ml-2" />
                                دفع القسط
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Renewal Dialog */}
            <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
                <DialogContent dir="rtl" className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[#214474]">تجديد العضوية</DialogTitle>
                    </DialogHeader>

                    {renewSuccess ? (
                        <div className="flex flex-col items-center gap-3 py-6">
                            <CheckCircle2 className="h-14 w-14 text-green-500" />
                            <p className="text-sm font-medium text-green-700">تم إرسال طلب التجديد بنجاح!</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4 py-2">
                                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">الخطة</span>
                                        <span className="font-medium">{plan.planName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">تاريخ الانتهاء الحالي</span>
                                        <span className="font-medium">{plan.expiryDate ? new Date(plan.expiryDate).toLocaleDateString("ar-EG") : "—"}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-border pt-2 mt-2">
                                        <span className="text-muted-foreground font-medium">رسوم التجديد</span>
                                        <span className="font-bold text-[#1F3A5F] text-base">{currencyFmt.format(plan.renewalFee)}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    سيتم إرسال طلب التجديد إلى الإدارة المالية للمراجعة والموافقة. سيُتواصل معك عند اكتمال العملية.
                                </p>
                            </div>

                            <DialogFooter className="gap-2">
                                <Button variant="outline" onClick={() => setRenewOpen(false)}>إلغاء</Button>
                                <Button
                                    onClick={handleRenew}
                                    disabled={renewing}
                                    className="bg-[#F4A623] hover:bg-[#d98f1a] text-white gap-2"
                                >
                                    <RefreshCw className={`h-4 w-4 ${renewing ? "animate-spin" : ""}`} />
                                    {renewing ? "جارٍ الإرسال..." : "تأكيد التجديد"}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
