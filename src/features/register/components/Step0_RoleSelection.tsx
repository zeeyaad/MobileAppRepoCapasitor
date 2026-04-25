import { Controller, useFormContext } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trophy, AlertCircle } from 'lucide-react';
import type { RegisterFormValues, MemberRole } from '../schemas/validation';

/**
 * Step 0: Role Selection
 * 
 * Allows user to choose between "Social Member" or "Sports Player"
 * Uses RHF Controller for guaranteed field registration and reactivity
 */
const Step0_RoleSelection = () => {
    const { control, formState: { errors } } = useFormContext<RegisterFormValues>();

    const roleOptions: {
        id: MemberRole;
        title: string;
        subtitle: string;
        description: string;
        icon: typeof Users;
        features: string[];
    }[] = [
            {
                id: 'social_member',
                title: 'عضو بالنادي',
                subtitle: 'Social Member',
                description: 'استمتع بجميع مرافق النادي الاجتماعية والترفيهية',
                icon: Users,
                features: ['المرافق الاجتماعية', 'حمام السباحة', 'الكافيتريا', 'الحدائق'],
            },
            {
                id: 'sports_player',
                title: 'لاعب',
                subtitle: 'Sports Player',
                description: 'انضم لفرق النادي الرياضية واحترف رياضتك المفضلة',
                icon: Trophy,
                features: ['التدريبات', 'المسابقات', 'المدربين', 'البطولات'],
            },
        ];

    return (
        <Controller
            name="memberRole"
            control={control}
            render={({ field }) => (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                >
                    {/* Section Title */}
                    <div className="text-center mb-5">
                        <h2 className="text-xl md:text-2xl font-bold text-[#1a5f7a] mb-1">
                            اختر نوع العضوية
                        </h2>
                        <p className="text-gray-500 text-xs md:text-sm">
                            حدد نوع العضوية المناسب لك
                        </p>
                    </div>

                    {/* Role Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {roleOptions.map((option) => {
                            const isSelected = field.value === option.id;
                            const Icon = option.icon;

                            return (
                                <motion.button
                                    key={option.id}
                                    type="button"
                                    onClick={() => field.onChange(option.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`
                                        relative p-4 md:p-5 rounded-3xl border-4 transition-all duration-300
                                        text-right cursor-pointer
                                        ${isSelected
                                            ? 'border-[#2596be] bg-[#e8f4f8] shadow-2xl ring-4 ring-[#2596be]/20'
                                            : 'border-gray-200 bg-white hover:border-gray-300 shadow-xl'
                                        }
                                    `}
                                >
                                    {/* Selected Badge */}
                                    {isSelected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
                                        >
                                            <span className="text-white font-bold">✓</span>
                                        </motion.div>
                                    )}

                                    {/* Icon */}
                                    <div className={`
                                        w-14 h-14 rounded-2xl flex items-center justify-center mb-3
                                        ${isSelected ? 'bg-[#e8f4f8] text-[#2596be]' : 'bg-gray-100 text-gray-500'}
                                    `}>
                                        <Icon size={28} />
                                    </div>

                                    {/* Content */}
                                    <h3 className={`text-lg md:text-xl font-bold mb-1 ${isSelected ? 'text-[#1a5f7a]' : 'text-gray-800'}`}>
                                        {option.title}
                                    </h3>
                                    <p className="text-xs text-gray-400 mb-3">{option.subtitle}</p>
                                    <p className="text-sm text-gray-600 mb-3">{option.description}</p>

                                    {/* Features */}
                                    <div className="flex flex-wrap gap-2">
                                        {option.features.map((feature) => (
                                            <span
                                                key={feature}
                                                className={`
                                                    text-xs px-2.5 py-1 rounded-full
                                                    ${isSelected
                                                        ? 'bg-[#e8f4f8] text-[#2596be]'
                                                        : 'bg-gray-100 text-gray-600'
                                                    }
                                                `}
                                            >
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {errors.memberRole && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center gap-2 text-red-500 text-sm"
                            >
                                <AlertCircle size={16} />
                                <span>{errors.memberRole.message}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Info Note for Player */}
                    <AnimatePresence>
                        {field.value === 'sports_player' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-[#2596be]/10 border border-[#2596be]/20 rounded-2xl p-3 text-[#1a5f7a] text-sm text-center"
                            >
                                🏆 يمكنك الانضمام للفرق الرياضية من خلال لوحة التحكم بعد إتمام التسجيل
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        />
    );
};

export default Step0_RoleSelection;
