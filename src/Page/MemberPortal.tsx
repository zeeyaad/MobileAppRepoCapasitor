import React, { useEffect, useState } from 'react';
import { User, Mail, IdCard, Calendar, Shield, LogOut, CheckCircle, Crown, HomeIcon, Wallet, Gift, UtensilsCrossed, Bookmark, Settings, ArrowRight } from 'lucide-react';
import { AuthService } from '../services/authService';
import type { UserInfo } from '../types';
import { motion } from 'framer-motion';
import { Navbar } from '../Component/Navbar';

const MemberPortal: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch fresh user data from backend
        try {
          const response = await AuthService.getCurrentUser();
          if (response.success && response.data) {
            setUserInfo(response.data.user || response.data);
            // Also update localStorage with fresh data
            AuthService.setUserInfo(response.data.user || response.data);
          } else {
            // Fallback to localStorage if backend doesn't have the expected structure
            const cachedUser = AuthService.getUserInfo();
            setUserInfo(cachedUser);
          }
        } catch (backendError) {
          // Fallback to localStorage if backend call fails
          console.warn('Failed to fetch from backend, using cached data:', backendError);
          const cachedUser = AuthService.getUserInfo();
          if (cachedUser) {
            setUserInfo(cachedUser);
          } else {
            setError('Failed to load user data');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0e1c38] to-[#1a4d63]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#f8941c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2596be] font-bold text-lg">جارٍ تحميل بيانات الملف الشخصي...</p>
        </div>
      </div>
    );
  }

  if (error || !userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0e1c38] to-[#1a4d63]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-2xl max-w-md text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#0e1c38] mb-2">خطأ في تحميل البيانات</h2>
          <p className="text-gray-600 mb-6">{error || 'يرجى تسجيل الدخول مجدداً'}</p>
          <button
            onClick={() => window.location.hash = '/login'}
            className="px-6 py-3 bg-gradient-to-r from-[#f8941c] to-[#e07d10] text-white rounded-lg hover:shadow-lg transition-all font-bold text-lg flex items-center justify-center gap-2 w-full"
          >
            العودة إلى تسجيل الدخول <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    );
  }

  const tabItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: HomeIcon },
    { id: 'memberships', label: 'العضويات', icon: Wallet },
    { id: 'bookings', label: 'الحجوزات', icon: Bookmark },
    { id: 'activities', label: 'الأنشطة', icon: UtensilsCrossed },
    { id: 'rewards', label: 'المكافآت', icon: Gift },
    { id: 'profile', label: 'الملف الشخصي', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <Navbar
        showAuthButtons={false}
        showNavigation={false}
        onLogout={handleLogout}
        isDark={true}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 pt-32">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-12 border-b-4 border-[#f8941c]"
        >
          <div className="bg-gradient-to-r from-[#0e1c38] via-[#1a4d63] to-[#2596be] p-8 md:p-12 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#f8941c] rounded-full -mr-48 -mt-48"></div>
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-8 flex-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 100 }}
                  className="w-32 h-32 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl flex items-center justify-center backdrop-blur-sm border-3 border-white/30 shadow-2xl"
                >
                  <Crown className="w-16 h-16 text-[#f8941c]" />
                </motion.div>
                <div className="flex-1">
                  <span className="text-[#f8941c] font-black text-xs tracking-widest uppercase">عضو مميز</span>
                  <h2 className="text-4xl font-black mb-2 leading-tight">{userInfo.name_en || 'عضو'}</h2>
                  <p className="text-gray-100 flex items-center gap-2 mb-4 font-normal">
                    <Mail className="w-4 h-4" />
                    {userInfo.email}
                  </p>
                  <div className="flex gap-3">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className={`px-4 py-2 rounded-full text-xs font-bold backdrop-blur-sm border border-white/30 ${userInfo.status === 'active' ? 'bg-green-400/30 text-green-100' : 'bg-yellow-400/30 text-yellow-100'}`}
                    >
                      {userInfo.status === 'active' ? '✓ عضو نشط' : 'قيد المراجعة'}
                    </motion.span>
                    {userInfo.member_type && <span className="px-4 py-2 rounded-full text-xs font-bold bg-[#f8941c]/30 text-orange-100 backdrop-blur-sm border border-white/30">{userInfo.member_type}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 md:p-12 bg-gray-50 border-t border-gray-200">
            <motion.div
              whileHover={{ y: -5 }}
              className="text-center p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-[#2596be]"
            >
              <p className="text-3xl font-black text-[#0e1c38] mb-2">{userInfo.account_id}</p>
              <p className="text-xs text-gray-600 font-bold">رقم الحساب</p>
            </motion.div>
            {userInfo.member_id && (
              <motion.div
                whileHover={{ y: -5 }}
                className="text-center p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-[#f8941c]"
              >
                <p className="text-3xl font-black text-[#0e1c38] mb-2">{userInfo.member_id}</p>
                <p className="text-xs text-gray-600 font-bold">رقم العضوية</p>
              </motion.div>
            )}
            {userInfo.member_type_id && (
              <motion.div
                whileHover={{ y: -5 }}
                className="text-center p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-purple-500"
              >
                <p className="text-3xl font-black text-[#0e1c38] mb-2">{userInfo.member_type_id}</p>
                <p className="text-xs text-gray-600 font-bold">نوع العضوية</p>
              </motion.div>
            )}
            {userInfo.role && (
              <motion.div
                whileHover={{ y: -5 }}
                className="text-center p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-teal-500"
              >
                <p className="text-sm font-black text-[#0e1c38] mb-2 truncate">{userInfo.role}</p>
                <p className="text-xs text-gray-600 font-bold">الدور</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="flex overflow-x-auto border-b-4 border-gray-200">
            {tabItems.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ backgroundColor: 'rgb(243, 244, 246)' }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-5 font-bold text-sm whitespace-nowrap transition-all relative group ${isActive
                      ? 'text-[#0e1c38] bg-gradient-to-b from-blue-50 to-white'
                      : 'text-gray-600 hover:text-[#0e1c38]'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="underline"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2596be] to-[#f8941c]"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-8 md:p-12 min-h-96">
            {activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Section Title */}
                <div className="text-center md:text-right mb-8">
                  <span className="text-[#f8941c] font-black text-xs tracking-widest uppercase">لوحة التحكم</span>
                  <h3 className="text-4xl font-black text-[#0e1c38] mt-2 mb-4">معلومات عضويتك</h3>
                  <div className="h-1.5 w-24 bg-gradient-to-r from-[#2596be] to-[#f8941c] rounded-full"></div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoCard
                    icon={Shield}
                    iconBg="blue"
                    label="رقم الحساب"
                    value={String(userInfo.account_id)}
                  />
                  {userInfo.member_id && (
                    <InfoCard
                      icon={IdCard}
                      iconBg="orange"
                      label="رقم العضوية"
                      value={String(userInfo.member_id)}
                    />
                  )}
                  {userInfo.member_type && (
                    <InfoCard
                      icon={CheckCircle}
                      iconBg="purple"
                      label="نوع العضوية"
                      value={userInfo.member_type}
                    />
                  )}
                </div>

                {/* Privileges */}
                {userInfo.privileges && userInfo.privileges.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl border-r-4 border-[#2596be]">
                    <span className="text-[#f8941c] font-black text-xs tracking-widest uppercase">الصلاحيات</span>
                    <h4 className="text-2xl font-black text-[#0e1c38] mb-6 mt-2">امتيازاتك الحصرية</h4>
                    <div className="flex flex-wrap gap-3">
                      {userInfo.privileges.map((privilege, index) => (
                        <motion.span
                          key={index}
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="px-5 py-3 bg-gradient-to-r from-[#2596be] to-[#1a4d63] text-white rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-shadow"
                        >
                          ✓ {privilege}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'memberships' && <EmptyState icon={Wallet} text="قسم العضويات قريباً" />}
            {activeTab === 'bookings' && <EmptyState icon={Bookmark} text="قسم الحجوزات قريباً" />}
            {activeTab === 'activities' && <EmptyState icon={UtensilsCrossed} text="قسم الأنشطة قريباً" />}
            {activeTab === 'rewards' && <EmptyState icon={Gift} text="قسم المكافآت قريباً" />}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <ProfileCard label="البريد الإلكتروني" value={userInfo.email} icon={Mail} />
                {userInfo.role && <ProfileCard label="الدور" value={userInfo.role} icon={Shield} />}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Developer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden mt-12 border-b-4 border-gray-300"
        >
          <details className="group cursor-pointer">
            <summary className="p-8 bg-gradient-to-r from-gray-50 to-gray-100 font-black text-gray-700 group-open:bg-gradient-to-r group-open:from-blue-50 group-open:to-purple-50 transition-colors flex items-center justify-between">
              <span className="flex items-center gap-2">👨‍💻 عرض البيانات الكاملة (للمطورين)</span>
              <motion.span
                animate={{ rotate: 0 }}
                className="text-xs"
              >
                ▼
              </motion.span>
            </summary>
            <div className="p-8 border-t-4 border-gray-200">
              <pre className="bg-[#0e1c38] text-[#00ff00] p-6 rounded-xl overflow-x-auto text-xs font-mono max-h-96 overflow-y-auto shadow-lg border-2 border-[#f8941c]">
                {JSON.stringify(userInfo, null, 2)}
              </pre>
            </div>
          </details>
        </motion.div>
      </div>
    </div>
  );
};

interface InfoCardProps {
  icon: React.ElementType;
  iconBg: string;
  label: string;
  value: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, iconBg, label, value }) => {
  const bgColors: { [key: string]: string } = {
    blue: 'from-blue-50 to-blue-100',
    orange: 'from-orange-50 to-orange-100',
    purple: 'from-purple-50 to-purple-100',
    pink: 'from-pink-50 to-pink-100',
    green: 'from-green-50 to-green-100',
  };

  const iconColors: { [key: string]: string } = {
    blue: 'text-[#2596be]',
    orange: 'text-[#f8941c]',
    purple: 'text-purple-600',
    pink: 'text-pink-600',
    green: 'text-green-600',
  };

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      className={`bg-gradient-to-br ${bgColors[iconBg]} p-8 rounded-2xl border-r-4 border-[#2596be] shadow-lg hover:shadow-2xl transition-all`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md`}>
          <Icon className={`w-8 h-8 ${iconColors[iconBg]}`} />
        </div>
        <div>
          <p className="text-sm text-gray-600 font-bold uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-black text-[#0e1c38]">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

const EmptyState: React.FC<{ icon: React.ElementType; text: string }> = ({ icon: Icon, text }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-24 text-gray-500"
  >
    <Icon className="w-20 h-20 mx-auto mb-4 opacity-30 text-[#2596be]" />
    <p className="text-xl font-bold text-gray-600">{text}</p>
  </motion.div>
);

interface ProfileCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ label, value, icon: Icon }) => (
  <motion.div
    whileHover={{ x: 4 }}
    className="bg-gradient-to-r from-[#0e1c38]/5 to-[#2596be]/5 p-6 rounded-2xl border-r-4 border-[#2596be] shadow-md hover:shadow-lg transition-all"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-[#2596be]/10 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-[#2596be]" />
      </div>
      <div>
        <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-[#0e1c38]">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default MemberPortal;
