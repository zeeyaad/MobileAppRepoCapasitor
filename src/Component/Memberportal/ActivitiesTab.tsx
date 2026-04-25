import React from "react";

type Activity = {
  name: string;
  description: string;
  price: string;
  buttonLabel: string;
};

type Subscription = {
  activity: string;
  remaining: string;
  expiryDate: string;
  status: "Active" | "Expired";
};

const activities: Activity[] = [
  {
    name: "المسبح",
    description: "باقة 10 زيارات شهرية",
    price: "50$",
    buttonLabel: "اشترك الآن",
  },
  {
    name: "حصص اليوغا",
    description: "باقة 8 جلسات شهرية",
    price: "40$",
    buttonLabel: "اشترك الآن",
  },
  {
    name: "تدريب شخصي",
    description: "باقة 5 جلسات مخصصة",
    price: "200$",
    buttonLabel: "احجز جلسة",
  },
];

const subscriptions: Subscription[] = [
  {
    activity: "المسبح",
    remaining: "7/10",
    expiryDate: "15 نوفمبر 2023",
    status: "Active",
  },
  {
    activity: "حصص اليوغا",
    remaining: "3/8",
    expiryDate: "10 نوفمبر 2023",
    status: "Active",
  },
];

const getStatusLabel = (status: Subscription["status"]): string =>
  status === "Active" ? "نشطة" : "منتهية";

const ActivitiesTab: React.FC = () => {
  return (
    <div id="activities" className="space-y-6" dir="rtl">
      {/* Available Activities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="border-b pb-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 text-right">
            الأنشطة المتاحة
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((act, i) => (
            <div
              key={i}
              className="border border-gray-200 border-l-4 border-l-blue-400/70 rounded-lg p-5 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-l-blue-500 transition"
            >
              <div className="text-right">
                <h3 className="text-base font-semibold text-gray-800 mb-1">
                  {act.name}
                </h3>
                <p className="text-gray-600">{act.description}</p>
                <p className="text-gray-700 mt-2 font-medium">
                  السعر: {act.price}
                </p>
              </div>
              <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm transition shadow-sm">
                {act.buttonLabel}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* My Activity Subscriptions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="border-b pb-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 text-right">
            اشتراكاتي في الأنشطة
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-right">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="p-3 font-medium">النشاط</th>
                <th className="p-3 font-medium">الجلسات المتبقية</th>
                <th className="p-3 font-medium">تاريخ الانتهاء</th>
                <th className="p-3 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub, i) => (
                <tr
                  key={i}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3">{sub.activity}</td>
                  <td className="p-3">{sub.remaining}</td>
                  <td className="p-3">{sub.expiryDate}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        sub.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {getStatusLabel(sub.status)}
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

export default ActivitiesTab;
