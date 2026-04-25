import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { AuthService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export function CredentialChangeModal() {
    const [showModal, setShowModal] = useState(false);
    const [credentialForm, setCredentialForm] = useState({
        new_email: '',
        new_password: '',
        confirm_password: ''
    });
    const [credentialErrors, setCredentialErrors] = useState({
        new_email: '',
        new_password: '',
        confirm_password: ''
    });
    const [isChangingCredentials, setIsChangingCredentials] = useState(false);

    const { user } = useAuth();

    // Check localStorage on mount
    useEffect(() => {
        const requiresChange = localStorage.getItem('huc_requires_credential_change');
        // Don't show for admins even if flag exists
        if (requiresChange === 'true' && user?.role !== 'ADMIN') {
            setShowModal(true);
        }
    }, [user]);

    const handleCredentialChange = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset errors
        setCredentialErrors({
            new_email: '',
            new_password: '',
            confirm_password: ''
        });

        // Validation
        let hasError = false;
        const newErrors = { new_email: '', new_password: '', confirm_password: '' };

        if (!credentialForm.new_email) {
            newErrors.new_email = 'البريد الإلكتروني مطلوب';
            hasError = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentialForm.new_email)) {
            newErrors.new_email = 'البريد الإلكتروني غير صحيح';
            hasError = true;
        }

        if (!credentialForm.new_password) {
            newErrors.new_password = 'كلمة المرور مطلوبة';
            hasError = true;
        } else if (credentialForm.new_password.length < 6) {
            newErrors.new_password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
            hasError = true;
        }

        if (!credentialForm.confirm_password) {
            newErrors.confirm_password = 'تأكيد كلمة المرور مطلوب';
            hasError = true;
        } else if (credentialForm.new_password !== credentialForm.confirm_password) {
            newErrors.confirm_password = 'كلمات المرور غير متطابقة';
            hasError = true;
        }

        if (hasError) {
            setCredentialErrors(newErrors);
            return;
        }

        setIsChangingCredentials(true);

        try {
            await AuthService.changeCredentials({
                new_email: credentialForm.new_email,
                new_password: credentialForm.new_password
            });

            // Remove flag
            localStorage.removeItem('huc_requires_credential_change');

            // Close modal
            setShowModal(false);

            // Clear form
            setCredentialForm({
                new_email: '',
                new_password: '',
                confirm_password: ''
            });

            // Show success message
            alert('تم تغيير بيانات الدخول بنجاح! يرجى تسجيل الدخول مرة أخرى باستخدام البريد الإلكتروني وكلمة المرور الجديدة.');

            // Clear auth tokens and user data from localStorage
            localStorage.removeItem('huc_access_token');
            localStorage.removeItem('huc_user');
            localStorage.removeItem('huc_refresh_token');

            // Redirect to login page
            window.location.href = '/login';
        } catch (error: unknown) {
            console.error('Credential change error:', error);
            const errorMessage = error instanceof Error ? error.message : 'فشل تغيير بيانات الدخول';
            setCredentialErrors(prev => ({ ...prev, new_email: errorMessage }));
        } finally {
            setIsChangingCredentials(false);
        }
    };

    return (
        <AnimatePresence>
            {showModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
                        dir="rtl"
                    >
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">تغيير بيانات الدخول</h2>
                        </div>

                        <p className="text-gray-600 mb-6">
                            هذا هو تسجيل الدخول الأول. يرجى تغيير بريدك الإلكتروني وكلمة المرور.
                        </p>

                        <form onSubmit={handleCredentialChange}>
                            {/* New Email */}
                            <div className="mb-4">
                                <label htmlFor="new_email" className="block text-base text-gray-700 mb-2 font-medium">
                                    البريد الإلكتروني الجديد
                                </label>
                                <div className="relative">
                                    <input
                                        id="new_email"
                                        type="email"
                                        value={credentialForm.new_email}
                                        onChange={(e) => setCredentialForm(prev => ({ ...prev, new_email: e.target.value }))}
                                        placeholder="example@helwan.edu.eg"
                                        className={`w-full border ${credentialErrors.new_email ? 'border-red-500' : 'border-gray-200'} rounded-xl px-5 py-3 pr-12 text-base focus:outline-none focus:ring-2 ${credentialErrors.new_email ? 'focus:ring-red-500' : 'focus:ring-[#2596be]'} focus:border-transparent transition-all`}
                                    />
                                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                </div>
                                {credentialErrors.new_email && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {credentialErrors.new_email}
                                    </p>
                                )}
                            </div>

                            {/* New Password */}
                            <div className="mb-4">
                                <label htmlFor="new_password" className="block text-base text-gray-700 mb-2 font-medium">
                                    كلمة المرور الجديدة
                                </label>
                                <div className="relative">
                                    <input
                                        id="new_password"
                                        type="password"
                                        value={credentialForm.new_password}
                                        onChange={(e) => setCredentialForm(prev => ({ ...prev, new_password: e.target.value }))}
                                        placeholder="••••••••"
                                        className={`w-full border ${credentialErrors.new_password ? 'border-red-500' : 'border-gray-200'} rounded-xl px-5 py-3 pr-12 text-base focus:outline-none focus:ring-2 ${credentialErrors.new_password ? 'focus:ring-red-500' : 'focus:ring-[#2596be]'} focus:border-transparent transition-all`}
                                    />
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                </div>
                                {credentialErrors.new_password && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {credentialErrors.new_password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="mb-6">
                                <label htmlFor="confirm_password" className="block text-base text-gray-700 mb-2 font-medium">
                                    تأكيد كلمة المرور
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirm_password"
                                        type="password"
                                        value={credentialForm.confirm_password}
                                        onChange={(e) => setCredentialForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                                        placeholder="••••••••"
                                        className={`w-full border ${credentialErrors.confirm_password ? 'border-red-500' : 'border-gray-200'} rounded-xl px-5 py-3 pr-12 text-base focus:outline-none focus:ring-2 ${credentialErrors.confirm_password ? 'focus:ring-red-500' : 'focus:ring-[#2596be]'} focus:border-transparent transition-all`}
                                    />
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                </div>
                                {credentialErrors.confirm_password && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {credentialErrors.confirm_password}
                                    </p>
                                )}
                            </div>

                            {/* Buttons */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={isChangingCredentials}
                                    className="w-full bg-gradient-to-r from-[#2596be] to-[#0b2f8f] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {isChangingCredentials ? 'جارٍ التغيير...' : 'تغيير بيانات الدخول'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
