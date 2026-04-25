import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
const hucLogo = "/assets/HUC_logo.jpeg";

const WEEKDAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const MONTHS_AR = [
    "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

function formatDateAr(d: Date) {
    return `${WEEKDAYS_AR[d.getDay()]}، ${d.getDate()} ${MONTHS_AR[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTimeAr(d: Date) {
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    const period = h >= 12 ? "م" : "ص";
    const h12 = h % 12 || 12;
    return `${h12}:${m}:${s} ${period}`;
}

export default function MemberPendingPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [now, setNow] = useState(new Date());
    const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Check real member status via /auth/me and redirect active members away
    useEffect(() => {
        let cancelled = false;
        const checkStatus = async () => {
            try {
                const meRes = await api.get("/auth/me");
                const me = meRes.data?.data?.user ?? meRes.data?.user ?? meRes.data;
                // /auth/me returns the member's real status from the DB
                const realStatus = String(me?.status ?? "").trim().toLowerCase();
                if (!cancelled && realStatus === "active") {
                    // Update stored user so ProtectedRoute reads the correct status
                    const stored = localStorage.getItem("huc_user");
                    if (stored) {
                        try {
                            const parsed = JSON.parse(stored);
                            parsed.status = "active";
                            localStorage.setItem("huc_user", JSON.stringify(parsed));
                        } catch { /* ignore */ }
                    }
                    navigate("/member/dashboard/home", { replace: true });
                }
            } catch { /* stay on pending page on error */ }
        };
        void checkStatus();
        return () => { cancelled = true; };
    }, [navigate]);

    // Live clock
    useEffect(() => {
        tickRef.current = setInterval(() => setNow(new Date()), 1000);
        return () => { if (tickRef.current) clearInterval(tickRef.current); };
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const firstName = user?.fullName?.split(" ")[0] ?? "عزيزي العضو";

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
            style={{ backgroundColor: "#F5F6FA" }}
            dir="rtl"
        >
            {/* Logo */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 flex flex-col items-center gap-3"
            >
                <img src={hucLogo} alt="نادي جامعة حلوان" className="h-16 w-16 rounded-full object-cover shadow border-2 border-white" />
                <p className="text-gray-400 text-sm font-medium tracking-wide">نادي جامعة حلوان</p>
            </motion.div>

            {/* Main card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-full max-w-md rounded-3xl bg-white border border-gray-200 shadow-lg overflow-hidden"
            >
                {/* Top accent */}
                <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #F4A623, #2EA7C9)" }} />

                <div className="p-8 flex flex-col items-center text-center gap-6">
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(244,166,35,0.15)", border: "2px solid rgba(244,166,35,0.4)" }}
                    >
                        <ShieldCheck className="h-10 w-10 text-[#F4A623]" />
                    </motion.div>

                    {/* Greeting */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-1">
                            أهلاً، {firstName} 👋
                        </h1>
                        <p className="text-gray-400 text-sm">مرحباً بك في نادي جامعة حلوان</p>
                    </div>

                    {/* Live clock */}
                    <div className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-5 py-4">
                        <p className="text-3xl font-bold text-[#1F3A5F] tabular-nums mb-1">
                            {formatTimeAr(now)}
                        </p>
                        <p className="text-sm text-gray-400 flex items-center justify-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDateAr(now)}
                        </p>
                    </div>

                    {/* Pending message */}
                    <div className="w-full rounded-2xl bg-amber-500/10 border border-amber-400/30 px-5 py-5 space-y-2">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <Clock className="h-4 w-4 text-amber-500" />
                            <span className="text-amber-600 text-sm font-semibold">الطلب قيد المراجعة</span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            بياناتك قيد المراجعة من قِبل فريق إدارة النادي.
                        </p>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            سيتم تفعيل حسابك في أقرب وقت ممكن، وستتمكن من الدخول إلى لوحة التحكم الخاصة بك بمجرد اعتماد طلبك.
                        </p>
                        <p className="text-gray-400 text-xs mt-2">
                            إذا مرّ وقت طويل ولم يُفعَّل حسابك، يُرجى التواصل مع إدارة النادي.
                        </p>
                    </div>

                    {/* Logout button */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 px-6 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        style={{ background: "#1F3A5F" }}
                    >
                        <LogOut className="h-4 w-4" />
                        تسجيل الخروج
                    </button>
                </div>
            </motion.div>

            {/* Subtle footer */}
            <p className="mt-6 text-gray-300 text-xs">
                © {now.getFullYear()} نادي جامعة حلوان — جميع الحقوق محفوظة
            </p>
        </div>
    );
}
