// App.jsx
import { useState, useEffect } from "react";
import {
    User, MapPin, Calendar, Clock, Star, Menu, X,
    ArrowRight, ChevronLeft, Phone, Mail, Facebook, Instagram, Twitter
} from "lucide-react";
import ReservationPage from "./ReservationPage.js";
// import CalendarComponent from "../Component/CalendarComponent.jsx";

const App = () => {
    const asset = (name: string) => `/assets/${name}`;
    const [activeTab, setActiveTab] = useState("home");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Add scroll effect for header
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const brandColors = {
        primary: "#0b2f8f", // Main Blue
        dark: "#0e1c38",    // Dark Navy
        accent: "#ff9900",  // Orange
        light: "#f8f9fa"    // Light Gray Background
    };

    const testimonials = [
        {
            name: "عمر عبد الرحمن",
            role: "عضو ذهبي",
            rating: 5,
            text: "من اول تدريب وانا حاسس بتغيير كبير والحمدلله دلوقتي بقيت أعرف وضع الجسم والطريقة الصحيحة للتدريب."
        },
        {
            name: "يوسف السيد",
            role: "لاعب تنس",
            rating: 5,
            text: "النادي هنا مش بس معدات، المدربين عندهم خبرة، والتركيز على النتيجة خلاني اتطور بسرعة."
        },
        {
            name: "منى خالد",
            role: "عضوية عائلية",
            rating: 5,
            text: "خدمات ممتازة، المكان نضيف، وحبيت الاهتمام بالتغذية وبرنامج التمرين."
        }
    ];

    const newsItems = [
        { id: 1, category: "كرة قدم", title: "نادي حلوان يتعاقد مع نجوم جدد", date: "20 نوفمبر", image: "/api/placeholder/400/300" },
        { id: 2, category: "أحداث", title: "بطولة داخلية الاسبوع ده في فرع المعادي", date: "18 نوفمبر", image: "/api/placeholder/400/300" },
        { id: 3, category: "عروض", title: "خصم 20% على الاشتراكات السنوية", date: "15 نوفمبر", image: "/api/placeholder/400/300" },
        { id: 4, category: "مجتمع", title: "ماراثون اليوم العالمي للرياضة", date: "10 نوفمبر", image: "/api/placeholder/400/300" }
    ];

    const renderStars = (rating) =>
        Array(5)
            .fill(0)
            .map((_, i) => (
                <Star
                    key={i}
                    className={`w-4 h-4 ${i < rating ? "fill-[#ff9900] text-[#ff9900]" : "text-gray-300"}`}
                />
            ));

    // Reusable Section Title Component
    const SectionTitle = ({ title, subtitle, centered = true }) => (
        <div className={`mb-16 ${centered ? "text-center" : "text-right"}`}>
            <span className="text-[#ff9900] font-bold tracking-wider uppercase text-sm">نادي حلوان</span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0e1c38] mt-2 mb-4">{title}</h2>
            <div className={`h-1.5 w-24 bg-[#0b2f8f] rounded-full mb-6 ${centered ? "mx-auto" : "ml-auto"}`}></div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case "home":
                return (
                    <div className="animate-fade-in">
                        {/* Hero Section */}
                        <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden">
                            <div className="absolute inset-0 z-0">
                                <img
                                    src={asset("Exposure 1.png")}
                                    alt="Background"
                                    className="w-full h-full object-cover scale-105 animate-slow-zoom"
                                />
                                {/* Gradient Overlay for better text readability */}
                                <div className="absolute inset-0 bg-gradient-to-r from-[#0e1c38]/90 via-[#0e1c38]/60 to-transparent" />
                            </div>

                            <div className="container mx-auto px-6 relative z-10 pt-20">
                                <div className="max-w-3xl text-white text-right">
                                    <div className="inline-block bg-[#ff9900] text-white font-bold px-4 py-1 rounded-full mb-6 text-sm shadow-lg">
                                        مرحباً بك في نادي حلوان
                                    </div>
                                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                                        مش مجرد نادي<br />
                                        <span className="text-[#ff9900]">دا أسلوب حياة</span>
                                    </h1>
                                    <p className="text-lg md:text-xl mb-10 text-gray-200 font-light leading-relaxed max-w-xl">
                                        انضم لأكبر مجتمع رياضي في المنطقة. أكثر من 5000 عضو، مدربين محترفين، وتجهيزات عالمية في انتظارك.
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <button onClick={() => setActiveTab("memberships")} className="bg-[#ff9900] hover:bg-[#e68900] text-white px-8 py-4 rounded-full transition-all duration-300 shadow-[0_10px_20px_rgba(255,153,0,0.3)] hover:shadow-[0_15px_25px_rgba(255,153,0,0.4)] hover:-translate-y-1 font-bold text-lg flex items-center gap-2">
                                            سجل دلوقتي <ArrowRight className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => setActiveTab("sports")} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full transition-all duration-300 border border-white/30 font-bold text-lg hover:border-white/60">
                                            اكتشف الرياضات
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Stats Section */}
                        <div className="bg-[#0e1c38] text-white py-10 border-b border-white/10">
                            <div className="container mx-auto px-6 flex flex-wrap justify-around gap-8 text-center">
                                {[
                                    { num: "+5000", label: "عضو نشط" },
                                    { num: "+20", label: "مدرب محترف" },
                                    { num: "3", label: "فروع رئيسية" },
                                    { num: "+15", label: "رياضة متنوعة" },
                                ].map((stat, idx) => (
                                    <div key={idx} className="flex flex-col group cursor-default">
                                        <span className="text-4xl md:text-5xl font-bold text-[#ff9900] group-hover:scale-110 transition-transform duration-300">{stat.num}</span>
                                        <span className="text-gray-300 text-sm mt-2 font-medium">{stat.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Branches Section */}
                        <section className="py-24 bg-gray-50">
                            <div className="container mx-auto px-6">
                                <SectionTitle
                                    title="فروعنا المتميزة"
                                    subtitle="اختر الفرع الأقرب إليك واستمتع بتجربة رياضية متكاملة بأحدث التجهيزات."
                                />

                                <div className="flex justify-center">
                                    <div className="group bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden max-w-6xl w-full flex flex-col md:flex-row hover:-translate-y-2">
                                        <div className="md:w-1/2 relative overflow-hidden h-72 md:h-auto">
                                            <div className="absolute inset-0 bg-[#0e1c38]/20 group-hover:bg-transparent transition-all duration-500 z-10"></div>
                                            <img src={asset("club.png")} alt="Maadi Branch" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute top-6 right-6 z-20 bg-white/90 backdrop-blur-sm px-5 py-2 rounded-xl text-sm font-bold text-[#0b2f8f] shadow-lg">
                                                الفرع الرئيسي
                                            </div>
                                        </div>

                                        <div className="md:w-1/2 p-8 md:p-14 flex flex-col justify-center">
                                            <h3 className="text-3xl font-bold mb-2 text-[#0e1c38]">فرع المعادي</h3>
                                            <p className="text-gray-500 mb-8">أكبر فروعنا وأكثرها تكاملاً في قلب القاهرة</p>

                                            <div className="grid grid-cols-2 gap-y-8 gap-x-4 mb-10">
                                                {[
                                                    { icon: MapPin, title: "الموقع", val: "زهراء المعادي" },
                                                    { icon: Calendar, title: "المواعيد", val: "طوال الأسبوع" },
                                                    { icon: Clock, title: "الساعات", val: "6 ص - 12 م" },
                                                    { icon: User, title: "الأعضاء", val: "متاح" }
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-center gap-4">
                                                        <div className="bg-blue-50 p-3 rounded-2xl text-[#0b2f8f]">
                                                            <item.icon className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-gray-500 block mb-1">{item.title}</span>
                                                            <span className="font-bold text-gray-900">{item.val}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <button className="w-full bg-[#0b2f8f] hover:bg-[#0e1c38] text-white py-4 rounded-xl transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl flex justify-center items-center gap-3 group-hover:gap-5">
                                                استكشف النادي <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* News Section */}
                        <section className="py-24 bg-white">
                            <div className="container mx-auto px-6">
                                <div className="flex justify-between items-end mb-16">
                                    <div className="text-right">
                                        <span className="text-[#ff9900] font-bold uppercase text-sm tracking-wider">تابعنا</span>
                                        <h2 className="text-4xl font-bold text-[#0e1c38] mt-2">اخر الاخبار</h2>
                                    </div>
                                    <button className="hidden md:flex items-center gap-2 text-[#0b2f8f] font-bold hover:text-[#ff9900] transition-colors">
                                        عرض كل الأخبار <ChevronLeft className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {newsItems.map((item) => (
                                        <div key={item.id} className="group cursor-pointer">
                                            <div className="relative overflow-hidden rounded-[2rem] mb-5 shadow-md group-hover:shadow-xl transition-all duration-300">
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-[#0b2f8f] z-10">
                                                    {item.category}
                                                </div>
                                                <img src={item.image} alt={item.title} className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                            </div>
                                            <div className="flex gap-2 items-center text-xs text-gray-500 mb-2">
                                                <Calendar className="w-3 h-3 text-[#ff9900]" /> {item.date}
                                            </div>
                                            <h3 className="font-bold text-xl text-gray-900 leading-snug group-hover:text-[#0b2f8f] transition-colors">
                                                {item.title}
                                            </h3>
                                            <span className="inline-flex items-center text-[#0b2f8f] text-sm font-bold mt-3 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                                                اقرأ المزيد <ChevronLeft className="w-4 h-4 mr-1" />
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Testimonials */}
                        <section className="py-24 bg-[#f8f9fa] relative overflow-hidden">
                            <div className="container mx-auto px-6 relative z-10">
                                <SectionTitle
                                    title="آراء عملائنا"
                                    subtitle="شوف تجارب الأعضاء الحقيقية معانا وازاي النادي فرق في حياتهم."
                                />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {testimonials.map((t, index) => (
                                        <div key={index} className="bg-white rounded-[2rem] p-8 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl border border-gray-100">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-14 h-14 bg-gradient-to-br from-[#0b2f8f] to-[#0e1c38] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                                                    {t.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-[#0e1c38]">{t.name}</h3>
                                                    <span className="text-[#ff9900] text-xs font-bold">{t.role}</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 mb-6 leading-relaxed">"{t.text}"</p>
                                            <div className="flex gap-1 border-t border-gray-100 pt-4">{renderStars(t.rating)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* App Download */}
                        <section className="bg-[#0e1c38] py-20 relative overflow-hidden">
                            {/* Abstract Background Shapes */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-[#0b2f8f] rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#ff9900] rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/3"></div>

                            <div className="container mx-auto px-6 relative z-10">
                                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                                    <div className="lg:w-1/2 text-center lg:text-right">
                                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                                            نادي حلوان<br />
                                            <span className="text-[#ff9900]">دايماً معاك</span>
                                        </h2>
                                        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                                            حمل التطبيق دلوقتي واستفيد بنقاط الولاء، احجز ملاعبك، وتابع اشتراكك بكل سهولة من موبايدك.
                                        </p>
                                        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                            <button className="bg-white text-[#0e1c38] px-6 py-3 rounded-xl font-bold flex items-center gap-3 hover:bg-gray-100 transition-colors shadow-lg">
                                                <img src={asset("Layer 12 copy.png")} alt="Google Play" className="h-8" />
                                                <div className="text-right">
                                                    <span className="block text-[10px] text-gray-500">GET IT ON</span>
                                                    <span className="block text-sm">Google Play</span>
                                                </div>
                                            </button>
                                            <button className="bg-transparent border border-white/30 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-3 hover:bg-white/10 transition-colors">
                                                <img src={asset("Layer 28.png")} alt="App Store" className="h-8" />
                                                <div className="text-right">
                                                    <span className="block text-[10px] text-gray-400">Download on the</span>
                                                    <span className="block text-sm">App Store</span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="lg:w-1/2 relative flex justify-center">
                                        <img src={asset("Gold iphone.png")} alt="App Interface" className="w-64 md:w-80 z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
                                        <img src={asset("Uber rewards.png")} alt="App Interface" className="w-56 md:w-72 absolute -left-4 md:-left-12 top-12 -z-10 opacity-60 blur-[1px]" />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                );

            case "sports":
                return (
                    <div className="bg-gray-50 min-h-screen py-24 animate-fade-in">
                        <div className="container mx-auto px-6">
                            <SectionTitle title="الرياضات المتاحة" subtitle="مجموعة واسعة من الأنشطة الرياضية لتناسب جميع الأعمار والمستويات." />

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {["كرة القدم", "السباحة", "كرة السلة", "التنس", "الجمباز", "كرة اليد", "الكاراتيه", "الملاكمة"].map((sport, i) => (
                                    <div key={i} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100 hover:border-[#ff9900]/30 text-center hover:-translate-y-2">
                                        <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full mb-6 flex items-center justify-center group-hover:bg-[#0b2f8f] transition-colors duration-300">
                                            {/* Placeholder Icon - using first letter or generic */}
                                            <div className="w-10 h-10 bg-[#0b2f8f]/20 rounded-full group-hover:bg-white/20"></div>
                                        </div>
                                        <h3 className="font-bold text-xl text-gray-800 group-hover:text-[#0b2f8f]">{sport}</h3>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case "memberships":
                return (
                    <div className="bg-[#f8f9fa] min-h-screen py-24 animate-fade-in">
                        <div className="container mx-auto px-6">
                            <SectionTitle title="باقات العضوية" subtitle="اختر الخطة المناسبة ليك وابدأ رحلتك الرياضية النهاردة." />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                                {["Bronze", "Silver", "Gold"].map((plan, i) => (
                                    <div key={i} className={`bg-white rounded-[2rem] p-10 transition-all duration-300 relative overflow-hidden ${i === 2 ? "shadow-2xl transform md:-translate-y-4 border-2 border-[#ff9900]" : "shadow-lg hover:shadow-xl"}`}>
                                        {i === 2 && <div className="absolute top-0 right-0 bg-[#ff9900] text-white text-xs font-bold px-8 py-2 transform rotate-45 translate-x-8 translate-y-4">الأفضل</div>}

                                        <h3 className="text-2xl font-bold text-center mb-4 text-[#0e1c38]">{plan === "Bronze" ? "برونزية" : plan === "Silver" ? "فضية" : "ذهبية"}</h3>
                                        <div className="text-center mb-8">
                                            <span className="text-4xl font-bold text-[#0b2f8f]">{i === 0 ? "500" : i === 1 ? "1000" : "2000"}</span>
                                            <span className="text-gray-500 text-sm block mt-2">جنيه / شهرياً</span>
                                        </div>

                                        <ul className="space-y-4 mb-10 text-gray-600">
                                            <li className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">✓</div> دخول الصالة الرياضية</li>
                                            <li className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">✓</div> استخدام الخزائن</li>
                                            {i > 0 && <li className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">✓</div> دخول حمام السباحة</li>}
                                            {i === 2 && <li className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">✓</div> مدرب شخصي</li>}
                                        </ul>

                                        <button
                                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${i === 2
                                                ? "bg-[#ff9900] hover:bg-[#e68900] text-white shadow-lg"
                                                : "bg-[#0e1c38] hover:bg-[#0b2f8f] text-white"
                                                }`}
                                        >
                                            اشترك الآن
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case "reservations":
                return (
                    <div className="min-h-screen bg-gray-50 py-24 animate-fade-in">
                        <div className="container mx-auto px-6">
                            <SectionTitle title="حجز الملاعب" subtitle="نظام حجز ذكي وسهل لتنظيم وقتك الرياضي مع صحابك." />

                            <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
                                <div className="md:w-1/3 bg-[#0e1c38] p-10 text-white flex flex-col justify-between relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-full bg-[#0b2f8f] opacity-20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="relative z-10">
                                        <h3 className="text-2xl font-bold mb-6 border-b border-white/20 pb-4">تعليمات هامة</h3>
                                        <ul className="text-sm space-y-4 text-gray-300">
                                            <li className="flex items-start gap-2"><span className="text-[#ff9900]">•</span> يرجى الحضور قبل الموعد بـ 15 دقيقة.</li>
                                            <li className="flex items-start gap-2"><span className="text-[#ff9900]">•</span> الإلغاء متاح قبل 24 ساعة مجاناً.</li>
                                            <li className="flex items-start gap-2"><span className="text-[#ff9900]">•</span> يجب ارتداء الملابس الرياضية المناسبة.</li>
                                        </ul>
                                    </div>
                                    <div className="mt-12 relative z-10">
                                        <p className="text-xs text-gray-400 mb-2">للمساعدة الفورية</p>
                                        <div className="flex items-center gap-3 text-[#ff9900] font-bold text-2xl">
                                            <Phone className="w-6 h-6" /> 1913641
                                        </div>
                                    </div>
                                </div>
                                <div className="md:w-2/3 p-10">
                                    <ReservationPage />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case "events":
                return (
                    <div className="bg-gray-50 min-h-screen py-24 animate-fade-in">
                        <div className="container mx-auto px-6">
                            <SectionTitle title="أجندة الفعاليات" subtitle="تابع أحدث المسابقات والفعاليات الاجتماعية في النادي." />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white rounded-[2rem] shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group border border-gray-100">
                                        <div className="bg-gray-200 rounded-2xl h-48 mb-6 relative overflow-hidden">
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
                                                IMAGE PLACEHOLDER
                                            </div>
                                            <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-lg shadow-md text-center">
                                                <span className="block font-bold text-[#0b2f8f] text-lg">{10 + i}</span>
                                                <span className="block text-xs text-gray-500">NOV</span>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-xl mb-3 text-[#0e1c38] group-hover:text-[#0b2f8f] transition-colors">حدث رياضي {i}</h3>
                                        <p className="text-gray-500 mb-6 line-clamp-2">وصف مختصر عن الحدث الرياضي والفعاليات المصاحبة له في النادي.</p>
                                        <button className="text-[#0b2f8f] hover:text-[#ff9900] font-bold transition-colors flex items-center gap-2 text-sm">
                                            التفاصيل والتسجيل <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-sans text-right" dir="rtl">

            {/* Sticky Glass Header */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-lg shadow-md py-2" : "bg-white py-4"
                    }`}
            >
                <div className="container mx-auto px-6">
                    <div className="flex items-center justify-between">

                        {/* Logo & Brand */}
                        <div
                            className="flex items-center gap-4 cursor-pointer"
                            onClick={() => setActiveTab("home")}
                        >
                            <div className="bg-gradient-to-br from-blue-50 to-white p-2 rounded-xl border border-gray-100 shadow-sm">
                                <img src={asset("logo.png")} alt="Logo" className="w-12 h-12 object-contain" />
                            </div>
                            <div className="hidden md:block">
                                <h1 className="font-extrabold text-lg text-[#0e1c38] leading-tight">نادي حلوان</h1>
                                <p className="text-[10px] text-[#ff9900] font-bold tracking-widest uppercase">Since 1909</p>
                            </div>
                        </div>

                        {/* Desktop Nav - Pill Style */}
                        <nav className="hidden md:flex items-center bg-gray-100/80 p-1.5 rounded-full border border-gray-200">
                            {[
                                { key: "home", label: "الرئيسية" },
                                { key: "events", label: "الأحداث" },
                                { key: "sports", label: "الرياضات" },
                                { key: "reservations", label: "الحجوزات" },
                                { key: "memberships", label: "العضويات" }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`font-bold transition-all duration-300 px-6 py-2.5 rounded-full text-sm ${activeTab === tab.key
                                        ? "text-white bg-[#0b2f8f] shadow-md"
                                        : "text-gray-600 hover:text-[#0b2f8f] hover:bg-white"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => window.location.href = '/login'}
                                className="hidden md:flex bg-[#0e1c38] hover:bg-[#ff9900] text-white px-6 py-2.5 rounded-full transition-colors duration-300 font-bold text-sm shadow-lg items-center gap-2"
                            >
                                <User className="w-4 h-4" /> تسجيل دخول
                            </button>
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="md:hidden p-2.5 text-[#0e1c38] bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[60] bg-[#0e1c38] text-white p-6 animate-fade-in flex flex-col">
                    <div className="flex justify-between items-center mb-12">
                        <span className="font-bold text-xl text-[#ff9900]">القائمة</span>
                        <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <nav className="flex flex-col gap-2 flex-1">
                        {[
                            { key: "home", label: "الرئيسية" },
                            { key: "events", label: "اخر الاحداث" },
                            { key: "sports", label: "الرياضات" },
                            { key: "reservations", label: "الحجوزات" },
                            { key: "memberships", label: "العضويات" }
                        ].map((item) => (
                            <button
                                key={item.key}
                                onClick={() => { setActiveTab(item.key); setMobileMenuOpen(false); }}
                                className={`w-full text-right py-4 px-4 rounded-xl font-bold text-lg transition-all ${activeTab === item.key ? "bg-[#ff9900] text-white" : "hover:bg-white/5 text-gray-300"
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                    <button
                        onClick={() => { window.location.href = '/login'; setMobileMenuOpen(false); }}
                        className="w-full bg-white text-[#0e1c38] py-4 rounded-xl font-bold text-lg mt-4"
                    >
                        تسجيل دخول
                    </button>
                </div>
            )}

            {/* Main Content */}
            <main className="pt-20">
                {renderContent()}
            </main>

            {/* Footer */}
            <footer className="bg-[#0e1c38] text-white pt-20 pb-10 rounded-t-[3rem] mt-10">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">

                        <div className="max-w-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <img src={asset("Logo helwan white.png")} alt="Logo" className="w-16 h-16 object-contain" />
                                <div>
                                    <h3 className="font-bold text-2xl">نادي حلوان</h3>
                                    <p className="text-[#ff9900] font-medium">عراقة.. رياضة.. حياة</p>
                                </div>
                            </div>
                            <p className="text-gray-400 leading-relaxed">
                                وجهتك الأولى للرياضة والترفيه. بنقدملك مجتمع رياضي متكامل بخدمات عالمية تناسب كل أفراد الأسرة.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-12 md:gap-24">
                            <div>
                                <h4 className="font-bold text-lg mb-6 text-white">روابط هامة</h4>
                                <ul className="space-y-4 text-gray-400">
                                    <li><button onClick={() => setActiveTab("home")} className="hover:text-[#ff9900] transition-colors">الرئيسية</button></li>
                                    <li><button onClick={() => setActiveTab("sports")} className="hover:text-[#ff9900] transition-colors">الرياضات</button></li>
                                    <li><button onClick={() => setActiveTab("memberships")} className="hover:text-[#ff9900] transition-colors">الاشتراكات</button></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-6 text-white">تواصل معنا</h4>
                                <ul className="space-y-4 text-gray-400 text-sm">
                                    <li className="flex items-center gap-3">
                                        <MapPin className="w-4 h-4 text-[#ff9900]" />
                                        <a href="https://maps.app.goo.gl/QHexupLs17Y7u7rF6" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">الموقع على الخريطة</a>
                                    </li>
                                    <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-[#ff9900]" /> 1913641</li>
                                    <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-[#ff9900]" /> huc@hq.helwan.edu.eg</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-gray-500 text-sm">© {new Date().getFullYear()} نادي حلوان — جميع الحقوق محفوظة</p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#1877F2] transition-colors"><Facebook className="w-5 h-5" /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#E4405F] transition-colors"><Instagram className="w-5 h-5" /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#1DA1F2] transition-colors"><Twitter className="w-5 h-5" /></a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;
