import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mail, ArrowLeft, CheckCircle, Users, UserCheck, Shield, X } from 'lucide-react';

// ========================================
// SECURITY UTILITIES
// ========================================

/**
 * Input Sanitization Utility
 * Strips dangerous characters to prevent XSS attacks
 */
const sanitizeInput = (input: string): string => {
    return input
        .replace(/[<>'"\/\\]/g, '') // Remove dangerous characters
        .trim();
};

/**
 * Email Masking Utility
 * Masks email addresses for privacy protection (anti-shoulder surfing)
 * Example: ahmed.ali@gmail.com -> ah****@gmail.com
 */
const maskEmail = (email: string): string => {
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return email;

    const visibleChars = Math.min(2, localPart.length);
    const masked = localPart.substring(0, visibleChars) + '****';
    return `${masked}@${domain}`;
};

// ========================================
// SUB-COMPONENTS
// ========================================

// InviteHeader Sub-Component
const InviteHeader: React.FC = () => {
    return (
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0e1c38] mb-2">
                Invite Family Member
            </h1>
            <p className="text-slate-600 text-base">
                Add your dependents to manage their memberships
            </p>
        </div>
    );
};

// InviteForm Sub-Component
interface InviteFormProps {
    email: string;
    setEmail: (email: string) => void;
    isLoading: boolean;
    isRateLimited: boolean;
    countdown: number;
    onSubmit: (e: React.FormEvent) => void;
}

const InviteForm: React.FC<InviteFormProps> = ({
    email,
    setEmail,
    isLoading,
    isRateLimited,
    countdown,
    onSubmit
}) => {
    // Handle input with sanitization
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitized = sanitizeInput(e.target.value);
        setEmail(sanitized);
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Email Input Field */}
            <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-[#0e1c38]">
                    Email Address
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
                    </div>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                        className="block w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2596be]/20 focus:border-[#2596be] transition-all"
                        placeholder="member@example.com"
                        required
                        aria-label="Member email address"
                        disabled={isRateLimited}
                    />
                    {email && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        >
                            <Send className="h-5 w-5 text-[#2596be]" aria-hidden="true" />
                        </motion.div>
                    )}
                </div>
                <p className="text-sm text-slate-500 mt-2">
                    An invitation email will be sent to this address
                </p>
            </div>

            {/* Submit Button with Rate Limiting */}
            <button
                type="submit"
                disabled={isLoading || !email || isRateLimited}
                className="w-full py-3.5 px-6 bg-[#2596be] hover:bg-[#1e7a9d] text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2596be] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] flex items-center justify-center gap-2"
                aria-label="Send invitation"
            >
                {isLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending Invitation...
                    </>
                ) : isRateLimited ? (
                    <>
                        <Shield className="h-5 w-5" />
                        Wait {countdown}s
                    </>
                ) : (
                    <>
                        <Send className="h-5 w-5" />
                        Send Invitation
                    </>
                )}
            </button>

            {/* Rate Limit Notice */}
            {isRateLimited && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-amber-50 border border-amber-200 rounded-lg"
                >
                    <p className="text-sm text-amber-800 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Rate limit active. Please wait {countdown} seconds before sending another invitation.
                    </p>
                </motion.div>
            )}
        </form>
    );
};

// ========================================
// MAIN COMPONENT
// ========================================

const InviteMemberPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isRateLimited, setIsRateLimited] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [showSecurityNotice, setShowSecurityNotice] = useState(true);

    // Rate Limiting Countdown
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isRateLimited && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0) {
            setIsRateLimited(false);
            setCountdown(30);
        }
        return () => clearTimeout(timer);
    }, [isRateLimited, countdown]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setShowSuccess(true);

            // Activate rate limiting after successful submission
            setIsRateLimited(true);
            setCountdown(30);
        }, 1500);
    };

    const handleAnotherInvite = () => {
        setEmail('');
        setShowSuccess(false);
    };

    const handleBack = () => {
        window.history.back();
    };

    // Fake family members data with different roles
    const familyMembers = [
        { id: 1, name: 'Mohamed Ali', email: 'mohamed.ali@example.com', role: 'Admin', status: 'Active', isAdmin: true },
        { id: 2, name: 'Fatima Ali', email: 'fatima.ali@example.com', role: 'Parent', status: 'Active', isParent: true },
        { id: 3, name: 'Ahmed Mohamed', email: 'ahmed.m@example.com', role: 'Member', status: 'Active', isAdmin: false, isParent: false },
        { id: 4, name: 'Sara Hassan', email: 'sara.h@example.com', role: 'Member', status: 'Pending', isAdmin: false, isParent: false },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-slate-600 hover:text-[#2596be] transition-colors font-medium mb-6 group"
                    aria-label="Go back"
                >
                    <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                    <span>Back</span>
                </button>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
                >
                    <InviteHeader />

                    {showSuccess ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-12 text-center"
                        >
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-[#0e1c38] mb-2">
                                Invitation Processed
                            </h3>
                            {/* GENERIC FEEDBACK - Anti-Enumeration */}
                            <p className="text-slate-600 mb-6">
                                If the email is valid, an invitation has been sent.
                            </p>
                            <button
                                onClick={handleAnotherInvite}
                                disabled={isRateLimited}
                                className="px-6 py-3 bg-[#2596be] hover:bg-[#1e7a9d] text-white font-semibold rounded-xl transition-all transform active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="h-4 w-4" />
                                {isRateLimited ? `Wait ${countdown}s` : 'Another invite?'}
                            </button>
                        </motion.div>
                    ) : (
                        <InviteForm
                            email={email}
                            setEmail={setEmail}
                            isLoading={isLoading}
                            isRateLimited={isRateLimited}
                            countdown={countdown}
                            onSubmit={handleSubmit}
                        />
                    )}
                </motion.div>

                {/* Family Members List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="mt-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-[#2596be]" />
                            <h3 className="text-lg font-bold text-[#0e1c38]">
                                Family Members
                            </h3>
                        </div>
                        <span className="text-sm text-slate-500 font-medium">
                            {familyMembers.length} members
                        </span>
                    </div>

                    <div className="space-y-3">
                        {familyMembers.map((member) => (
                            <div
                                key={member.id}
                                onClick={() => {
                                    // Don't allow clicking on admin
                                    if (member.isAdmin) return;

                                    const params = new URLSearchParams({
                                        id: member.id.toString(),
                                        name: member.name,
                                        email: member.email,
                                        status: member.status,
                                        role: member.role
                                    });
                                    window.location.href = `/family-member?${params.toString()}`;
                                }}
                                className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-4 transition-all ${member.isAdmin
                                    ? 'cursor-default'
                                    : 'cursor-pointer hover:shadow-md hover:border-[#2596be]/30'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${member.isAdmin
                                            ? 'bg-[#0e1c38]'
                                            : member.isParent
                                                ? 'bg-[#2596be]'
                                                : 'bg-slate-200'
                                            }`}>
                                            <UserCheck className={`h-6 w-6 ${member.isAdmin || member.isParent ? 'text-white' : 'text-slate-600'
                                                }`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-semibold text-[#0e1c38]">{member.name}</p>
                                                {member.isAdmin && (
                                                    <span className="px-2 py-0.5 bg-[#0e1c38] text-white text-xs font-semibold rounded">
                                                        Admin
                                                    </span>
                                                )}
                                                {member.isParent && !member.isAdmin && (
                                                    <span className="px-2 py-0.5 bg-[#2596be] text-white text-xs font-semibold rounded">
                                                        Parent
                                                    </span>
                                                )}
                                            </div>
                                            {/* MASKED EMAIL - Privacy Protection */}
                                            <p className="text-sm text-slate-500">{maskEmail(member.email)}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ml-3 ${member.status === 'Active'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {member.status}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* +2 Family Members Indicator */}
                        <div className="bg-slate-50 rounded-2xl shadow-sm border-2 border-dashed border-slate-300 p-4">
                            <div className="flex items-center justify-center gap-2 text-slate-600">
                                <Users className="h-5 w-5" />
                                <span className="font-semibold">+2 family members</span>
                            </div>
                            <p className="text-center text-sm text-slate-500 mt-1">
                                Invite more family members to join
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Security Notice - Dismissible Alert */}
                <AnimatePresence>
                    {showSecurityNotice && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-bold text-[#0e1c38] mb-1">
                                            Security Notice
                                        </h4>
                                        <p className="text-sm text-slate-700">
                                            Invitations expire in 24 hours for security purposes. All email addresses are masked for privacy protection.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowSecurityNotice(false)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                                    aria-label="Dismiss security notice"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-6"
                >
                    <h3 className="text-sm font-bold text-[#0e1c38] mb-2">
                        What happens next?
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-700">
                        <li className="flex items-start gap-2">
                            <span className="text-[#2596be] font-bold">1.</span>
                            <span>The invited member will receive an email with a registration link</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-[#2596be] font-bold">2.</span>
                            <span>They can create their account and complete their profile</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-[#2596be] font-bold">3.</span>
                            <span>Once registered, they'll be linked to your family account</span>
                        </li>
                    </ul>
                </motion.div>
            </div>
        </div>
    );
};

export default InviteMemberPage;
