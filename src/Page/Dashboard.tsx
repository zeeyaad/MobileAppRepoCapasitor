import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Calendar, Shield, LogOut, CheckCircle } from 'lucide-react';
import { AuthService } from '../services/authService';
import type { UserInfo } from '../types';

const Dashboard: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user info from localStorage (stored during login)
    const user = AuthService.getUserInfo();
    setUserInfo(user);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">لم يتم تسجيل الدخول</h2>
          <p className="text-gray-600 mb-6">يرجى تسجيل الدخول للوصول إلى هذه الصفحة</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6" dir="rtl">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم - الموظفين</h1>
            <p className="text-gray-600 mt-1">مرحباً بك في نادي جامعة حلوان</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-bold"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Success Badge */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-bold text-green-800">تم التحقق من الاتصال بالـ Backend</p>
            <p className="text-sm text-green-700">البيانات التالية مستخرجة من JWT Token المخزن بعد تسجيل الدخول</p>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30">
                <User className="w-12 h-12" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{userInfo.name_en || 'مستخدم'}</h2>
                <p className="text-blue-100 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {userInfo.email}
                </p>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-gray-200">
              معلومات المستخدم
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account ID */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">رقم الحساب</p>
                </div>
                <p className="text-2xl font-bold text-gray-800 mr-13">{userInfo.account_id}</p>
              </div>

              {/* Staff ID */}
              {userInfo.staff_id && (
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">رقم الموظف</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mr-13">{userInfo.staff_id}</p>
                </div>
              )}

              {/* Staff Type */}
              {userInfo.staff_type && (
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">نوع الموظف</p>
                  </div>
                  <p className="text-xl font-bold text-gray-800 mr-13">{userInfo.staff_type}</p>
                  <p className="text-sm text-gray-500 mr-13">ID: {userInfo.staff_type_id}</p>
                </div>
              )}

              {/* Role */}
              {userInfo.role && (
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">الدور</p>
                  </div>
                  <p className="text-xl font-bold text-gray-800 mr-13">{userInfo.role}</p>
                </div>
              )}

              {/* Status */}
              {userInfo.status && (
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-teal-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">الحالة</p>
                  </div>
                  <p className="text-xl font-bold text-gray-800 mr-13">{userInfo.status}</p>
                </div>
              )}
            </div>

            {/* Privileges Section */}
            {userInfo.privileges && userInfo.privileges.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-bold text-gray-800 mb-4">الصلاحيات</h4>
                <div className="flex flex-wrap gap-2">
                  {userInfo.privileges.map((privilege, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                    >
                      {privilege}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Data Section (for debugging) */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200">
              <details className="cursor-pointer">
                <summary className="text-sm font-bold text-gray-600 hover:text-gray-800 mb-3">
                  عرض البيانات الكاملة (للمط developers)
                </summary>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                  {JSON.stringify(userInfo, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
