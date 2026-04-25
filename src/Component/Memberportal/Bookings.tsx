import React from "react";

const bookingsData = [
  {
    service: "خزانة رقم 15",
    date: "20 أكتوبر 2023، 2:00 م",
    duration: "ساعتان",
    amount: "10$",
    status: "Confirmed",
  },
  {
    service: "غرفة تدريب ب",
    date: "22 أكتوبر 2023، 10:00 ص",
    duration: "ساعة واحدة",
    amount: "30$",
    status: "Pending",
  },
];

const translateStatus = (status: string): string => {
  const value = status.toLowerCase();
  if (value === "confirmed") return "مؤكد";
  if (value === "pending") return "قيد الانتظار";
  if (value === "cancelled") return "ملغى";
  return status;
};

const Bookings: React.FC = () => {
  return (
    <div id="bookings" className="space-y-8" dir="rtl">
      {/* Service Rentals */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="border-b border-gray-200 pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">خدمات التأجير</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Locker Rental */}
          <div className="p-5 bg-white border border-gray-200 border-l-4 border-l-blue-400/70 rounded-lg shadow-sm hover:shadow-md hover:border-l-blue-500 transition">
            <h3 className="text-base font-semibold text-gray-800 mb-2">تأجير الخزائن</h3>
            <p className="text-gray-600">تأجير بالساعة أو اليوم</p>
            <p className="text-gray-600 mb-3">السعر: 5$ لكل ساعة أو 20$ لليوم</p>
            <button className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition shadow-sm">
              احجز الآن
            </button>
          </div>

          {/* Equipment Rental */}
          <div className="p-5 bg-white border border-gray-200 border-l-4 border-l-blue-400/70 rounded-lg shadow-sm hover:shadow-md hover:border-l-blue-500 transition">
            <h3 className="text-base font-semibold text-gray-800 mb-2">تأجير المعدات</h3>
            <p className="text-gray-600">أجهزة تتبع، أحذية تسلق</p>
            <p className="text-gray-600 mb-3">السعر: حسب نوع المعدات</p>
            <button className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition shadow-sm">
              احجز الآن
            </button>
          </div>

          {/* Training Room */}
          <div className="p-5 bg-white border border-gray-200 border-l-4 border-l-blue-400/70 rounded-lg shadow-sm hover:shadow-md hover:border-l-blue-500 transition">
            <h3 className="text-base font-semibold text-gray-800 mb-2">قاعة التدريب</h3>
            <p className="text-gray-600">مساحة تدريب خاصة</p>
            <p className="text-gray-600 mb-3">السعر: 30$ لكل ساعة</p>
            <button className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition shadow-sm">
              احجز الآن
            </button>
          </div>
        </div>
      </div>

      {/* My Bookings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="border-b border-gray-200 pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">حجوزاتي</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-right border border-gray-200">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="p-3 border-b font-medium">الخدمة</th>
                <th className="p-3 border-b font-medium">التاريخ والوقت</th>
                <th className="p-3 border-b font-medium">المدة</th>
                <th className="p-3 border-b font-medium">المبلغ</th>
                <th className="p-3 border-b font-medium">الحالة</th>
                <th className="p-3 border-b font-medium">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {bookingsData.map((booking, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="p-3 border-b">{booking.service}</td>
                  <td className="p-3 border-b">{booking.date}</td>
                  <td className="p-3 border-b">{booking.duration}</td>
                  <td className="p-3 border-b">{booking.amount}</td>
                  <td className="p-3 border-b">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        booking.status === "Confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {translateStatus(booking.status)}
                    </span>
                  </td>
                  <td className="p-3 border-b">
                    <button className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition shadow-sm">
                      إلغاء
                    </button>
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

export default Bookings;
