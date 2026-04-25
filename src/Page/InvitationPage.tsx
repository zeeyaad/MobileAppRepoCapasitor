import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Loader2,
    XCircle,
    AlertCircle,
    Users,
    CheckCircle2,
    Home,
} from "lucide-react";
import api from "../api/axios";
const HUCLogo = "/assets/HUC logo.jpeg";

// ─── Types ──────────────────────────────────────────────────────────────────
type InviteDetails = {
    id: string;
    sport_name_ar: string;
    sport_name_en: string;
    field_name_ar: string;
    field_name_en: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    status: "pending_payment" | "confirmed" | "completed" | "cancelled";
    expected_participants: number;
    participants: { full_name: string; is_creator: boolean }[];
    spots_remaining: number;
};

type FormState = {
    full_name: string;
    phone_number: string;
    national_id: string;
    email: string;
};

type FormErrors = Partial<Record<keyof FormState | "contact", string>>;

type PageState =
    | "loading"
    | "not_found"
    | "active"
    | "full"
    | "unavailable"
    | "success";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatTimeAr(iso: string): string {
    return new Date(iso).toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

function formatDateAr(iso: string): string {
    return new Date(iso).toLocaleDateString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}



// ─── Field Input ─────────────────────────────────────────────────────────────
function Field({
    label,
    id,
    type = "text",
    placeholder,
    value,
    onChange,
    error,
    required,
    maxLength,
    inputMode,
}: {
    label: string;
    id: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    required?: boolean;
    maxLength?: number;
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
    return (
        <div className="space-y-1">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 mr-0.5">*</span>}
            </label>
            <input
                id={id}
                name={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                maxLength={maxLength}
                inputMode={inputMode}
                dir="rtl"
                autoComplete="off"
                className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-150 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 ${
                    error ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                }`}
            />
            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </p>
            )}
        </div>
    );
}

// ─── Status Badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: InviteDetails["status"] }) {
    const map: Record<
        InviteDetails["status"],
        { label: string; className: string }
    > = {
        confirmed: {
            label: "مؤكد",
            className: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
        },
        pending_payment: {
            label: "قيد الدفع",
            className: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
        },
        completed: {
            label: "منتهي",
            className: "bg-gray-500/20 text-gray-300 border border-gray-500/30",
        },
        cancelled: {
            label: "ملغي",
            className: "bg-red-500/20 text-red-300 border border-red-500/30",
        },
    };
    const { label, className } = map[status];
    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${className}`}
        >
            {label}
        </span>
    );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton() {
    return (
        <div className="flex flex-col md:flex-row h-screen w-full animate-pulse" dir="rtl">
            {/* Left */}
            <div className="w-full md:w-2/5 p-8 flex flex-col gap-6" style={{ background: "#214474" }}>
                <div className="h-5 w-32 bg-white/10 rounded" />
                <div className="h-8 w-48 bg-white/10 rounded" />
                <div className="h-4 w-full bg-white/10 rounded" />
                <div className="h-4 w-3/4 bg-white/10 rounded" />
                <div className="h-4 w-5/6 bg-white/10 rounded" />
                <div className="h-px bg-white/10 w-full my-2" />
                <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-white/10" />
                    ))}
                </div>
            </div>
            {/* Right */}
            <div className="w-full md:w-3/5 bg-gray-50 p-8 flex flex-col gap-4">
                <div className="h-7 w-40 bg-gray-200 rounded" />
                <div className="h-4 w-64 bg-gray-200 rounded" />
                <div className="h-12 w-full bg-gray-200 rounded-xl" />
                <div className="h-12 w-full bg-gray-200 rounded-xl" />
                <div className="h-12 w-full bg-gray-200 rounded-xl" />
                <div className="h-12 w-full bg-gray-200 rounded-xl" />
                <div className="h-12 w-full bg-gray-300 rounded-xl mt-2" />
            </div>
        </div>
    );
}

// ─── Left Panel ──────────────────────────────────────────────────────────────
function DetailsPanel({ details }: { details: InviteDetails }) {
    const navigate = useNavigate();
    // Exclude the creator when counting taken spots — they are the host, not an invitee
    const creator = details.participants.find((p) => p.is_creator);
    const nonCreatorCount = details.participants.filter((p) => !p.is_creator).length;
    const spotsLeft = Math.max(
        0,
        details.expected_participants - nonCreatorCount
    );

    return (
        <div
            className="w-full md:w-2/5 text-white flex flex-col overflow-y-auto px-8 py-10 gap-6 relative"
            style={{ background: "#214474" }}
        >
            {/* Header: logo left, home button right */}
            <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                    <img src={HUCLogo} alt="نادي جامعة حلوان" className="w-full h-full object-contain" />
                </div>
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
                >
                    <Home className="w-4 h-4" />
                    الرئيسية
                </button>
            </div>

            {/* Status + sport badge */}
            <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={details.status} />
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-gray-200 text-xs font-semibold border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-[#f8941c] inline-block" />
                    {details.sport_name_ar}
                </span>
            </div>

            {/* Main heading */}
            <div>
                <h1 className="text-3xl font-extrabold leading-tight tracking-tight">
                    دعوة للمشاركة
                </h1>
                <p className="text-gray-300 mt-1 text-sm">انضم إلى المباراة الآن</p>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10 w-full" />

            {/* Field info */}
            <div className="space-y-3">
                <p className="text-xl font-bold text-white">{details.field_name_ar}</p>
                <div className="flex flex-col gap-1.5 text-gray-300 text-sm">
                    <span className="flex items-center gap-2">
                        <span className="text-[#f8941c]">📅</span>
                        {formatDateAr(details.start_time)}
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="text-[#f8941c]">🕐</span>
                        {formatTimeAr(details.start_time)} — {formatTimeAr(details.end_time)}
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="text-[#f8941c]">⏱</span>
                        {details.duration_minutes} دقيقة
                    </span>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10 w-full" />

            {/* Host */}
            {creator && (
                <p className="text-sm text-gray-300">
                    بدعوة من:{" "}
                    <span className="text-white font-semibold">{creator.full_name}</span>
                </p>
            )}

            {/* Players */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                    <Users className="w-4 h-4 text-[#2596be]" />
                    المشاركون
                </div>

                {/* Dots indicator */}
                <div className="flex gap-1.5 flex-wrap">
                    {[...Array(details.expected_participants)].map((_, i) => (
                        <span
                            key={i}
                            className={`text-lg leading-none transition-all duration-300 ${i < details.participants.length
                                ? "text-[#2596be]"
                                : "text-white/20"
                                }`}
                        >
                            {i < details.participants.length ? "●" : "○"}
                        </span>
                    ))}
                </div>

                {/* Count ratio */}
                <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-white">{details.participants.length}</span>
                    <span className="text-gray-400 text-sm">من</span>
                    <span className="text-xl font-bold text-white/60">{details.expected_participants}</span>
                    <span className="text-gray-400 text-sm">مشارك</span>
                </div>

                {spotsLeft > 0 && (
                    <p className="text-sm text-emerald-300 font-medium">
                        {spotsLeft} {spotsLeft === 1 ? "مكان شاغر" : "أماكن شاغرة"}
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="mt-auto pt-6">
                <p className="text-xs text-white/20 text-center">
                    © {new Date().getFullYear()} نادي جامعة حلوان
                </p>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InvitationPage() {
    const { token } = useParams<{ token: string }>();

    const [pageState, setPageState] = useState<PageState>("loading");
    const [details, setDetails] = useState<InviteDetails | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedName, setSubmittedName] = useState("");
    const [form, setForm] = useState<FormState>({
        full_name: "",
        phone_number: "",
        national_id: "",
        email: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [fadeIn, setFadeIn] = useState(false);

    // ── Fetch on mount ──
    const fetchDetails = async () => {
        if (!token) return setPageState("not_found");
        try {
            // Backend endpoint: GET /api/bookings/share/:token/details
            const res = await api.get(`/bookings/share/${token}/details`);
            const raw = res.data?.data ?? res.data;
            // Exclude the creator — they are the organizer, not an invitee
            const nonCreatorCount = (raw.participants ?? []).filter(
                (p: { is_creator: boolean }) => !p.is_creator
            ).length;
            const data: InviteDetails = {
                ...raw,
                spots_remaining: Math.max(
                    0,
                    (raw.expected_participants ?? 1) - nonCreatorCount
                ),
            };
            setDetails(data);

            if (data.status === "cancelled" || data.status === "completed") {
                setPageState("unavailable");
            } else if (data.spots_remaining <= 0) {
                setPageState("full");
            } else {
                setPageState("active");
            }
        } catch {
            setPageState("not_found");
        } finally {
            setTimeout(() => setFadeIn(true), 50);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [token]);

    // ── Validation ──
    const validate = (): boolean => {
        const errs: FormErrors = {};
        if (!form.full_name.trim()) errs.full_name = "الاسم الكامل مطلوب";

        // Egyptian mobile: exactly 11 digits, starts with 010 / 011 / 012 / 015
        if (form.phone_number && !/^01[0125]\d{8}$/.test(form.phone_number))
            errs.phone_number = "رقم الهاتف يجب أن يكون 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015";

        // Egyptian national ID: exactly 14 digits, starts with 2 or 3
        if (form.national_id && !/^[23]\d{13}$/.test(form.national_id))
            errs.national_id = "الرقم القومي يجب أن يكون 14 رقماً ويبدأ بـ 2 أو 3";

        if (
            !form.phone_number.trim() &&
            !form.national_id.trim() &&
            !form.email.trim()
        )
            errs.contact = "يرجى إدخال رقم الهاتف أو الرقم القومي أو البريد الإلكتروني";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ── Submit ──
    const handleJoin = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            // Backend endpoint: POST /api/bookings/share/:token/register
            await api.post(`/bookings/share/${token}/register`, {
                full_name: form.full_name.trim(),
                phone_number: form.phone_number.trim() || undefined,
                national_id: form.national_id.trim() || undefined,
                email: form.email.trim() || undefined,
            });
            setSubmittedName(form.full_name.trim());
            setPageState("success");
            // Re-fetch details to update participants list
            fetchDetails();
        } catch (err: unknown) {
            const e = err as { message?: string };
            setErrors({ contact: e?.message || "حدث خطأ، يرجى المحاولة مرة أخرى" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: keyof FormState, value: string) => {
        setForm((f) => ({ ...f, [field]: value }));
        setErrors((e) => ({ ...e, [field]: undefined, contact: undefined }));
    };

    // ─── RIGHT PANEL content ─────────────────────────────────────────────────
    const renderRightPanel = () => {
        // Not found
        if (pageState === "not_found") {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-4">
                    <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        رابط الدعوة غير صالح
                    </h2>
                    <p className="text-gray-500 max-w-xs">
                        هذا الرابط غير موجود أو منتهي الصلاحية
                    </p>
                </div>
            );
        }

        // Full
        if (pageState === "full") {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-4">
                    <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
                        <AlertCircle className="w-10 h-10 text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">اكتملت المباراة</h2>
                    <p className="text-gray-500">لا توجد أماكن متاحة حالياً</p>
                </div>
            );
        }

        // Unavailable
        if (pageState === "unavailable") {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        هذه الدعوة لم تعد متاحة
                    </h2>
                    <p className="text-gray-500">
                        {details?.status === "cancelled"
                            ? "تم إلغاء هذه المباراة"
                            : "هذه المباراة منتهية"}
                    </p>
                </div>
            );
        }

        // Success
        if (pageState === "success") {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-5">
                    <div
                        className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center"
                        style={{ animation: "checkScale 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}
                    >
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900">
                            تم تسجيل مشاركتك بنجاح! 🎉
                        </h2>
                        <p className="text-gray-500 mt-1 text-sm">
                            سيتواصل معك منظم المباراة قريباً
                        </p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 w-full max-w-xs">
                        <p className="text-sm text-gray-500">تم تسجيل</p>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">
                            {submittedName}
                        </p>
                    </div>
                    {details && (
                        <p className="text-xs text-gray-400">
                            {details.spots_remaining} مكان متبقٍ من أصل {details.expected_participants}
                        </p>
                    )}
                </div>
            );
        }

        // Active form (pageState === "active")
        return (
            <div className="flex flex-col justify-center h-full px-8 py-10 max-w-md mx-auto w-full">
                <div className="mb-6">
                    <h2 className="text-2xl font-extrabold text-gray-900">
                        سجّل مشاركتك
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        أدخل بياناتك للانضمام إلى المباراة
                    </p>
                </div>

                <div className="space-y-4">
                    <Field
                        label="الاسم الكامل"
                        id="full_name"
                        placeholder="محمد أحمد"
                        value={form.full_name}
                        onChange={(v) => handleChange("full_name", v)}
                        error={errors.full_name}
                        required
                    />

                    <Field
                        label="رقم الهاتف"
                        id="phone_number"
                        type="tel"
                        placeholder="01xxxxxxxxx"
                        value={form.phone_number}
                        onChange={(v) => handleChange("phone_number", v)}
                        error={errors.phone_number}
                        maxLength={11}
                        inputMode="numeric"
                    />

                    <Field
                        label="الرقم القومي"
                        id="national_id"
                        placeholder="14 رقم"
                        value={form.national_id}
                        onChange={(v) => handleChange("national_id", v)}
                        error={errors.national_id}
                        maxLength={14}
                        inputMode="numeric"
                    />

                    <Field
                        label="البريد الإلكتروني"
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        value={form.email}
                        onChange={(v) => handleChange("email", v)}
                        error={errors.email}
                    />

                    {errors.contact && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-red-600">{errors.contact}</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleJoin}
                    disabled={isSubmitting || (details?.spots_remaining ?? 1) <= 0}
                    className="mt-6 w-full bg-[#f8941c] hover:bg-[#e07d10] text-white py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            جاري التسجيل...
                        </>
                    ) : (
                        "انضم الآن"
                    )}
                </button>

                <p className="text-xs text-center text-gray-500 mt-3">
                    بالضغط على الزر، أنت توافق على شروط نادي جامعة حلوان
                </p>
            </div>
        );
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    if (pageState === "loading") return <Skeleton />;

    return (
        <>
            {/* Keyframe for success checkmark */}
            <style>{`
        @keyframes checkScale {
          from { opacity: 0; transform: scale(0.4); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

            <div
                dir="rtl"
                className="flex flex-col md:flex-row md:h-screen w-full"
                style={{
                    opacity: fadeIn ? 1 : 0,
                    transition: "opacity 0.35s ease",
                }}
            >
                {/* ── LEFT: Details dark panel ── */}
                {details && pageState !== "not_found" ? (
                    <DetailsPanel details={details} />
                ) : (
                    /* Minimal dark panel for not_found state */
                    <div
                        className="hidden md:flex w-2/5 items-center justify-center"
                        style={{ background: "#214474" }}
                    >
                        <div className="flex flex-col items-center gap-3 opacity-30">
                            <img src={HUCLogo} alt="" className="w-12 h-12 rounded-xl object-contain" />
                            <p className="text-white text-sm">نادي جامعة حلوان</p>
                        </div>
                    </div>
                )}

                {/* ── RIGHT: Form / State panel ── */}
                <div className="w-full md:w-3/5 bg-white overflow-y-auto flex flex-col">
                    <div className="flex-1">{renderRightPanel()}</div>
                    <footer className="text-center py-4 text-gray-400 text-xs border-t border-gray-100">
                        © {new Date().getFullYear()} نادي جامعة حلوان — جميع الحقوق محفوظة
                    </footer>
                </div>
            </div>
        </>
    );
}
