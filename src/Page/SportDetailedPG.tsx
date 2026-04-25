import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface Sport {
    id: string;
    nameAr: string;
    descriptionAr: string;
    foundedYear: number;
    players: number;
    coaches: number;
    courts: number;
    image: string;
    heroImage: string;
    achievements: Achievement[];
    facilities: Facility[];
}

interface Achievement {
    id: number;
    year: string;
    titleAr: string;
    descriptionAr: string;
}

interface Facility {
    id: number;
    nameAr: string;
    size: string;
    image: string;
    descriptionAr: string;
}

const SportDetailedPG: React.FC = () => {
  const { t, i18n } = useTranslation("landing");
    const asset = (name: string) => `/assets/${name}`;
    const isRTL = i18n.dir() === 'rtl';
    const [selectedSport, setSelectedSport] = useState<string>('football');
    const [selectedClub, setSelectedClub] = useState<string>('maadi');
    const [currentAchievementIndex, setCurrentAchievementIndex] = useState(0);
    const [currentFacilityIndex, setCurrentFacilityIndex] = useState(0);
    const [email, setEmail] = useState<string>('');

    const sports: Record<string, Sport> = {
        football: {
            id: 'football',
            nameAr: 'كرة القدم',
            descriptionAr: 'أكاديمية كرة القدم من أكبر الأكاديميات في المنطقة. يبدأ الاشتراك من سن 4 سنوات للجنسين. يتم تقييم اللاعبين بشكل ربع سنوي',
            foundedYear: 2003,
            players: 4261,
            coaches: 112,
            courts: 30,
            image: asset('club.png'),
            heroImage: asset('club.png'),
            achievements: [
                {
                    id: 1,
                    year: '2015 - 2016',
                    titleAr: 'بطولة القاهرة',
                    descriptionAr: 'المركز الأول'
                },
                {
                    id: 2,
                    year: '2015 - 2016',
                    titleAr: 'كأس مصر',
                    descriptionAr: 'المركز الثاني - فريق U2003'
                },
                {
                    id: 3,
                    year: '2015 - 2016',
                    titleAr: 'دوري الناشئين',
                    descriptionAr: 'المركز الثاني - فريق U2004'
                },
                {
                    id: 4,
                    year: '2016 - 2017',
                    titleAr: 'بطولة القاهرة',
                    descriptionAr: 'المركز الأول - فريق U2003'
                },
                {
                    id: 5,
                    year: '2016 - 2017',
                    titleAr: 'دوري الناشئين',
                    descriptionAr: 'المركز الثاني - فريق U2004'
                },
                {
                    id: 6,
                    year: '2016',
                    titleAr: 'كأس مصر',
                    descriptionAr: 'المركز الثاني - فريق U2004'
                }
            ],
            facilities: [
                {
                    id: 1,
                    nameAr: 'ملعب كرة القدم',
                    size: '6,440 م²',
                    image: asset('club.png'),
                    descriptionAr: 'ملعب كرة قدم احترافي برؤية 360 درجة'
                },
                {
                    id: 2,
                    nameAr: 'أرضية التدريب',
                    size: '5,000 م²',
                    image: asset('club.png'),
                    descriptionAr: 'مرافق تدريب متقدمة'
                },
                {
                    id: 3,
                    nameAr: 'مركز الأكاديمية',
                    size: '3,500 م²',
                    image: asset('club.png'),
                    descriptionAr: 'مركز تدريب أكاديمي حديث'
                }
            ]
        },
        swimming: {
            id: 'swimming',
            nameAr: 'السباحة',
            descriptionAr: 'مرافق سباحة حديثة بمعايير أولمبية',
            foundedYear: 2005,
            players: 2150,
            coaches: 45,
            courts: 5,
            image: asset('club.png'),
            heroImage: asset('club.png'),
            achievements: [
                {
                    id: 1,
                    year: '2018 - 2019',
                    titleAr: 'البطولة الوطنية',
                    descriptionAr: 'المركز الأول'
                },
                {
                    id: 2,
                    year: '2019 - 2020',
                    titleAr: 'المنافسة الإقليمية',
                    descriptionAr: 'المركز الثاني'
                }
            ],
            facilities: [
                {
                    id: 1,
                    nameAr: 'حمام السباحة الأولمبي',
                    size: '2,500 م²',
                    image: asset('club.png'),
                    descriptionAr: 'حمام سباحة بمعايير أولمبية'
                }
            ]
        }
    };

    const clubs = [
        { id: 'maadi', nameAr: 'المعادي' },
        { id: 'manshiyat', nameAr: 'منشية ناصر' },
        { id: 'matarya', nameAr: 'مطرية' }
    ];

    const currentSport = sports[selectedSport];

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`شكراً لاشتراكك! سنرسل لك آخر الأخبار على: ${email}`);
        setEmail('');
    };

    const nextAchievement = () => {
        setCurrentAchievementIndex((prev) => (prev + 1) % currentSport.achievements.length);
    };

    const prevAchievement = () => {
        setCurrentAchievementIndex((prev) => (prev - 1 + currentSport.achievements.length) % currentSport.achievements.length);
    };

    const nextFacility = () => {
        setCurrentFacilityIndex((prev) => (prev + 1) % currentSport.facilities.length);
    };

    const prevFacility = () => {
        setCurrentFacilityIndex((prev) => (prev - 1 + currentSport.facilities.length) % currentSport.facilities.length);
    };

    return (
        <div className="font-cairo bg-gray-50" >
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-[#0e1c38] min-h-screen flex items-center">
                <div className="absolute inset-0">
                    <img
                        src={currentSport.heroImage}
                        alt={t(`sports.info.${currentSport.id}.name`, currentSport.nameAr)}
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0e1c38] via-[#0e1c38]/80 to-transparent"></div>
                </div>

                <div className="relative z-10 container mx-auto px-4 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="text-white order-2 lg:order-1">
                            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
                                {t("sports.academy_title", "أكاديمية جامعة العاصمة {{sport}}", { sport: t(`sports.info.${currentSport.id}.name`, currentSport.nameAr) })}
                            </h1>
                            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                                {t(`sports.info.${currentSport.id}.desc`, currentSport.descriptionAr)}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <button onClick={() => window.location.href = '/re'} className="bg-[#FDBF00] hover:bg-[#ffd700] text-[#0e1c38] px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto">
                                    {t("sports.cta.become_member", "كن عضواً")}
                                </button>
                                <button className="border-2 border-white text-white hover:bg-white/10 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all duration-300 w-full sm:w-auto">
                                    {t("sports.cta.contact", "تواصل معنا")}
                                </button>
                            </div>
                        </div>

                        {/* Right - Dropdowns */}
                        <div className="space-y-6 order-1 lg:order-2">
                            {/* Sport Dropdown */}
                            <div className="relative">
                                <select
                                    value={selectedSport}
                                    onChange={(e) => setSelectedSport(e.target.value)}
                                    className="w-full bg-[#0A1A44] border-2 border-[#FDBF00] text-white px-6 py-4 rounded-full font-bold text-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FDBF00]"
                                >
                                    <option value="football">{t("sports.names.football", "كرة القدم")}</option>
                                    <option value="swimming">{t("sports.names.swimming", "السباحة")}</option>
                                </select>
                                <ChevronDown className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-[#FDBF00] pointer-events-none`} />
                            </div>

                            {/* Club Dropdown */}
                            <div className="relative">
                                <select
                                    value={selectedClub}
                                    onChange={(e) => setSelectedClub(e.target.value)}
                                    className="w-full bg-[#0A1A44] border-2 border-[#FDBF00] text-white px-6 py-4 rounded-full font-bold text-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FDBF00]"
                                >
                                    {clubs.map((club) => (
                                        <option key={club.id} value={club.id}>{t(`clubs.names.${club.id}`, club.nameAr)}</option>
                                    ))}
                                </select>
                                <ChevronDown className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-[#FDBF00] pointer-events-none`} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left - Description */}
                        <div className="order-2 lg:order-1">
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">{t(`sports.info.${currentSport.id}.name`, currentSport.nameAr)}</h2>
                            <p className="text-gray-700 text-lg leading-relaxed mb-8">
                                {t(`sports.info.${currentSport.id}.desc`, currentSport.descriptionAr)}
                            </p>
                            <button onClick={() => window.location.href = '/re'} className="bg-[#FDBF00] hover:bg-[#ffd700] text-[#0e1c38] px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                                {t("sports.cta.become_member", "كن عضواً")}
                            </button>
                        </div>

                        {/* Right - Stats */}
                        <div className="grid grid-cols-2 gap-8 order-1 lg:order-2">
                            {/* Starting Year */}
                            <div className="relative">
                                <div className="text-6xl font-extrabold text-[#FDBF00] mb-2">
                                    {currentSport.foundedYear}
                                </div>
                                <div className="text-gray-600 font-semibold text-lg">{t("sports.stats.founded", "سنة التأسيس")}</div>
                            </div>

                            {/* Players */}
                            <div className="relative">
                                <div className="text-6xl font-extrabold text-[#FDBF00] mb-2">
                                    {currentSport.players.toLocaleString()}
                                </div>
                                <div className="text-gray-600 font-semibold text-lg">{t("sports.stats.players", "لاعب")}</div>
                            </div>

                            {/* Coaches */}
                            <div className="relative">
                                <div className="text-6xl font-extrabold text-[#FDBF00] mb-2">
                                    {currentSport.coaches}
                                </div>
                                <div className="text-gray-600 font-semibold text-lg">{t("sports.stats.coaches", "مدرب")}</div>
                            </div>

                            {/* Courts */}
                            <div className="relative">
                                <div className="text-6xl font-extrabold text-[#FDBF00] mb-2">
                                    {currentSport.courts}
                                </div>
                                <div className="text-gray-600 font-semibold text-lg">{t("sports.stats.court", "ملعب")}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* History/Achievements Timeline Section */}
            <section className="py-24 bg-gray-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <img
                        src={currentSport.heroImage}
                        alt="background"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="relative z-10 container mx-auto px-4">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            {t("sports.history_title", "سجل أكاديمية جامعة العاصمة {{sport}}", { sport: t(`sports.info.${currentSport.id}.name`, currentSport.nameAr) })}
                        </h2>
                        <p className="text-gray-300 text-lg">
                            {t("sports.history_subtitle", "أفضل الإنجازات لأكاديمية جامعة العاصمة {{sport}}", { sport: t(`sports.info.${currentSport.id}.name`, currentSport.nameAr) })}
                        </p>
                    </div>

                    {/* Timeline Carousel */}
                    <div className="relative max-w-5xl mx-auto">
                        <div className="flex items-center justify-between gap-4 md:gap-8">
                            {/* Left Arrow */}
                            <button
                                onClick={nextAchievement}
                                className="flex-shrink-0 bg-[#FDBF00] hover:bg-[#ffd700] text-[#0e1c38] p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Timeline Items */}
                            <div className="flex-1 overflow-hidden">
                                <div className="relative h-64 flex items-center justify-center">
                                    {currentSport.achievements.map((achievement, index) => (
                                        <div
                                            key={achievement.id}
                                            className={`absolute w-full md:w-4/5 transition-all duration-500 ${index === currentAchievementIndex
                                                ? 'opacity-100 scale-100 z-20'
                                                : 'opacity-0 scale-75 z-0'
                                                }`}
                                        >
                                            <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg border border-white/30 rounded-3xl p-8 md:p-12 text-white text-center shadow-2xl">
                                                <div className="bg-[#FDBF00] text-[#0e1c38] font-bold text-lg md:text-xl px-6 py-2 rounded-full inline-block mb-6">
                                                    {achievement.year}
                                                </div>
                                                <h3 className="text-2xl md:text-3xl font-bold mb-4">{t(`sports.info.${currentSport.id}.achievements.${achievement.id}.title`, achievement.titleAr)}</h3>
                                                <p className="text-gray-200 text-lg">{t(`sports.info.${currentSport.id}.achievements.${achievement.id}.desc`, achievement.descriptionAr)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Arrow */}
                            <button
                                onClick={prevAchievement}
                                className="flex-shrink-0 bg-[#FDBF00] hover:bg-[#ffd700] text-[#0e1c38] p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                        </div>

                        {/* Dots Navigation */}
                        <div className="flex justify-center gap-3 mt-12">
                            {currentSport.achievements.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentAchievementIndex(index)}
                                    className={`transition-all duration-300 rounded-full ${index === currentAchievementIndex
                                        ? 'bg-[#FDBF00] w-8 h-3'
                                        : 'bg-white/40 w-3 h-3 hover:bg-white/60'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Facilities Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t("sports.facilities.title", "مرافقنا")}</h2>
                        <p className="text-gray-600 text-lg">
                            {t("sports.facilities.subtitle", "مرافق حديثة للتدريب والمنافسة")}
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="relative">
                            {/* Facility Image */}
                            <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl mb-8">
                                <img
                                    src={currentSport.facilities[currentFacilityIndex].image}
                                    alt={t(`sports.info.${currentSport.id}.facilities.${currentSport.facilities[currentFacilityIndex].id}.name`, currentSport.facilities[currentFacilityIndex].nameAr)}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                                {/* Select Club Dropdown */}
                                <div className="absolute top-6 left-6 right-6 z-10">
                                    <select
                                        value={selectedClub}
                                        onChange={(e) => setSelectedClub(e.target.value)}
                                        className="w-full md:w-64 bg-[#0A1A44] border-2 border-[#FDBF00] text-white px-6 py-3 rounded-full font-bold text-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FDBF00]"
                                    >
                                        {clubs.map((club) => (
                                            <option key={club.id} value={club.id}>{t(`clubs.names.${club.id}`, club.nameAr)}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Navigation Arrows */}
                                <button
                                    onClick={prevFacility}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={nextFacility}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>

                                {/* Facility Info */}
                                <div className="absolute bottom-6 left-6 right-6 text-white">
                                    <h3 className="text-3xl font-bold mb-2">
                                        {t(`sports.info.${currentSport.id}.facilities.${currentSport.facilities[currentFacilityIndex].id}.name`, currentSport.facilities[currentFacilityIndex].nameAr)}
                                    </h3>
                                    <p className="text-white/90">
                                        {t("sports.facilities.size", "بحجم {{size}}", { size: currentSport.facilities[currentFacilityIndex].size })}
                                    </p>
                                </div>
                            </div>

                            {/* Facility Description */}
                            <div className="bg-gray-50 rounded-2xl p-8 text-center">
                                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                                    {t(`sports.info.${currentSport.id}.facilities.${currentSport.facilities[currentFacilityIndex].id}.desc`, currentSport.facilities[currentFacilityIndex].descriptionAr)}
                                </p>
                                <div className="flex justify-center gap-4">
                                    {currentSport.facilities.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentFacilityIndex(index)}
                                            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentFacilityIndex ? 'bg-[#0e1c38] w-8' : 'bg-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-20 bg-gradient-to-r from-[#0e1c38] to-[#0A1A44]">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <div className="mb-8">
                            <svg className="w-20 h-20 mx-auto mb-6 text-[#FDBF00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("sports.subscribe.title", "اشترك في النشرة الإخبارية")}</h2>
                        <p className="text-xl text-white/90 mb-8 leading-relaxed">
                            {t("sports.subscribe.subtitle", "احصل على آخر الأخبار والتحديثات عن أكاديميتنا الرياضية")}
                        </p>
                        <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-4 max-w-2xl mx-auto">
                            <input
                                type="email"
                                placeholder={t("sports.subscribe.placeholder", "أدخل بريدك الالكتروني")}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-6 py-4 rounded-full bg-white text-gray-900 text-lg outline-none border-2 border-white/60 focus:ring-4 focus:ring-[#FDBF00]/30 focus:border-[#FDBF00] placeholder:text-gray-400"
                                required
                            />
                            <button
                                type="submit"
                                className="bg-[#FDBF00] hover:bg-[#ffd700] text-[#0e1c38] px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 w-auto self-center"
                            >{t("sports.subscribe.button", "اشترك الآن")}</button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {/* Phone */}
                        <div className="bg-gradient-to-br from-[#0e1c38] to-[#0A1A44] rounded-2xl p-8 text-white text-center">
                            <div className="text-4xl mb-4">📞</div>
                            <h3 className="text-xl font-bold mb-3">{t("sports.contact.phone", "الهاتف")}</h3>
                            <a href="tel:1913641" className="text-[#FDBF00] hover:text-[#ffd700] font-bold text-lg">
                                1913641
                            </a>
                        </div>

                        {/* Email */}
                        <div className="bg-gradient-to-br from-[#0e1c38] to-[#0A1A44] rounded-2xl p-8 text-white text-center">
                            <div className="text-4xl mb-4">✉️</div>
                            <h3 className="text-xl font-bold mb-3">{t("sports.contact.email", "البريد الإلكتروني")}</h3>
                            <a href="mailto:huc@hq.helwan.edu.eg" className="text-[#FDBF00] hover:text-[#ffd700] font-bold text-lg">
                                huc@hq.helwan.edu.eg
                            </a>
                        </div>

                        {/* Location */}
                        <div className="bg-gradient-to-br from-[#0e1c38] to-[#0A1A44] rounded-2xl p-8 text-white text-center">
                            <div className="text-4xl mb-4">📍</div>
                            <h3 className="text-xl font-bold mb-3">{t("sports.contact.location", "الموقع")}</h3>
                            <a href="https://maps.app.goo.gl/QHexupLs17Y7u7rF6" target="_blank" rel="noopener noreferrer" className="text-[#FDBF00] font-bold hover:text-[#ffd700] transition-colors">
                                {t("sports.contact.map", "الموقع على الخريطة")}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-[#0e1c38]">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto text-white">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("sports.cta.title", "هل أنت مستعد للانضمام إلينا؟")}</h2>
                        <p className="text-xl text-white/90 mb-8 leading-relaxed">
                            {t("sports.cta.subtitle", "ابدأ رحلتك الرياضية مع أكاديمية جامعة العاصمة اليوم")}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={() => window.location.href = '/re'} className="bg-[#FDBF00] hover:bg-[#ffd700] text-[#0e1c38] px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                                {t("sports.cta.become_member", "كن عضواً")}
                            </button>
                            <button className="bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 border-2 border-white/40 backdrop-blur-sm hover:border-white/60">
                                {t("sports.cta.contact", "تواصل معنا")}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SportDetailedPG;
