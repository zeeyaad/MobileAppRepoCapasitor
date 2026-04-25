import React from "react";

type Membership = {
  type: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Expired";
};

interface MemberData {
  name?: string;
  memberId?: string;
  photo?: string;
  id?: string;
  [key: string]: any;
}

interface ProfileTabProps {
  memberData?: MemberData | null;
  loading?: boolean;
  error?: string | null;
}

const memberships: Membership[] = [
  {
    type: "عضوية ذهبية",
    startDate: "15 يونيو 2023",
    endDate: "15 ديسمبر 2023",
    status: "Active",
  },
  {
    type: "عضوية فضية",
    startDate: "10 يناير 2023",
    endDate: "10 يونيو 2023",
    status: "Expired",
  },
];

const ProfileTab = ({ memberData = null, loading = false, error = null }: ProfileTabProps) => {
  // Helper function to get initials from name
  const getInitials = (name: string | undefined): string => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get member ID - check various possible field names
  const getMemberId = (): string => {
    if (!memberData) return "N/A";
    return memberData.memberId || memberData.id || memberData.member_id || "N/A";
  };

  // Get member name
  const getMemberName = (): string => {
    if (!memberData) return "Member";
    return memberData.name || "Member";
  };

  // Get member photo
  const getMemberPhoto = (): string | undefined => {
    if (!memberData) return undefined;
    return memberData.photo || memberData.photoUrl || memberData.photo_url || memberData.image || memberData.avatar;
  };

  const translateStatus = (status: Membership["status"]): string =>
    status === "Active" ? "سارية" : "منتهية";

  return (
    <div id="profile" className="space-y-6" dir="rtl">
      {/* Personal Information Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            المعلومات الشخصية
          </h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm transition shadow-sm">
            تعديل الملف الشخصي
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {loading ? (
            <div className="w-28 h-28 rounded-full bg-gray-200 border-4 border-gray-300 animate-pulse"></div>
          ) : getMemberPhoto() ? (
            <div className="relative">
              <img
                src={getMemberPhoto()}
                alt={getMemberName()}
                className="w-28 h-28 rounded-full border-4 border-gray-300 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = parent.querySelector('.profile-photo-fallback') as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }
                }}
              />
              <div className="w-28 h-28 rounded-full bg-gray-200 border-4 border-gray-300 hidden profile-photo-fallback items-center justify-center text-gray-500 font-bold text-2xl absolute top-0 left-0">
                {getInitials(getMemberName())}
              </div>
            </div>
          ) : (
            <div className="w-28 h-28 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center text-gray-500 font-bold text-2xl">
              {getInitials(getMemberName())}
            </div>
          )}

          <div className="text-gray-700 space-y-1 text-right">
            {loading ? (
              <>
                <h3 className="text-lg font-bold animate-pulse bg-gray-200 h-6 w-32 rounded mb-2"></h3>
                <p className="animate-pulse bg-gray-200 h-4 w-48 rounded mb-1"></p>
                <p className="animate-pulse bg-gray-200 h-4 w-40 rounded mb-1"></p>
                <p className="animate-pulse bg-gray-200 h-4 w-36 rounded mb-1"></p>
                <p className="animate-pulse bg-gray-200 h-4 w-24 rounded"></p>
              </>
            ) : error ? (
              <>
                <h3 className="text-lg font-bold">العضو</h3>
                <p className="text-red-600">خطأ: {error}</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold">{getMemberName()}</h3>
                <p>رقم العضوية: <span className="font-medium">{getMemberId()}</span></p>
                <p>البريد الإلكتروني: <span className="font-medium">{memberData?.email || "غير متاح"}</span></p>
                <p>رقم الهاتف: <span className="font-medium">{memberData?.phone || memberData?.phoneNumber || "+1 (555) 123-4567"}</span></p>
                <p>الرقم القومي: <span className="font-medium">{memberData?.nationalId || memberData?.national_id || "123-45-6789"}</span></p>
                <p>العمر: <span className="font-medium">{memberData?.age || "32"}</span></p>
                <p>الحالة الصحية: <span className="font-medium">{memberData?.healthStatus || memberData?.health_status || "جيدة"}</span></p>
                <p>الوظيفة: <span className="font-medium">{memberData?.occupation || "مهندس برمجيات"}</span></p>
                <p>اهتمامات اللياقة: <span className="font-medium">{memberData?.fitnessInterests || memberData?.fitness_interests || "تمارين الأوزان، السباحة"}</span></p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Membership History Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="border-b pb-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 text-right">
            سجل العضويات
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-right">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="p-3 font-medium">نوع العضوية</th>
                <th className="p-3 font-medium">تاريخ البدء</th>
                <th className="p-3 font-medium">تاريخ الانتهاء</th>
                <th className="p-3 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {memberships.map((m, i) => (
                <tr
                  key={i}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3">{m.type}</td>
                  <td className="p-3">{m.startDate}</td>
                  <td className="p-3">{m.endDate}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        m.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {translateStatus(m.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
export type { ProfileTabProps, MemberData };
