import React, { useState, useEffect } from "react";

const CalendarComponent = ({ onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const generateCalendar = (month) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const daysInMonth = getDaysInMonth(year, monthIndex);
    const firstDay = getFirstDayOfMonth(year, monthIndex);
    const days = [];

    // Fill in empty days before the first day
    for (let i = 0; i < (firstDay + 6) % 7; i++) {
      days.push({ day: "", status: "empty" });
    }

    // Fill in the days of the month with sample status
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      const status =
        day === 7 || day === 8 || day === 9 || day === 10 || day === 11
          ? "pending"
          : day === 28 || day === 29 || day === 30
          ? "booked"
          : day >= 18 && day <= 19
          ? "selected"
          : "available";
      days.push({ day, status, date });
    }

    return days;
  };

  const handleDateSelect = (day) => {
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(selectedDate);
      setSelectedEndDate(null);
    } else if (selectedStartDate && !selectedEndDate) {
      if (selectedDate >= selectedStartDate) {
        setSelectedEndDate(selectedDate);
      } else {
        setSelectedStartDate(selectedDate);
      }
    }
    if (onDateSelect) {
      onDateSelect(selectedDate);
    }
  };

  const handlePrevMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  const handleNextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );

  const days = generateCalendar(currentMonth);
  const monthName = currentMonth.toLocaleString("ar-EG", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-800 font-bold text-lg">{monthName}</span>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="text-gray-600 hover:text-[#0b2f8f] transition-colors"
          >
            &lt;
          </button>
          <button
            onClick={handleNextMonth}
            className="text-gray-600 hover:text-[#0b2f8f] transition-colors"
          >
            &gt;
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center">
        <span className="text-gray-500">الإثنين</span>
        <span className="text-gray-500">الثلاثاء</span>
        <span className="text-gray-500">الأربعاء</span>
        <span className="text-gray-500">الخميس</span>
        <span className="text-gray-500">الجمعة</span>
        <span className="text-gray-500">السبت</span>
        <span className="text-gray-500">الأحد</span>
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => day.day && handleDateSelect(day.day)}
            className={`p-2 rounded-lg text-sm transition-all duration-200 hover:shadow-md ${
              day.status === "available"
                ? "bg-green-500 text-white hover:bg-green-600"
                : day.status === "booked"
                ? "bg-red-500 text-white hover:bg-red-600"
                : day.status === "pending"
                ? "bg-yellow-500 text-white hover:bg-yellow-600"
                : day.status === "selected"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 cursor-default"
            } ${
              day.day &&
              selectedStartDate &&
              day.date >= selectedStartDate &&
              (!selectedEndDate || day.date <= selectedEndDate)
                ? "bg-blue-400"
                : ""
            }`}
            disabled={!day.day}
          >
            {day.day || ""}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-4 text-sm text-gray-600">
        <span>26 - متاح</span>
        <span>26 - محجوز</span>
        <span>26 - قيد الانتظار</span>
      </div>
      <p className="text-center mt-2 text-gray-600">التكلفة: 50.00 $</p>
    </div>
  );
};

export default CalendarComponent;
