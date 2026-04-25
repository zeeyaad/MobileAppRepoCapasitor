"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
    Users, UserPlus, Search, MoreVertical, Edit, Trash2, X, Check,
    ChevronLeft, Upload, Calendar, CreditCard, FileText,
    Bell, Menu, Home, BarChart3, CheckSquare, DollarSign,
    UserCheck, AlertCircle, Briefcase, GraduationCap, Activity, Plus, Key,
    Moon
} from "lucide-react";

// --- Types & Interfaces ---

export type UserCategory = 'student' | 'staff' | 'general';
export type MembershipType = 'monthly' | 'annual' | 'vip';
export type UserStatus = 'active' | 'expired' | 'pending';

export interface User {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    nationalId: string;
    dob: string;
    nationalityType: 'egyptian' | 'non_egyptian';
    nationality?: string;
    category: UserCategory;
    membershipType: MembershipType;
    status: UserStatus;
    universityName?: string;
    graduationYear?: string;
    profession?: string;
    jobId?: string;
    salary?: string;
}

export interface MembershipPlan {
    id: number;
    plan_code: string;
    name_ar: string;
    name_en: string;
    price: number;
    currency: string;
    duration_months: number;
    is_active: boolean;
    description_ar?: string;
}

// --- Mock Services ---
const userService = {
    fetchUsers: async (): Promise<User[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: '1',
                        fullName: 'أحمد محمود',
                        email: 'ahmed@example.com',
                        phone: '01000000000',
                        nationalId: '29901010000000',
                        dob: '1999-01-01',
                        nationalityType: 'egyptian',
                        nationality: 'مصرى',
                        category: 'student',
                        membershipType: 'annual',
                        status: 'active',
                        universityName: 'جامعة حلوان',
                        graduationYear: '2024'
                    },
                    {
                        id: '2',
                        fullName: 'سارة علي',
                        email: 'sara@example.com',
                        phone: '01111111111',
                        nationalId: '29000000000000',
                        dob: '1990-05-05',
                        nationalityType: 'egyptian',
                        nationality: 'مصرى',
                        category: 'staff',
                        membershipType: 'vip',
                        status: 'active',
                        jobId: 'EMP-123'
                    }
                ]);
            }, 500);
        });
    }
};

const Analytics = () => (
    <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 text-center h-full">
        <h3 className="text-xl font-bold text-slate-900">صفحة التحليلات</h3>
        <p className="text-slate-500 mt-2">جاري العمل عليها...</p>
        <div className="mt-8 h-64 bg-slate-50 rounded-2xl flex items-center justify-center">
            <BarChart3 className="w-12 h-12 text-slate-300" />
        </div>
    </div>
);

const MOCK_ACTIVITIES = [
    { type: "تسجيل عضو جديد", name: "أحمد محمد", desc: "قام بتسجيل عضوية بلاتينية", time: "منذ 5 دقائق", icon: UserPlus, bg: "bg-emerald-100", color: "text-emerald-600" },
    { type: "تنبيه RFID", name: "بوابة رقم 3", desc: "محاولة دخول ببطاقة منتهية", time: "منذ 12 دقيقة", icon: AlertCircle, bg: "bg-red-100", color: "text-red-600" },
    { type: "تأكيد دفع", name: "سارة علي", desc: "تم دفع اشتراك سنوي 500 ج.م", time: "منذ 25 دقيقة", icon: Check, bg: "bg-blue-100", color: "text-blue-600" },
    { type: "حجز معدات", name: "محمود حسن", desc: "حجز خزانة رقم 42", time: "منذ 1 ساعة", icon: Key, bg: "bg-slate-100", color: "text-slate-600" },
];

// --- Sub-Components ---

// UserTable (Reused with updated styling)
const UserTable = ({ users, onEdit, onDelete, onView }: { users: User[], onEdit: (u: User) => void, onDelete: (id: string) => void, onView: (u: User) => void }) => {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            {['العضو', 'ID', 'الفئة', 'العضوية', 'الحالة', 'إجراءات'].map((h, i) => (
                                <th key={i} className="px-6 py-5 text-sm font-bold text-slate-800">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">لا يوجد أعضاء</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold border border-slate-200">
                                                {user.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{user.fullName}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{user.id}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${user.category === 'student' ? 'bg-blue-50 text-blue-700' : user.category === 'staff' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700'}`}>
                                            {user.category === 'student' ? 'طالب' : user.category === 'staff' ? 'موظف' : 'عام'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-700 font-medium">
                                            {user.membershipType === 'vip' ? 'VIP' : user.membershipType === 'annual' ? 'سنوية' : 'شهرية'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
                                            {user.status === 'active' ? 'نشط' : user.status === 'expired' ? 'منتهي' : 'معلق'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => onView(user)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"><Search className="w-4 h-4" /></button>
                                            <button onClick={() => onEdit(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => onDelete(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// User Form Modal (Kept largely the same functionality, refreshed styling)
const UserFormModal = ({ isOpen, onClose, onSubmit, initialData }: { isOpen: boolean, onClose: () => void, onSubmit: (data: any) => void, initialData?: User | null }) => {
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState<UserCategory>('student');
    const [nationalityType, setNationalityType] = useState<'egyptian' | 'non_egyptian'>('egyptian');

    const { register, handleSubmit, watch, setValue, trigger, reset, formState: { errors } } = useForm<User>({
        defaultValues: initialData || { category: 'student', membershipType: 'annual', status: 'active', nationalityType: 'egyptian', nationality: 'مصرى' }
    });

    useEffect(() => {
        if (isOpen) {
            reset(initialData || { category: 'student', membershipType: 'annual', status: 'active', nationalityType: 'egyptian', nationality: 'مصرى' });
            if (initialData) { setCategory(initialData.category); setNationalityType(initialData.nationalityType); }
            else { setCategory('student'); setNationalityType('egyptian'); }
            setStep(1);
        }
    }, [isOpen, initialData, reset]);

    useEffect(() => {
        if (nationalityType === 'egyptian') setValue('nationality', 'مصرى');
        else setValue('nationality', '');
    }, [nationalityType, setValue]);

    if (!isOpen) return null;

    const handleNext = async () => { if (await trigger()) setStep(prev => prev + 1); };
    const handlePrev = () => setStep(prev => prev - 1);

    const renderStep1 = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
                { id: 'student', label: 'طالب جامعي', icon: GraduationCap, color: 'blue' },
                { id: 'staff', label: 'موظف بالجامعة', icon: Briefcase, color: 'purple' },
                { id: 'general', label: 'عضو خارجي', icon: Users, color: 'orange' },
            ].map((item) => {
                const Icon = item.icon;
                return (
                    <button key={item.id} type="button" onClick={() => { setCategory(item.id as UserCategory); setValue('category', item.id as UserCategory); handleNext(); }}
                        className={`p-6 rounded-3xl border-2 transition-all hover:shadow-lg flex flex-col items-center gap-4 ${category === item.id ? `border-${item.color}-500 bg-${item.color}-50` : 'border-slate-100 hover:border-slate-200'}`}>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${category === item.id ? `bg-${item.color}-100` : 'bg-slate-50'}`}>
                            <Icon className={`w-7 h-7 text-${item.color}-600`} />
                        </div>
                        <span className="font-bold text-slate-900 text-lg">{item.label}</span>
                    </button>
                )
            })}
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">الاسم الرباعي</label>
                    <input {...register("fullName", { required: "الاسم مطلوب" })} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">الرقم القومي</label>
                    <input {...register("nationalId", { required: "مطلوب" })} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">البريد الإلكتروني</label>
                    <input {...register("email", { required: "مطلوب" })} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">رقم الهاتف</label>
                    <input {...register("phone", { required: "مطلوب" })} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none" />
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="text-center py-10">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">جاهز للحفظ!</h3>
            <p className="text-slate-500 mb-8 font-medium">تم مراجعة جميع البيانات بنجاح.</p>
            <div className="bg-slate-50 rounded-2xl p-6 text-right max-w-sm mx-auto border border-slate-100">
                <div className="flex justify-between mb-3"><span className="text-slate-500 font-medium">الاسم:</span><span className="font-bold text-slate-900">{watch('fullName')}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-medium">البريد:</span><span className="font-bold text-slate-900">{watch('email')}</span></div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">{initialData ? 'تعديل عضو' : 'تسجيل عضو جديد'}</h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">الخطوة {step} من 3</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                <div className="p-8 overflow-y-auto flex-1">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                    </form>
                </div>
                <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-between">
                    <button onClick={step === 1 ? onClose : handlePrev} className="px-8 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-2xl transition-colors">{step === 1 ? 'إلغاء' : 'رجوع'}</button>
                    {step < 3 ? (
                        <button onClick={handleNext} className="px-10 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-bold shadow-lg hover:shadow-xl hover:-translate-y-1">التالي</button>
                    ) : (
                        <button onClick={handleSubmit(onSubmit)} className="px-10 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-bold shadow-lg hover:shadow-xl hover:-translate-y-1">حفظ</button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

// User Details Modal (Retained logic, updated styles)
const UserDetailsModal = ({ user, onClose, onEdit, onUserUpdated }: { user: User | null, onClose: () => void, onEdit: () => void, onUserUpdated: (user: User) => void }) => {
    if (!user) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden relative">
                <div className="h-32 bg-slate-900 relative">
                    <button onClick={onClose} className="absolute top-6 left-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"><X className="w-5 h-5" /></button>
                </div>
                <div className="px-8 pb-8">
                    <div className="relative -mt-16 mb-6 flex justify-between items-end">
                        <div className="w-32 h-32 bg-white rounded-[2rem] p-2 shadow-xl">
                            <div className="w-full h-full bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-4xl font-bold text-slate-400">
                                {user.fullName.charAt(0)}
                            </div>
                        </div>
                        <button onClick={onEdit} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg">تعديل الملف</button>
                    </div>
                    <div className="mb-6">
                        <h2 className="text-3xl font-black text-slate-900 mb-1">{user.fullName}</h2>
                        <p className="text-slate-500 font-medium">{user.email}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <div>
                            <p className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">رقم الهاتف</p>
                            <p className="text-slate-900 font-bold">{user.phone}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">الحالة</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{user.status === 'active' ? 'نشط' : 'غير نشط'}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// User Management Page Wrapper
const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    useEffect(() => { const load = async () => { setLoading(true); const data = await userService.fetchUsers(); setUsers(data); setLoading(false); }; load(); }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">إدارة الأعضاء</h2>
                    <p className="text-slate-500 font-medium mt-1">عرض وإدارة جميع أعضاء النادي</p>
                </div>
                <button onClick={() => { setEditingUser(null); setIsFormOpen(true); }} className="bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-slate-800 transition-all font-bold shadow-lg hover:shadow-xl flex items-center gap-2">
                    <Plus className="w-5 h-5" /> عضو جديد
                </button>
            </div>
            {loading ? <div className="text-center py-20"><div className="animate-spin w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full mx-auto"></div></div> :
                <UserTable users={users} onEdit={(u) => { setEditingUser(u); setIsFormOpen(true); }} onDelete={(id) => setUsers(prev => prev.filter(u => u.id !== id))} onView={setViewingUser} />
            }
            <UserFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={(data) => {
                if (editingUser) setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...editingUser, ...data } : u));
                else setUsers(prev => [...prev, { ...data, id: Math.random().toString() }]);
                setIsFormOpen(false);
            }} initialData={editingUser} />
            <UserDetailsModal user={viewingUser} onClose={() => setViewingUser(null)} onEdit={() => { setEditingUser(viewingUser); setViewingUser(null); setIsFormOpen(true); }} onUserUpdated={(u) => { setUsers(prev => prev.map(ou => ou.id === u.id ? u : ou)); setViewingUser(u); }} />
        </div>
    );
};

// Membership Management Wrapper
const MembershipManagement = () => {
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:3000/api/memberships');
                if (response.ok) setPlans(await response.json());
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchPlans();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-2xl font-black text-slate-900">أنواع العضويات</h2>
                <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all">+ إضافة خطة</button>
            </div>
            {loading ? <div className="text-center py-20">جار التحميل...</div> : (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50/50"><tr>{['الاسم', 'الكود', 'السعر', 'المدة', 'الحالة'].map((h, i) => <th key={i} className="px-6 py-5 text-sm font-bold text-slate-800">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {plans.map(plan => (
                                <tr key={plan.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-bold text-slate-900">{plan.name_ar}</td>
                                    <td className="px-6 py-4"><span className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-mono font-bold text-slate-600">{plan.plan_code}</span></td>
                                    <td className="px-6 py-4 text-emerald-600 font-bold">{plan.price} {plan.currency}</td>
                                    <td className="px-6 py-4 font-medium text-slate-600">{plan.duration_months} شهر</td>
                                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${plan.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{plan.is_active ? 'نشط' : 'غير نشط'}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// --- Main Admin Dashboard Implementation ---

const AdminDashboard = () => {
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [todayDate, setTodayDate] = useState("");

    useEffect(() => {
        // Set dynamic date
        const date = new Date().toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        setTodayDate(date);
    }, []);

    // Dashboard Stats
    const stats = [
        { label: "الإيرادات الشهرية", value: "89,450", sub: "ج.م", change: "+24.8%", trend: "up", icon: DollarSign, bg: "bg-emerald-100", iconColor: "text-emerald-600" },
        { label: "إجمالي الأعضاء", value: "1,234", sub: "", change: "+12.5%", trend: "up", icon: Users, bg: "bg-blue-100", iconColor: "text-blue-600" },
        { label: "تسجيلات اليوم", value: "89", sub: "", change: "+8.2%", trend: "up", icon: UserCheck, bg: "bg-purple-100", iconColor: "text-purple-600" },
        { label: "عضويات منتهية قريباً", value: "23", sub: "", change: "-15.3%", trend: "down", icon: AlertCircle, bg: "bg-orange-100", iconColor: "text-orange-600" }
    ];

    const renderDashboard = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group">
                            <div className="flex justify-between items-start mb-6">
                                <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full ${stat.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                    {stat.change} {stat.trend === 'up' ? '↑' : '↓'}
                                </span>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-slate-500 font-bold text-sm mb-1">{stat.label}</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-slate-900">{stat.value}</span>
                                    {stat.sub && <span className="text-sm font-bold text-slate-400">{stat.sub}</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Dashboard Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Actions & Dist) */}
                <div className="space-y-8">
                    {/* Quick Actions Card */}
                    <div className="bg-[#0e1c38] rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

                        <div className="relative z-10">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-yellow-400" /> إجراءات سريعة
                            </h3>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/5 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><UserPlus className="w-4 h-4" /></div>
                                        <span className="font-bold">إضافة عضو جديد</span>
                                    </div>
                                    <ChevronLeft className="w-4 h-4 opacity-50 group-hover:-translate-x-1 transition-transform" />
                                </button>
                                <button className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/5 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Calendar className="w-4 h-4" /></div>
                                        <span className="font-bold">حجز ملعب</span>
                                    </div>
                                    <ChevronLeft className="w-4 h-4 opacity-50 group-hover:-translate-x-1 transition-transform" />
                                </button>
                                <button className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/5 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><FileText className="w-4 h-4" /></div>
                                        <span className="font-bold">إصدار فاتورة</span>
                                    </div>
                                    <ChevronLeft className="w-4 h-4 opacity-50 group-hover:-translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Membership Distribution */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                        <h3 className="text-lg font-black text-slate-900 mb-6">توزيع العضويات</h3>
                        <div className="space-y-6">
                            {[
                                { label: "بلاتينية", val: 45, color: "bg-slate-900" },
                                { label: "ذهبية", val: 30, color: "bg-yellow-400" },
                                { label: "فضية", val: 25, color: "bg-slate-300" }
                            ].map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold text-slate-700 text-sm">{item.label}</span>
                                        <span className="font-bold text-slate-900 text-sm">{item.val}%</span>
                                    </div>
                                    <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.val}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className={`h-full rounded-full ${item.color}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400 text-center mt-6 font-medium">تحديث البيانات يتم تلقائياً بناءً على الاشتراكات المفعلة</p>
                    </div>
                </div>

                {/* Right Column (Recent Activities) */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900">النشاطات الأخيرة</h3>
                            <p className="text-sm text-slate-500 font-medium mt-1">آخر التحديثات والإجراءات في النظام</p>
                        </div>
                        <button className="text-sm font-bold text-slate-900 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl transition-colors">عرض الكل</button>
                    </div>

                    <div className="space-y-6">
                        {MOCK_ACTIVITIES.map((act, i) => {
                            const Icon = act.icon;
                            return (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-default group">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${act.bg} ${act.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">{act.type}</h4>
                                            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{act.time}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-600 mt-1">{act.name}</p>
                                        <p className="text-xs text-slate-400 font-medium mt-1">{act.desc}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-right" dir="rtl">
            {/* Sidebar */}
            <aside className={`fixed top-0 right-0 h-full bg-white z-50 transition-all duration-300 border-l border-slate-100 ${sidebarOpen ? "w-72" : "w-0 lg:w-0 overflow-hidden"}`}>
                <div className="flex flex-col h-full">
                    <div className="h-24 flex items-center justify-center border-b border-slate-50">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">نادي حلوان</h1>
                    </div>
                    <div className="flex-1 overflow-y-auto py-8 px-5 space-y-1">
                        <p className="text-xs font-bold text-slate-400 px-4 mb-4 uppercase tracking-wider">الرئيسية</p>
                        {[
                            { id: 'dashboard', label: 'لوحة التحكم', icon: Home },
                            { id: 'analytics', label: 'التحليلات', icon: BarChart3 }
                        ].map(item => (
                            <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${activeMenu === item.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                                <item.icon className="w-5 h-5" /> {item.label}
                            </button>
                        ))}

                        <div className="my-6 border-t border-slate-50"></div>

                        <p className="text-xs font-bold text-slate-400 px-4 mb-4 uppercase tracking-wider">الإدارة</p>
                        {[
                            { id: 'members', label: 'الأعضاء', icon: Users },
                            { id: 'memberships', label: 'أنواع العضويات', icon: CreditCard },
                            { id: 'rfid', label: 'سجلات RFID', icon: Key },
                            { id: 'bookings', label: 'الحجوزات', icon: Calendar },
                            { id: 'payments', label: 'المدفوعات', icon: DollarSign },
                            { id: 'reports', label: 'التقارير', icon: FileText },
                            { id: 'tasks', label: 'المهام والموظفين', icon: CheckSquare },
                        ].map(item => (
                            <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${activeMenu === item.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                                <item.icon className="w-5 h-5" /> {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Admin Profile in Sidebar */}
                    <div className="p-5 border-t border-slate-50">
                        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 hover:bg-slate-100 transition-colors cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">A</div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold text-slate-900 truncate">أدمن النظام</p>
                                <p className="text-xs text-slate-500 truncate">admin@helwanclub.com</p>
                            </div>
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`transition-all duration-300 min-h-screen ${sidebarOpen ? "mr-72" : "mr-0"}`}>

                {/* Header */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-6">
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600">
                                <Menu className="w-6 h-6" />
                            </button>
                            <div className="hidden md:flex flex-col">
                                <h2 className="text-4xl font-black text-slate-900 -mb-1">مرحباً، أدمن 👋</h2>
                                <p className="text-sm font-medium text-slate-500">{todayDate}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative hidden md:block">
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="text" placeholder="بحث سريع..." className="w-80 bg-slate-50 border-none rounded-full py-3 pr-11 pl-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10 placeholder:font-medium placeholder:text-slate-400 transition-all" />
                            </div>
                            <button className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-600">
                                <Moon className="w-5 h-5" />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-600 relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-[1600px] mx-auto">
                    {activeMenu === "dashboard" && renderDashboard()}
                    {activeMenu === "members" && <UserManagement />}
                    {activeMenu === "memberships" && <MembershipManagement />}
                    {activeMenu === "analytics" && <Analytics />}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
