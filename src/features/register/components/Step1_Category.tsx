import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
    Briefcase,
    GraduationCap,
    UserCheck,
    Plane,
    Users,
    HeartHandshake,
} from 'lucide-react';
import type { RegisterFormValues } from '../schemas/validation';

interface Step1CategoryProps {
    onNext: () => void;
}

/**
 * Step 1: Category Selection
 * 
 * Allows users to select their membership category.
 * Uses form context to set the category value and trigger navigation.
 */
export const Step1Category = ({ onNext }: Step1CategoryProps) => {
    const { watch, setValue } = useFormContext<RegisterFormValues>();
    const category = watch('category');

    const handleCategorySelect = (selectedCategory: RegisterFormValues['category']) => {
        console.log('📍 Step1Category.handleCategorySelect:', {
            selectedCategory,
            timestamp: new Date().toISOString()
        });
        setValue('category', selectedCategory);
        onNext();
    };

    const categories = [
        {
            id: 'staff' as const,
            icon: Briefcase,
            color: 'blue',
            title: 'عامل بالجامعة',
            desc: 'أعضاء هيئة التدريس والموظفين',
        },
        {
            id: 'student' as const,
            icon: GraduationCap,
            color: 'emerald',
            title: 'طالب / خريج',
            desc: 'الطلاب والخريجين',
        },
        {
            id: 'retired' as const,
            icon: UserCheck,
            color: 'purple',
            title: 'متقاعد',
            desc: 'أساتذة وموظفين متقاعدين',
        },
        {
            id: 'dependent' as const,
            icon: HeartHandshake,
            color: 'pink',
            title: 'عضو تابع',
            desc: 'أسرة الأعضاء (زوجة/أبناء)',
        },
        {
            id: 'foreigner' as const,
            icon: Plane,
            color: 'orange',
            title: 'أجنبي / موسمي',
            desc: 'لغير المصريين (مدد محددة)',
        },
        {
            id: 'visitor' as const,
            icon: Users,
            color: 'gray',
            title: 'عضو زائر',
            desc: 'عضويات عامة',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
            {categories.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    onClick={() => handleCategorySelect(item.id)}
                    className={`group relative flex flex-col items-center p-6 rounded-3xl transition-all duration-300 border-2
            bg-white hover:shadow-xl hover:-translate-y-1
            ${category === item.id ? 'border-[#2596be] ring-2 ring-[#2596be]/10 shadow-lg' : 'border-transparent shadow-sm hover:border-[#2596be]/40'}`}
                >
                    <div className={`w-20 h-20 mb-4 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 bg-${item.color}-50`}>
                        <item.icon className={`w-10 h-10 text-${item.color}-600`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm text-center leading-relaxed">{item.desc}</p>
                </button>
            ))}
        </motion.div>
    );
};
