import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, UserCheck, Shield, Trash2, CheckCircle2, MailPlus, XCircle } from 'lucide-react';

interface MemberData {
    id: string;
    name: string;
    email: string;
    status: string;
    role?: string;
}

const FamilyMemberDetailsPage: React.FC = () => {
    const [showConfirmDialog, setShowConfirmDialog] = useState<'parent' | 'delete' | 'cancel' | 'removeParent' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionComplete, setActionComplete] = useState<string | null>(null);

    // Get member data from URL search params (BrowserRouter uses ?key=val, not hash)
    const getMemberData = (): MemberData => {
        const params = new URLSearchParams(window.location.search);
        return {
            id: params.get('id') || '1',
            name: params.get('name') || 'Ahmed Mohamed',
            email: params.get('email') || 'ahmed.m@example.com',
            status: params.get('status') || 'Active',
            role: params.get('role') || 'Member'
        };
    };

    const member = getMemberData();
    const isPending = member.status === 'Pending';
    const isParent = member.role === 'Parent';

    const handleBack = () => {
        window.location.href = '/invite';
    };

    const handleGrantParent = () => {
        setShowConfirmDialog('parent');
    };

    const handleRemoveParent = () => {
        setShowConfirmDialog('removeParent');
    };

    const handleDelete = () => {
        setShowConfirmDialog('delete');
    };

    const handleCancelInvitation = () => {
        setShowConfirmDialog('cancel');
    };

    const handleResendInvitation = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setActionComplete('Invitation email has been resent successfully!');
        }, 1500);
    };

    const confirmAction = (action: 'parent' | 'delete' | 'cancel' | 'removeParent') => {
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            setShowConfirmDialog(null);

            if (action === 'parent') {
                setActionComplete('Parent permissions granted successfully!');
            } else if (action === 'removeParent') {
                setActionComplete('Parent permissions removed successfully!');
            } else if (action === 'cancel') {
                setActionComplete('Invitation cancelled.');
                setTimeout(() => {
                    handleBack();
                }, 2000);
            } else {
                setActionComplete('Member removed from family.');
                setTimeout(() => {
                    handleBack();
                }, 2000);
            }
        }, 1500);
    };

    const cancelAction = () => {
        setShowConfirmDialog(null);
    };

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
                    <span>Back to Family</span>
                </button>

                {/* Member Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200">
                        <div className="text-right flex-1">
                            <h1 className="text-2xl font-bold text-[#0e1c38] mb-1">
                                {member.name}
                            </h1>
                            <p className="text-[#2596be] mb-2">{member.email}</p>
                            <p className="text-slate-600 text-sm">{member.role}</p>
                        </div>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ml-4 ${isParent ? 'bg-[#2596be]' : isPending ? 'bg-amber-100' : 'bg-slate-200'
                            }`}>
                            <UserCheck className={`h-8 w-8 ${isParent ? 'text-white' : isPending ? 'text-amber-600' : 'text-slate-600'}`} />
                        </div>
                    </div>

                    {/* Success Message */}
                    {actionComplete && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                        >
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <p className="text-green-800 font-medium">{actionComplete}</p>
                        </motion.div>
                    )}

                    {/* Conditional Description */}
                    <p className="text-slate-600 text-center mb-6 leading-relaxed">
                        {isPending
                            ? 'This member has not yet accepted the invitation. You can resend the invitation or cancel it.'
                            : isParent
                                ? 'This member has parent permissions and can help you manage the family account.'
                                : 'You can request one of your group members to help you supervise family accounts using Family Link.'}
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {isPending ? (
                            <>
                                {/* Resend Invitation Button */}
                                <button
                                    onClick={handleResendInvitation}
                                    disabled={isLoading || !!actionComplete}
                                    className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white border-2 border-[#2596be] text-[#2596be] rounded-full font-semibold hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-[#2596be] border-t-transparent rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <MailPlus className="h-5 w-5" />
                                            Resend Invitation
                                        </>
                                    )}
                                </button>

                                {/* Cancel Invitation Button */}
                                <button
                                    onClick={handleCancelInvitation}
                                    disabled={!!actionComplete}
                                    className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white border-2 border-slate-300 text-slate-700 rounded-full font-semibold hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <XCircle className="h-5 w-5" />
                                    Cancel Invitation
                                </button>
                            </>
                        ) : isParent ? (
                            <>
                                {/* Remove Parent Permission Button */}
                                <button
                                    onClick={handleRemoveParent}
                                    disabled={!!actionComplete}
                                    className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white border-2 border-amber-500 text-amber-700 rounded-full font-semibold hover:bg-amber-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Shield className="h-5 w-5" />
                                    Remove Parent Permission
                                </button>

                                {/* Delete from Family Button */}
                                <button
                                    onClick={handleDelete}
                                    disabled={!!actionComplete}
                                    className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white border-2 border-slate-300 text-slate-700 rounded-full font-semibold hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 className="h-5 w-5" />
                                    Remove from Family
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Grant Parent Permission Button */}
                                <button
                                    onClick={handleGrantParent}
                                    disabled={!!actionComplete}
                                    className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white border-2 border-[#2596be] text-[#2596be] rounded-full font-semibold hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Shield className="h-5 w-5" />
                                    Grant Parent Permissions
                                </button>

                                {/* Delete from Family Button */}
                                <button
                                    onClick={handleDelete}
                                    disabled={!!actionComplete}
                                    className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white border-2 border-slate-300 text-slate-700 rounded-full font-semibold hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 className="h-5 w-5" />
                                    Remove Member
                                </button>
                            </>
                        )}
                    </div>

                    <p className="text-slate-600 text-center text-sm mt-6 leading-relaxed">
                        {isPending
                            ? 'The invitation will expire after 7 days if not accepted.'
                            : 'You can remove a family member at any time. An email will be sent to the person you want to remove from the group to notify them.'}
                    </p>
                </motion.div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${showConfirmDialog === 'parent' || showConfirmDialog === 'removeParent'
                            ? 'bg-blue-100'
                            : showConfirmDialog === 'cancel'
                                ? 'bg-amber-100'
                                : 'bg-red-100'
                            }`}>
                            {showConfirmDialog === 'parent' || showConfirmDialog === 'removeParent' ? (
                                <Shield className={`h-6 w-6 ${showConfirmDialog === 'removeParent' ? 'text-amber-600' : 'text-blue-600'}`} />
                            ) : showConfirmDialog === 'cancel' ? (
                                <XCircle className="h-6 w-6 text-amber-600" />
                            ) : (
                                <Trash2 className="h-6 w-6 text-red-600" />
                            )}
                        </div>

                        <h3 className="text-xl font-bold text-[#0e1c38] mb-2">
                            {showConfirmDialog === 'parent'
                                ? 'Grant Parent Permission?'
                                : showConfirmDialog === 'removeParent'
                                    ? 'Remove Parent Permission?'
                                    : showConfirmDialog === 'cancel'
                                        ? 'Cancel Invitation?'
                                        : 'Remove from Family?'}
                        </h3>

                        <p className="text-slate-600 mb-6">
                            {showConfirmDialog === 'parent'
                                ? `Are you sure you want to grant parent permissions to ${member.name}? They will be able to manage family members and invitations.`
                                : showConfirmDialog === 'removeParent'
                                    ? `Are you sure you want to remove parent permissions from ${member.name}? They will become a regular family member.`
                                    : showConfirmDialog === 'cancel'
                                        ? `Are you sure you want to cancel the invitation sent to ${member.name}?`
                                        : `Are you sure you want to remove ${member.name} from your family? This action cannot be undone.`}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={cancelAction}
                                disabled={isLoading}
                                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => confirmAction(showConfirmDialog)}
                                disabled={isLoading}
                                className={`flex-1 py-3 px-4 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${showConfirmDialog === 'parent'
                                    ? 'bg-[#2596be] hover:bg-[#1e7a9d]'
                                    : showConfirmDialog === 'removeParent'
                                        ? 'bg-amber-500 hover:bg-amber-600'
                                        : showConfirmDialog === 'cancel'
                                            ? 'bg-amber-500 hover:bg-amber-600'
                                            : 'bg-red-500 hover:bg-red-600'
                                    }`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    showConfirmDialog === 'parent'
                                        ? 'Grant Permission'
                                        : showConfirmDialog === 'removeParent'
                                            ? 'Remove Permission'
                                            : showConfirmDialog === 'cancel'
                                                ? 'Cancel Invitation'
                                                : 'Remove Member'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default FamilyMemberDetailsPage;
