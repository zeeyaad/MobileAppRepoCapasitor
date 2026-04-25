import React from "react";

type AccessLog = {
  date: string;
  location: string;
  type: string;
};

const accessLogs: AccessLog[] = [
  { date: "15 أكتوبر 2023، 10:30 ص", location: "المدخل الرئيسي", type: "دخول" },
  { date: "15 أكتوبر 2023، 12:15 م", location: "المدخل الرئيسي", type: "خروج" },
  { date: "14 أكتوبر 2023، 4:30 م", location: "منطقة المسبح", type: "دخول" },
];

const MembershipTab: React.FC = () => {
  return (
    <div id="membership" className="space-y-6" dir="rtl">
      {/* Current Membership Card */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            العضوية الحالية
          </h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
            تجديد العضوية
          </button>
        </div>

        <div className="text-gray-700 space-y-2 text-right">
          <h3 className="text-lg font-bold">عضوية ذهبية</h3>
          <p>تاريخ البدء: <span className="font-medium">15 يونيو 2023</span></p>
          <p>تاريخ الانتهاء: <span className="font-medium">15 ديسمبر 2023</span></p>
          <p>الأيام المتبقية: <span className="font-medium text-green-600">45 يومًا</span></p>
          <p>
            المزايا:{" "}
            <span className="font-medium">
              دخول غير محدود، جلسات تدريب شخصي، أولوية في الحجز
            </span>
          </p>
        </div>
      </div>

      {/* RFID Card Management */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="border-b pb-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            إدارة بطاقة RFID
          </h2>
        </div>

        <div className="text-gray-700 space-y-3 text-right">
          <p>
            حالة البطاقة:{" "}
            <span className="font-medium text-green-600">سارية</span>
          </p>
          <p>
            آخر استخدام: <span className="font-medium">اليوم، 10:30 ص</span>
          </p>
          <div className="flex flex-wrap gap-3 mt-2 justify-end">
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition">
              الإبلاغ عن فقدان البطاقة
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
              طلب بطاقة جديدة
            </button>
          </div>
        </div>
      </div>

      {/* Access Logs */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="border-b pb-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800 text-right">سجل الدخول</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-right">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="p-3 font-semibold text-right">التاريخ والوقت</th>
                <th className="p-3 font-semibold text-right">الموقع</th>
                <th className="p-3 font-semibold text-right">نوع الدخول</th>
              </tr>
            </thead>
            <tbody>
              {accessLogs.map((log, i) => (
                <tr key={i} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3">{log.date}</td>
                  <td className="p-3">{log.location}</td>
                  <td className="p-3">{log.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MembershipTab;
