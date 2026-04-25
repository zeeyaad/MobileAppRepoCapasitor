import { Controller, useFormContext } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Check, Info, RefreshCw, Loader2, Clock3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchActiveSports, type Sport } from '../../../services/sportsApi';
import { AVAILABLE_SPORTS, type RegisterFormValues } from '../schemas/validation';

/**
 * Icon mapping for sports
 * Maps sport names to emoji icons
 */
const SPORT_ICON_MAP: Record<string, string> = {
    football: '⚽',
    basketball: '🏀',
    volleyball: '🏐',
    tennis: '🎾',
    swimming: '🏊',
    handball: '🤾',
    squash: '🎯',
    athletics: '🏃',
    'كرة القدم': '⚽',
    'كرة السلة': '🏀',
    'الكرة الطائرة': '🏐',
    'التنس': '🎾',
    'السباحة': '🏊',
    'كرة اليد': '🤾',
    'الاسكواش': '🎯',
    'ألعاب القوى': '🏃',
};

/**
 * Get icon for a sport based on name
 */
const getSportIcon = (sport: Sport): string => {
    // Try to match by name_en or name_ar
    const icon = SPORT_ICON_MAP[sport.name_en.toLowerCase()] ||
        SPORT_ICON_MAP[sport.name_ar] ||
        '🏆'; // Default icon
    return icon;
};

/**
 * Display sport with icon and label
 */
interface DisplaySport {
    id: string;
    label: string;
    icon: string;
}

/**
 * Convert API sport to display format
 */
const toDisplaySport = (sport: Sport): DisplaySport => ({
    id: sport.id.toString(),
    label: sport.name_ar,
    icon: getSportIcon(sport),
});

interface TimeSlot {
    id: string;
    label: string;
    timeRange: string;
}

const SPORT_TIME_SLOTS: TimeSlot[] = [
    { id: 'morning', label: 'صباحاً', timeRange: '09:00 ص - 11:00 ص' },
    { id: 'afternoon', label: 'ظهراً', timeRange: '01:00 م - 03:00 م' },
    { id: 'evening', label: 'مساءً', timeRange: '05:00 م - 07:00 م' },
    { id: 'night', label: 'ليلاً', timeRange: '08:00 م - 10:00 م' },
];

/**
 * Step 1: Sports Selection
 * 
 * Modern multi-select component for sports players to choose 1-4 sports
 * Now fetches sports dynamically from the backend API
 * Implements 2025-2026 UI/UX best practices:
 * - Bento Grid layout for visual hierarchy
 * - Strong visual feedback with clear states
 * - Accessibility-first design (WCAG 2.2 AA)
 * - Keyboard navigation support
 * - Error boundaries and clear constraints
 * - Loading states and error handling with retry
 */
const Step1_SportsSelection = () => {
    const { control, watch, setValue, formState: { errors } } = useFormContext<RegisterFormValues>();

    // State for sports data
    const [sports, setSports] = useState<DisplaySport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch sports from backend
    const loadSports = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const fetchedSports = await fetchActiveSports();
            const displaySports = fetchedSports.map(toDisplaySport);
            setSports(displaySports);
        } catch (err) {
            console.error('Failed to load sports:', err);
            setError(err instanceof Error ? err.message : 'فشل تحميل الرياضات');
            // Use fallback sports if API fails
            setSports(AVAILABLE_SPORTS.map(s => ({
                id: s.id,
                label: s.label,
                icon: s.icon
            })));
        } finally {
            setIsLoading(false);
        }
    };

    // Load sports on mount
    useEffect(() => {
        loadSports();
    }, []);

    return (
        <Controller
            name="selectedSports"
            control={control}
            render={({ field }) => {
                const selectedSports = field.value || [];
                const selectedSportTimes = (watch('sportTimeSelections') || {}) as Record<string, string>;
                const selectionCount = selectedSports.length;
                const hasSelection = selectionCount > 0;
                const isMaxReached = selectionCount >= 4;
                const selectedSportCards = sports.filter((sport) => selectedSports.includes(sport.id));

                const handleToggle = (sportId: string) => {
                    const currentSports = [...selectedSports];
                    const index = currentSports.indexOf(sportId);

                    if (index > -1) {
                        // Remove sport
                        currentSports.splice(index, 1);
                    } else if (currentSports.length < 4) {
                        // Add sport (max 4)
                        currentSports.push(sportId);
                    }

                    field.onChange(currentSports);

                    // Keep time selections only for currently selected sports
                    const cleanedTimeSelections = Object.fromEntries(
                        Object.entries(selectedSportTimes).filter(([selectedSportId]) =>
                            currentSports.includes(selectedSportId)
                        )
                    );
                    setValue('sportTimeSelections', cleanedTimeSelections, { shouldDirty: true });
                };

                const handleSportTimeSelect = (sportId: string, slotId: string) => {
                    setValue(
                        'sportTimeSelections',
                        { ...selectedSportTimes, [sportId]: slotId },
                        { shouldDirty: true }
                    );
                };

                const getSelectedSlotLabel = (slotId?: string): string => {
                    if (!slotId) return '';
                    return SPORT_TIME_SLOTS.find((slot) => slot.id === slotId)?.label || '';
                };

                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                        role="group"
                        aria-labelledby="sports-selection-title"
                    >
                        {/* Header Section */}
                        <div className="text-center space-y-4">
                            <div>
                                <h2
                                    id="sports-selection-title"
                                    className="text-3xl font-bold text-[#1a5f7a] mb-2"
                                >
                                    اختر الرياضات المفضلة
                                </h2>
                                <p className="text-gray-600 text-base">
                                    اختر من 1 إلى 4 رياضات للانضمام إليها
                                </p>
                            </div>

                            {/* Progress Indicator - Modern pill design */}
                            <motion.div
                                layout
                                className={`
                                    inline-flex items-center gap-3 px-6 py-3 rounded-full border-2
                                    transition-all duration-300
                                    ${hasSelection
                                        ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50'
                                        : 'border-gray-300 bg-gray-50'
                                    }
                                `}
                            >
                                <div className={`
                                    flex items-center justify-center w-8 h-8 rounded-full
                                    ${hasSelection ? 'bg-green-500' : 'bg-gray-300'}
                                `}>
                                    <span className="text-white font-bold text-sm">
                                        {selectionCount}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`
                                        font-bold text-lg
                                        ${hasSelection ? 'text-green-700' : 'text-gray-600'}
                                    `}>
                                        {selectionCount} / 4
                                    </span>
                                    <span className="text-gray-500 text-sm">رياضات</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <Loader2 size={48} className="text-[#2596be] animate-spin" />
                                <p className="text-gray-600 text-base">جاري تحميل الرياضات...</p>
                            </div>
                        )}

                        {/* Error State with Retry */}
                        {error && !isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center py-8 space-y-4"
                            >
                                <div className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-amber-50 border-2 border-amber-200">
                                    <AlertCircle size={24} className="text-amber-600 flex-shrink-0" />
                                    <div className="space-y-2">
                                        <p className="text-amber-800 font-medium">{error}</p>
                                        <p className="text-amber-600 text-sm">
                                            يتم عرض الرياضات الافتراضية. يمكنك المحاولة مرة أخرى.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={loadSports}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2596be] text-white font-medium hover:bg-[#1a5f7a] transition-colors focus:outline-none focus:ring-4 focus:ring-[#2596be]/40"
                                >
                                    <RefreshCw size={18} />
                                    <span>إعادة المحاولة</span>
                                </button>
                            </motion.div>
                        )}

                        {/* Sports Grid - Bento Grid Layout with 8-point spacing */}
                        {!isLoading && (
                            <div
                                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                                role="list"
                                aria-label="قائمة الرياضات المتاحة"
                            >
                                {sports.map((sport, index) => {
                                    const isSelected = selectedSports.includes(sport.id);
                                    const isDisabled = !isSelected && isMaxReached;

                                    return (
                                        <motion.button
                                            key={sport.id}
                                            type="button"
                                            onClick={() => !isDisabled && handleToggle(sport.id)}
                                            disabled={isDisabled}
                                            layout
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                            }}
                                            transition={{
                                                delay: index * 0.05,
                                                type: "spring",
                                                stiffness: 260,
                                                damping: 20
                                            }}
                                            whileHover={!isDisabled ? {
                                                scale: 1.05,
                                                y: -4,
                                            } : {}}
                                            whileTap={!isDisabled ? { scale: 0.95 } : {}}
                                            className={`
                                            relative group
                                            p-6 rounded-3xl
                                            flex flex-col items-center justify-center gap-4
                                            transition-all duration-300
                                            focus:outline-none focus:ring-4 focus:ring-offset-2
                                            ${isSelected
                                                    ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-4 border-green-500 shadow-2xl ring-4 ring-green-200 focus:ring-green-400'
                                                    : isDisabled
                                                        ? 'bg-gray-50 border-2 border-gray-200 opacity-40 cursor-not-allowed'
                                                        : 'bg-white border-2 border-gray-200 shadow-lg hover:border-green-300 hover:shadow-xl focus:ring-[#2596be]/40'
                                                }
                                        `}
                                            role="listitem"
                                            aria-pressed={isSelected}
                                            aria-label={`${sport.label}${isSelected ? ' - محدد' : ''}${isDisabled ? ' - غير متاح' : ''}`}
                                            aria-disabled={isDisabled}
                                            tabIndex={isDisabled ? -1 : 0}
                                        >
                                            {/* Selection Badge - Top-left with animation */}
                                            <AnimatePresence>
                                                {isSelected && (
                                                    <motion.div
                                                        initial={{ scale: 0, rotate: -180 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        exit={{ scale: 0, rotate: 180 }}
                                                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                                        className="absolute -top-2 -left-2 w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shadow-xl ring-2 ring-white z-10"
                                                    >
                                                        <Check size={18} className="text-white" strokeWidth={3} />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Sport Icon - Large and prominent */}
                                            <div className={`
                                            text-5xl transition-all duration-300
                                            ${isSelected
                                                    ? 'scale-110 drop-shadow-lg'
                                                    : isDisabled
                                                        ? 'grayscale opacity-50'
                                                        : 'group-hover:scale-110'
                                                }
                                        `}>
                                                {sport.icon}
                                            </div>

                                            {/* Sport Label */}
                                            <span className={`
                                            text-base font-bold text-center
                                            transition-colors duration-300
                                            ${isSelected
                                                    ? 'text-green-800'
                                                    : isDisabled
                                                        ? 'text-gray-400'
                                                        : 'text-gray-700'
                                                }
                                        `}>
                                                {sport.label}
                                            </span>

                                            {/* Disabled overlay message */}
                                            {isDisabled && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-3xl">
                                                    <span className="text-xs font-semibold text-gray-500 px-3 py-1 bg-white rounded-full shadow">
                                                        الحد الأقصى
                                                    </span>
                                                </div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Available Times Section */}
                        {!isLoading && hasSelection && (
                            <motion.section
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-3xl border border-[#2596be]/25 bg-gradient-to-b from-[#f5fbfe] to-white p-5 md:p-6 space-y-4"
                                aria-label="الأوقات المتاحة للرياضات المختارة"
                            >
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <Clock3 size={20} className="text-[#1a5f7a]" />
                                        <h3 className="text-xl font-bold text-[#1a5f7a]">الأوقات المتاحة</h3>
                                    </div>
                                    <span className="text-sm text-[#2596be] font-medium">
                                        اختر موعداً واحداً لكل رياضة
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {selectedSportCards.map((sport) => (
                                        <div key={sport.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                                            <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{sport.icon}</span>
                                                    <span className="font-bold text-gray-800">{sport.label}</span>
                                                </div>
                                                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${selectedSportTimes[sport.id]
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {selectedSportTimes[sport.id]
                                                        ? `تم اختيار: ${getSelectedSlotLabel(selectedSportTimes[sport.id])}`
                                                        : 'لم يتم اختيار موعد بعد'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                                {SPORT_TIME_SLOTS.map((slot) => {
                                                    const isChosen = selectedSportTimes[sport.id] === slot.id;
                                                    return (
                                                        <button
                                                            key={`${sport.id}-${slot.id}`}
                                                            type="button"
                                                            onClick={() => handleSportTimeSelect(sport.id, slot.id)}
                                                            className={`rounded-xl border px-3 py-2 text-right transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2596be]/40 ${isChosen
                                                                ? 'border-[#2596be] bg-[#2596be] text-white shadow'
                                                                : 'border-gray-200 bg-white text-gray-700 hover:border-[#2596be]/50 hover:bg-[#f0f9ff]'
                                                                }`}
                                                            aria-pressed={isChosen}
                                                        >
                                                            <span className="block text-sm font-bold">{slot.label}</span>
                                                            <span className={`block text-xs ${isChosen ? 'text-white/90' : 'text-gray-500'}`}>
                                                                {slot.timeRange}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* Error Message - WCAG 2.2 AA compliant */}
                        <AnimatePresence>
                            {errors.selectedSports && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    role="alert"
                                    aria-live="assertive"
                                    className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-50 border-2 border-red-200"
                                >
                                    <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                                    <span className="text-red-700 font-medium text-sm">
                                        {errors.selectedSports.message}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Info Banner - Contextual help */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-start gap-3 p-5 rounded-2xl bg-gradient-to-r from-[#e8f4f8] to-blue-50 border border-[#2596be]/30"
                        >
                            <Info size={20} className="text-[#2596be] flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-[#1a5f7a] font-medium text-sm">
                                    💡 نصيحة مفيدة
                                </p>
                                <p className="text-[#2596be]/80 text-sm leading-relaxed">
                                    اختر الرياضات التي تفضلها، ثم حدد الموعد المناسب لكل رياضة من الأوقات المتاحة.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div >
                );
            }}
        />
    );
};

export default Step1_SportsSelection;
