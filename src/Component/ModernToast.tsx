// components/ui/ModernToast.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error';

interface ToastProps {
    message: string;
    type: ToastType;
    isVisible: boolean;
    onClose: () => void;
}

export const ModernToast = ({ message, type, isVisible, onClose }: ToastProps) => {
    // Auto-dismiss after 5 seconds
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 min-w-[320px] max-w-md"
                >
                    {/* Main Glass Card */}
                    <div className={`
            relative w-full overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-xl
            ${type === 'success'
                            ? 'bg-emerald-50/80 border-emerald-200/50 shadow-emerald-500/10'
                            : 'bg-red-50/80 border-red-200/50 shadow-red-500/10'
                        }
          `}>
                        {/* Ambient Glow Effect */}
                        <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-40
              ${type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`}
                        />

                        <div className="relative flex items-start gap-4" dir="rtl">
                            {/* Icon Container */}
                            <div className={`p-2 rounded-xl shrink-0 ${type === 'success' ? 'bg-emerald-100/50 text-emerald-600' : 'bg-red-100/50 text-red-600'
                                }`}>
                                {type === 'success' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                            </div>

                            {/* Text Content */}
                            <div className="flex-1 pt-0.5">
                                <h4 className={`font-bold text-base mb-0.5 ${type === 'success' ? 'text-emerald-900' : 'text-red-900'
                                    }`}>
                                    {type === 'success' ? 'تمت العملية بنجاح' : 'حدث خطأ'}
                                </h4>
                                <p className={`text-sm leading-relaxed ${type === 'success' ? 'text-emerald-700' : 'text-red-700'
                                    }`}>
                                    {message}
                                </p>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className={`p-1 rounded-lg transition-colors ${type === 'success' ? 'hover:bg-emerald-200/50 text-emerald-600' : 'hover:bg-red-200/50 text-red-600'
                                    }`}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Progress Bar (Optional nice touch) */}
                        <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 5, ease: "linear" }}
                            className={`absolute bottom-0 right-0 h-1 ${type === 'success' ? 'bg-emerald-500/30' : 'bg-red-500/30'
                                }`}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};