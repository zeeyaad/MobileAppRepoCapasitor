import React, { useState, useEffect } from 'react';
import {
    Camera, Save, X, Lock, Eye, EyeOff,
    AlertCircle, Calendar, Activity,
    UserCheck, Shield, CheckCircle, XCircle
} from 'lucide-react';
import { StaffService, type StaffProfileData } from '../services/staffService';
import { Toaster, toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { resolveFileUrl } from '../utils/fileUrl';

// Design System - HUC Branding
const colors = {
    primaryDark: '#1F3A5F',
    primaryBlue: '#244A73',
    accentBlue: '#2EA7C9',
    accentOrange: '#F4A623',
    background: '#F4F6F9',
    white: '#FFFFFF',
    border: '#E5E7EB',
    success: '#28A745',
    warning: '#FFC107',
    danger: '#DC3545',
    info: '#17A2B8',
    gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        600: '#4B5563',
        700: '#374151',
        900: '#111827'
    }
};

// Types mapped to Frontend UI
interface UserProfile {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    nationalId: string;
    dateOfBirth: string; // Not in Staff Entity directly? Using employment_start_date as proxy or adding if available
    address: string;
    department: string;
    jobTitle: string; // Staff Type
    role: string;
    employeeId: string; // Staff ID
    accountStatus: string;
    profilePhoto: string;
    lastLogin: string;
    accountCreated: string;
    totalActions: number;
}

interface PasswordStrength {
    level: 'ضعيف' | 'متوسط' | 'قوي';
    color: string;
}

const StaffProfile: React.FC = () => {
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);

    // Password state
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    // Fetch Data
    const { user } = useAuth();

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                // Prefer AuthContext user for reliable staff_id and role
                let staffId: number | undefined = user?.staff_id;

                if (!staffId) {
                    // If Admin has no staff record, show minimal profile instead of error
                    if (user?.role === 'ADMIN') {
                        const mappedUser: UserProfile = {
                            id: 0,
                            fullName: user.fullName || 'Admin User',
                            email: '',
                            phone: '',
                            nationalId: '',
                            dateOfBirth: '',
                            address: '',
                            department: 'الإدارة',
                            jobTitle: 'المدير العام',
                            role: 'المدير العام',
                            employeeId: 'ADMIN',
                            accountStatus: 'نشط',
                            profilePhoto: resolveFileUrl(user?.photo) || '',
                            lastLogin: new Date().toISOString().split('T')[0],
                            accountCreated: new Date().toISOString().split('T')[0],
                            totalActions: 0
                        };
                        setUserData(mappedUser);
                        setIsLoading(false);
                        return;
                    } else {
                        setError("Could not find Staff ID. Please login again.");
                        setIsLoading(false);
                        return;
                    }
                }

                // Parallel fetch: Profile + Privileges + Logs (do not fail all if one fails)
                const [profileResult, , logsResult] = await Promise.allSettled([
                    StaffService.getProfile(staffId),
                    StaffService.getPrivileges(staffId),
                    StaffService.getActivityLogs(staffId, 1)
                ]);

                if (profileResult.status !== 'fulfilled') {
                    throw new Error(profileResult.reason?.message || 'Failed to load profile');
                }

                const profile = profileResult.value;
                const staff = profile?.data ?? profile;
                // privileges are not displayed on this page; ignore failure
                // logs are optional for profile page
                const logs = logsResult.status === 'fulfilled' ? logsResult.value : { count: 0 };

                const rawPhoto =
                    (staff as any)?.documents?.personal_photo_url ||
                    (staff as any)?.personal_photo_url ||
                    (staff as any)?.photo ||
                    (staff as any)?.photo_url ||
                    (staff as any)?.profile_photo ||
                    (staff as any)?.profilePhoto ||
                    (staff as any)?.avatar ||
                    null;

                // Map Backend -> Frontend
                const mappedUser: UserProfile = {
                    id: staff.id,
                    fullName: `${staff.first_name_ar} ${staff.last_name_ar}`,
                    email: staff.email,
                    phone: staff.phone,
                    nationalId: staff.national_id,
                    dateOfBirth: '', // Not in backend response provided
                    address: staff.address || '',
                    department: 'N/A', // Not in Staff Entity
                    jobTitle: staff.staff_type?.name_ar || 'N/A',
                    role: staff.staff_type?.name_ar || 'Staff',
                    employeeId: `EMP-${staff.id}`,
                    accountStatus: staff.is_active || staff.status === 'active' ? 'نشط' : 'غير نشط',
                    profilePhoto: resolveFileUrl(rawPhoto) || '',
                    lastLogin: new Date().toISOString().split('T')[0],
                    accountCreated: staff.created_at ? new Date(staff.created_at).toISOString().split('T')[0] : '',
                    totalActions: logs.count || 0
                };

                setUserData(mappedUser);
            } catch (err: any) {
                console.error("Error fetching profile:", err);
                if (user?.role === 'ADMIN') {
                    const mappedUser: UserProfile = {
                        id: 0,
                        fullName: user.fullName || 'Admin User',
                        email: '',
                        phone: '',
                        nationalId: '',
                        dateOfBirth: '',
                        address: '',
                        department: 'الإدارة',
                        jobTitle: 'المدير العام',
                        role: 'المدير العام',
                        employeeId: 'ADMIN',
                        accountStatus: 'نشط',
                        profilePhoto: resolveFileUrl(user?.photo) || '',
                        lastLogin: new Date().toISOString().split('T')[0],
                        accountCreated: new Date().toISOString().split('T')[0],
                        totalActions: 0
                    };
                    setUserData(mappedUser);
                    setError(null);
                } else {
                    setError(err.message || "Failed to load profile");
                    toast.error("فشل تحميل البيانات");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleInputChange = (field: keyof UserProfile, value: string) => {
        if (!userData) return;
        setUserData(prev => prev ? ({ ...prev, [field]: value }) : null);
    };

    const handlePasswordChange = (field: 'current' | 'new' | 'confirm', value: string) => {
        setPasswords(prev => ({ ...prev, [field]: value }));
    };

    const getPasswordStrength = (password: string): PasswordStrength => {
        if (password.length < 6) {
            return { level: 'ضعيف', color: colors.danger };
        } else if (password.length < 10) {
            return { level: 'متوسط', color: colors.warning };
        } else {
            return { level: 'قوي', color: colors.success };
        }
    };

    const passwordStrength = getPasswordStrength(passwords.new);

    const handleSaveProfile = async () => {
        if (!userData) return;

        try {
            // Split name back if needed or just update editable fields
            // Backend accepts: first_name_en, last_name_en, phone, address

            // For now, we only support updating phone and address as names are usually locked or require admin
            const updatePayload: Partial<StaffProfileData> = {
                phone: userData.phone,
                address: userData.address
            };

            await StaffService.updateProfile(userData.id, updatePayload);

            setIsEditMode(false);
            toast.success('تم حفظ التغييرات بنجاح');
        } catch (err: any) {
            console.error("Update error:", err);
            toast.error(err.message || 'فشل تحديث البيانات');
        }
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        // optimal: re-fetch or revert. Reverting requires keeping initial state.
        // For now just toggle off, assuming user didn't change much or is okay with stale state until refresh
        // Better:
        window.location.reload();
    };

    const handleUpdatePassword = async () => {
        if (passwords.new !== passwords.confirm) {
            toast.error('كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقين');
            return;
        }

        try {
            await StaffService.changeCredentials({
                new_email: userData?.email || '', // Use current email if not changing
                new_password: passwords.new
            });
            toast.success('تم تحديث كلمة المرور بنجاح');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (err: any) {
            toast.error(err.message || 'فشل تحديث كلمة المرور');
        }
    };

    const getStatusBadge = (status: string) => {
        const isActive = status === 'نشط';
        return (
            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: isActive ? `${colors.success}15` : `${colors.danger}15`,
                    color: isActive ? colors.success : colors.danger
                }}
            >
                {isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {status}
            </span>
        );
    };

    const getRoleBadge = (role: string) => {
        return (
            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 16px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '600',
                    backgroundColor: `${colors.accentOrange}20`,
                    color: colors.accentOrange,
                    border: `1px solid ${colors.accentOrange}40`
                }}
            >
                <Shield size={14} style={{ marginLeft: '6px' }} />
                {role}
            </span>
        );
    };

    if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>جاري التحميل...</div>;
    if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;
    if (!userData) return null;

    return (
        <div
            className="staff-profile-root"
            style={{
            minHeight: '100vh',
            backgroundColor: colors.background,
            direction: 'rtl',
            fontFamily: "'Cairo', sans-serif"
            }}
        >
            <style>{`
                @media (max-width: 640px) {
                    .staff-profile-main { padding: 12px !important; }
                    .staff-profile-header { flex-direction: column !important; gap: 12px !important; align-items: stretch !important; }
                    .staff-profile-header-actions { width: 100% !important; }
                    .staff-profile-header-actions button { width: 100% !important; }
                    .staff-profile-overview { flex-direction: column !important; align-items: stretch !important; gap: 16px !important; padding: 16px !important; }
                    .staff-profile-overview-info { width: 100% !important; }
                    .staff-profile-overview-grid { grid-template-columns: 1fr !important; }
                    .staff-profile-stats { grid-template-columns: 1fr !important; }
                    .staff-profile-sections { grid-template-columns: 1fr !important; gap: 16px !important; }
                    .staff-profile-card { padding: 16px !important; }
                }
            `}</style>
            <Toaster position="top-center" />
            <div style={{ display: 'flex' }}>

                {/* Main Content */}
                <div className="staff-profile-main" style={{ flex: 1, padding: '24px' }}>
                    {/* Page Header */}
                    <div className="staff-profile-header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '24px'
                    }}>
                        <div>
                            <h1 style={{
                                fontSize: '28px',
                                fontWeight: '700',
                                color: colors.primaryDark,
                                margin: '0 0 8px 0'
                            }}>
                                الملف الشخصي
                            </h1>
                            <p style={{
                                fontSize: '14px',
                                color: colors.gray[600],
                                margin: 0
                            }}>
                                إدارة بيانات الحساب والمعلومات الشخصية
                            </p>
                        </div>
                        <div className="staff-profile-header-actions" style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setIsEditMode(!isEditMode)}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: colors.primaryDark,
                                    color: colors.white,
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontFamily: "'Cairo', sans-serif"
                                }}
                            >
                                {isEditMode ? 'إلغاء التعديل' : 'تعديل الملف الشخصي'}
                            </button>
                        </div>
                    </div>

                    {/* Profile Overview Card */}
                    <div className="staff-profile-overview" style={{
                        backgroundColor: colors.white,
                        borderRadius: '12px',
                        padding: '32px',
                        marginBottom: '24px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        display: 'flex',
                        gap: '32px',
                        alignItems: 'center'
                    }}>
                        {/* Profile Photo */}
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                backgroundColor: colors.accentBlue,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '48px',
                                color: colors.white,
                                fontWeight: '700',
                                border: `4px solid ${colors.border}`,
                                overflow: 'hidden'
                            }}>
                                {userData.profilePhoto ? (
                                    <img
                                        src={userData.profilePhoto}
                                        alt={userData.fullName}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    userData.fullName.charAt(0)
                                )}
                            </div>
                            <button style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: colors.accentBlue,
                                border: `2px solid ${colors.white}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: colors.white,
                                transition: 'all 0.2s'
                            }}>
                                <Camera size={18} />
                            </button>
                        </div>

                        {/* Profile Info */}
                        <div className="staff-profile-overview-info" style={{ flex: 1 }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '12px'
                            }}>
                                <h2 style={{
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    color: colors.primaryDark,
                                    margin: 0
                                }}>
                                    {userData.fullName}
                                </h2>
                                {getRoleBadge(userData.role)}
                            </div>

                            <div className="staff-profile-overview-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '12px',
                                marginBottom: '16px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '14px', color: colors.gray[600] }}>البريد الإلكتروني:</span>
                                    <span style={{ fontSize: '14px', color: colors.gray[900], fontWeight: '500' }}>{userData.email}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '14px', color: colors.gray[600] }}>رقم الهاتف:</span>
                                    <span style={{ fontSize: '14px', color: colors.gray[900], fontWeight: '500', direction: 'ltr', textAlign: 'right' }}>{userData.phone}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '14px', color: colors.gray[600] }}>رقم الموظف:</span>
                                    <span style={{ fontSize: '14px', color: colors.gray[900], fontWeight: '500' }}>{userData.employeeId}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '14px', color: colors.gray[600] }}>حالة الحساب:</span>
                                    {getStatusBadge(userData.accountStatus)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Activity Summary */}
                    <div className="staff-profile-stats" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '16px',
                        marginBottom: '24px'
                    }}>
                        {[
                            { label: 'إجمالي الإجراءات', value: userData.totalActions.toString(), icon: Activity, color: colors.accentBlue },
                            { label: 'آخر تسجيل دخول', value: userData.lastLogin, icon: UserCheck, color: colors.success },
                            { label: 'تاريخ إنشاء الحساب', value: userData.accountCreated, icon: Calendar, color: colors.info }
                        ].map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={index}
                                    style={{
                                        backgroundColor: colors.white,
                                        borderRadius: '12px',
                                        padding: '20px',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px'
                                    }}
                                >
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        backgroundColor: `${stat.color}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: stat.color
                                    }}>
                                        <Icon size={24} />
                                    </div>
                                    <div>
                                        <div style={{
                                            fontSize: index === 0 ? '24px' : '14px',
                                            fontWeight: '700',
                                            color: stat.color,
                                            marginBottom: '4px',
                                            direction: index !== 0 ? 'ltr' : 'rtl',
                                            textAlign: 'right'
                                        }}>
                                            {stat.value}
                                        </div>
                                        <div style={{
                                            fontSize: '13px',
                                            color: colors.gray[600]
                                        }}>
                                            {stat.label}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="staff-profile-sections" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '24px'
                    }}>
                        {/* Personal Information */}
                        <div className="staff-profile-card" style={{
                            backgroundColor: colors.white,
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                        }}>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: colors.primaryDark,
                                marginBottom: '20px',
                                margin: '0 0 20px 0'
                            }}>
                                المعلومات الشخصية
                            </h3>

                            <div style={{ display: 'grid', gap: '16px' }}>
                                {[
                                    { label: 'الاسم الكامل', field: 'fullName' as keyof UserProfile, type: 'text', readOnly: true }, // Name not editable via simple profile
                                    { label: 'البريد الإلكتروني', field: 'email' as keyof UserProfile, type: 'email', readOnly: true }, // Email via change credentials only
                                    { label: 'رقم الهاتف', field: 'phone' as keyof UserProfile, type: 'tel' },
                                    { label: 'الرقم القومي', field: 'nationalId' as keyof UserProfile, type: 'text', readOnly: true },
                                    { label: 'تاريخ الميلاد', field: 'dateOfBirth' as keyof UserProfile, type: 'date', readOnly: true },
                                    { label: 'العنوان', field: 'address' as keyof UserProfile, type: 'text' },
                                    { label: 'القسم / الإدارة', field: 'department' as keyof UserProfile, type: 'text', readOnly: true },
                                    { label: 'المسمى الوظيفي', field: 'jobTitle' as keyof UserProfile, type: 'text', readOnly: true }
                                ].map((input) => (
                                    <div key={input.field}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: colors.gray[700],
                                            marginBottom: '8px'
                                        }}>
                                            {input.label}
                                        </label>
                                        <input
                                            type={input.type}
                                            value={userData[input.field] as string}
                                            onChange={(e) => handleInputChange(input.field, e.target.value)}
                                            disabled={!isEditMode || input.readOnly}
                                            style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontFamily: "'Cairo', sans-serif",
                                                outline: 'none',
                                                backgroundColor: (isEditMode && !input.readOnly) ? colors.white : colors.gray[50],
                                                color: colors.gray[900],
                                                transition: 'all 0.2s'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {isEditMode && (
                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    marginTop: '20px',
                                    paddingTop: '20px',
                                    borderTop: `1px solid ${colors.border}`
                                }}>
                                    <button
                                        onClick={handleSaveProfile}
                                        style={{
                                            flex: 1,
                                            padding: '10px 20px',
                                            backgroundColor: colors.primaryDark,
                                            color: colors.white,
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            fontFamily: "'Cairo', sans-serif",
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Save size={16} />
                                        حفظ التغييرات
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        style={{
                                            flex: 1,
                                            padding: '10px 20px',
                                            backgroundColor: colors.gray[200],
                                            color: colors.gray[700],
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            fontFamily: "'Cairo', sans-serif",
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <X size={16} />
                                        إلغاء
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Change Password */}
                        <div className="staff-profile-card" style={{
                            backgroundColor: colors.white,
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '20px'
                            }}>
                                <Lock size={20} color={colors.primaryDark} />
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: colors.primaryDark,
                                    margin: 0
                                }}>
                                    تغيير كلمة المرور
                                </h3>
                            </div>

                            <div style={{ display: 'grid', gap: '16px', marginBottom: '20px' }}>
                                {/* New Password */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: colors.gray[700],
                                        marginBottom: '8px'
                                    }}>
                                        كلمة المرور الجديدة
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={passwords.new}
                                            onChange={(e) => handlePasswordChange('new', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '10px 40px 10px 14px',
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontFamily: "'Cairo', sans-serif",
                                                outline: 'none'
                                            }}
                                        />
                                        <button
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            style={{
                                                position: 'absolute',
                                                left: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: colors.gray[600],
                                                padding: '4px'
                                            }}
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {passwords.new && (
                                        <div style={{ marginTop: '8px' }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '4px'
                                            }}>
                                                <div style={{
                                                    flex: 1,
                                                    height: '4px',
                                                    backgroundColor: colors.gray[200],
                                                    borderRadius: '2px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        height: '100%',
                                                        width: passwordStrength.level === 'ضعيف' ? '33%' : passwordStrength.level === 'متوسط' ? '66%' : '100%',
                                                        backgroundColor: passwordStrength.color,
                                                        transition: 'all 0.3s'
                                                    }} />
                                                </div>
                                                <span style={{
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    color: passwordStrength.color
                                                }}>
                                                    {passwordStrength.level}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: colors.gray[700],
                                        marginBottom: '8px'
                                    }}>
                                        تأكيد كلمة المرور
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={passwords.confirm}
                                            onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '10px 40px 10px 14px',
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontFamily: "'Cairo', sans-serif",
                                                outline: 'none'
                                            }}
                                        />
                                        <button
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={{
                                                position: 'absolute',
                                                left: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: colors.gray[600],
                                                padding: '4px'
                                            }}
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                padding: '12px',
                                backgroundColor: `${colors.info}10`,
                                borderRadius: '8px',
                                marginBottom: '16px',
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'flex-start'
                            }}>
                                <AlertCircle size={16} color={colors.info} style={{ marginTop: '2px', flexShrink: 0 }} />
                                <p style={{
                                    fontSize: '12px',
                                    color: colors.gray[700],
                                    margin: 0,
                                    lineHeight: '1.5'
                                }}>
                                    تأكد من استخدام كلمة مرور قوية تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز خاصة
                                </p>
                            </div>

                            <button
                                onClick={handleUpdatePassword}
                                style={{
                                    width: '100%',
                                    padding: '12px 20px',
                                    backgroundColor: colors.accentOrange,
                                    color: colors.white,
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    fontFamily: "'Cairo', sans-serif",
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Lock size={16} />
                                تحديث كلمة المرور
                            </button>
                        </div>
                    </div>

                    {/* Role & Privileges */}
                    <div style={{
                        backgroundColor: colors.white,
                        borderRadius: '12px',
                        padding: '24px',
                        marginTop: '24px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '20px'
                        }}>
                            <Shield size={20} color={colors.primaryDark} />
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: colors.primaryDark,
                                margin: 0
                            }}>
                                الدور والصلاحيات
                            </h3>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{
                                fontSize: '14px',
                                color: colors.gray[600],
                                marginBottom: '8px'
                            }}>
                                الدور الحالي:
                            </div>
                            {getRoleBadge(userData.role)}
                        </div>

                        {/* Note: Dynamic privileges list can be added here using `StaffService.getPrivileges` */}
                        {/* Currently just basic layout */}
                        <div style={{
                            padding: '12px',
                            backgroundColor: colors.gray[50],
                            borderRadius: '8px',
                            fontSize: '13px',
                            color: colors.gray[600]
                        }}>
                            لمعرفة التفاصيل الكاملة عن الصلاحيات، يرجى مراجعة صفحة الصلاحيات الإدارية.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffProfile;
