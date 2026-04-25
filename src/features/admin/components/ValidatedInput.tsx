import type { InputHTMLAttributes } from 'react';
import { AlertCircle, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ValidatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    isValid?: boolean;
    showValidationIcon?: boolean;
    required?: boolean;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
    label,
    error,
    isValid,
    showValidationIcon = false,
    required = false,
    className = '',
    ...props
}) => {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 mr-1">*</span>}
                </label>
                {showValidationIcon && (
                    <div className="flex items-center gap-1">
                        {error ? (
                            <X size={14} className="text-red-500" />
                        ) : isValid ? (
                            <Check size={14} className="text-green-500" />
                        ) : null}
                    </div>
                )}
            </div>
            <input
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    error
                        ? 'border-red-500 bg-red-50'
                        : isValid
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300'
                } ${className}`}
                {...props}
            />
            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-1 text-red-500 text-xs"
                    >
                        <AlertCircle size={12} />
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
