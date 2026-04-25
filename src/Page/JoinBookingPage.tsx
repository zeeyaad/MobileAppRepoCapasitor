import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  Loader2,
  CheckCircle,
  X as LucideX,
  Users,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
const hucLogo = "/assets/HUC_logo.jpeg";
const capuniLogo = "/assets/capuni.png";

interface PublicBookingDetails {
  booking_id: string;
  sport_name_ar: string;
  sport_name_en: string;
  field_name: string;
  start_time: string;
  end_time: string;
  expected_participants: number;
  registered_participants: number;
  available_slots: number;
  is_full: boolean;
  status: string;
  notes?: string | null;
}

interface JoinFormState {
  full_name: string;
  phone_number: string;
  national_id: string;
  email: string;
  national_id_front: File | null;
  national_id_back: File | null;
}

const initialForm: JoinFormState = {
  full_name: "",
  phone_number: "",
  national_id: "",
  email: "",
  national_id_front: null,
  national_id_back: null,
};

function formatDateTime(dateStr: string, type: "date" | "time") {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "-";
    if (type === "date") return d.toLocaleDateString("ar-EG");
    return d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "-";
  }
}

const JoinBookingPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<PublicBookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<JoinFormState>(initialForm);

  const fetchBooking = useCallback(async () => {
    if (!shareToken) {
      setError("رابط الدعوة غير صالح.");
      setLoading(false);
      return;
    }
    try {
      // New public endpoint handled by ParticipantRegistrationController:
      // GET /api/bookings/join/:shareToken
      const response = await api.get(`/bookings/join/${shareToken}`);
      const details = response.data?.data as PublicBookingDetails;
      setBooking({
        booking_id: details.booking_id,
        sport_name_ar: details.sport_name_ar,
        sport_name_en: details.sport_name_en,
        field_name: details.field_name,
        start_time: details.start_time,
        end_time: details.end_time,
        expected_participants: details.expected_participants,
        registered_participants: details.registered_participants,
        available_slots: details.available_slots,
        is_full: details.is_full,
        status: details.status,
        notes: details.notes,
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
        err?.message ||
        "رابط الدعوة غير صالح أو منتهي الصلاحية."
      );
    } finally {
      setLoading(false);
    }
  }, [shareToken]);

  useEffect(() => {
    void fetchBooking();
  }, [fetchBooking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareToken) return;

    const fullNameTrimmed = form.full_name.trim();
    if (!fullNameTrimmed) {
      setError("يرجى إدخال الاسم الكامل.");
      return;
    }

    const nameParts = fullNameTrimmed.split(/\s+/);
    if (nameParts.length < 2) {
      setError("يرجى إدخال الاسم بالكامل (الاسم الأول واسم العائلة على الأقل).");
      return;
    }

    if (form.phone_number && !/^01[0125]\d{8}$/.test(form.phone_number.trim())) {
      setError("رقم الهاتف غير صحيح (يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ويتكون من 11 رقم).");
      return;
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("البريد الإلكتروني غير صحيح.");
      return;
    }

    if (form.national_id) {
      const natIdTrimmed = form.national_id.trim();
      if (!/^\d{14}$/.test(natIdTrimmed)) {
        setError("الرقم القومي يجب أن يتكون من 14 رقم.");
        return;
      }
      if (natIdTrimmed.startsWith("0")) {
        setError("الرقم القومي غير صحيح (لا يمكن أن يبدأ برقم 0).");
        return;
      }
    }

    if (!form.phone_number && !form.national_id && !form.email) {
      setError(
        "يرجى إدخال وسيلة تواصل واحدة على الأقل (رقم الهاتف أو البريد الإلكتروني أو الرقم القومي)."
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append("full_name", form.full_name.trim());
      if (form.phone_number) formData.append("phone_number", form.phone_number.trim());
      if (form.national_id) formData.append("national_id", form.national_id.trim());
      if (form.email) formData.append("email", form.email.trim());

      if (form.national_id_front) {
        formData.append("national_id_front", form.national_id_front);
      }
      if (form.national_id_back) {
        formData.append("national_id_back", form.national_id_back);
      }

      // Public join endpoint with FormData:
      // POST /api/bookings/join/:shareToken
      await api.post(`/bookings/join/${shareToken}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
        err?.message ||
        "فشل التسجيل في الحجز. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center" dir="rtl">
          <Loader2 className="w-12 h-12 text-ds-primary animate-spin mx-auto mb-4" />
          <p className="text-ds-text-secondary font-bold">
            جاري تحميل تفاصيل الحجز...
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div
          dir="rtl"
          className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-ds-text-primary mb-2">
            تم التسجيل بنجاح!
          </h2>
          <p className="text-ds-text-secondary mb-8">
            لقد تم تسجيلك بنجاح كمشارك في هذا الحجز. نتمنى لك وقتاً ممتعاً!
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full h-12 bg-ds-primary text-white font-bold rounded-xl hover:bg-ds-primary-dark transition-colors"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div
          dir="rtl"
          className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <LucideX className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-ds-text-primary mb-2">
            خطأ في الرابط
          </h2>
          <p className="text-ds-text-secondary mb-8">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full h-12 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-[24px] shadow-xl overflow-hidden border border-gray-100">
          <div className="h-32 bg-[#1e40af] flex items-center justify-between px-6 relative overflow-hidden">
            <div className="flex-shrink-0 bg-white/15 p-1.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
              <img src={hucLogo} alt="HUC Logo" className="h-16 w-auto object-contain" />
            </div>

            <h1 className="text-xl font-black text-white text-center flex-1 mx-4 drop-shadow-md leading-tight">
              دعوة للانضمام لحجز
            </h1>

            <div className="flex-shrink-0 bg-white/15 p-1.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
              <img src={capuniLogo} alt="Capuni Logo" className="h-16 w-auto object-contain" />
            </div>
          </div>

          <div className="p-4">
            {booking && (
              <div className="bg-blue-50/50 rounded-xl p-3 mb-3 border border-blue-100/50">
                <h2 className="text-sm font-black text-ds-text-primary mb-2 flex items-center gap-2">
                  <span className="w-1 h-4 bg-ds-primary rounded-full" />
                  تفاصيل الحجز
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <MapPin className="w-4 h-4 text-ds-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-ds-text-muted font-bold leading-none">الملعب</p>
                      <p className="text-xs font-black text-ds-text-primary">
                        {booking.field_name || "ملعب رياضي"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 border-r md:border-r-0 md:border-solid border-gray-200 pr-4 md:pr-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Calendar className="w-4 h-4 text-ds-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] text-ds-text-muted font-bold leading-none">التاريخ</p>
                        <p className="text-xs font-black text-ds-text-primary" dir="ltr">
                          {formatDateTime(booking.start_time, "date")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Clock className="w-4 h-4 text-ds-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] text-ds-text-muted font-bold leading-none">الوقت</p>
                        <p className="text-xs font-black text-ds-text-primary" dir="ltr">
                          {formatDateTime(booking.start_time, "time")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* VISUAL PARTICIPANTS SECTION */}
                <div className="mt-3 pt-3 border-t border-blue-100/50 flex flex-col items-end text-right">
                  <div className="flex items-center gap-2 mb-1 text-[#1e40af]">
                    <span className="font-black text-sm">المشاركون</span>
                    <Users className="w-3.5 h-3.5" />
                  </div>

                  {/* Circles indicating slots */}
                  <div className="flex flex-row-reverse flex-wrap gap-1.5 mb-3">
                    {Array.from({ length: booking.expected_participants }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3.5 h-3.5 rounded-full border-2 ${i < booking.registered_participants
                          ? 'bg-ds-primary border-ds-primary'
                          : 'bg-transparent border-gray-300'
                          }`}
                      />
                    ))}
                  </div>

                  <div className="space-y-0">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-2xl font-black text-ds-text-primary leading-none">
                        {booking.registered_participants}
                      </span>
                      <span className="text-sm font-bold text-ds-text-secondary">
                        من {booking.expected_participants} مشارك
                      </span>
                    </div>
                    <div className="text-emerald-600 font-bold text-sm">
                      {booking.available_slots} أماكن شاغرة
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <h2 className="text-sm font-black text-ds-text-primary mb-1 flex items-center gap-2">
                <span className="w-1 h-4 bg-ds-orange rounded-full" />
                بيانات الانضمام
              </h2>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-ds-text-secondary mb-2">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={form.full_name}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, full_name: e.target.value }))
                      }
                      className="w-full h-12 pr-10 pl-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ds-primary focus:border-transparent outline-none transition-all font-bold"
                      placeholder="أدخل اسمك بالكامل"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-ds-text-secondary mb-2">
                      رقم الهاتف
                    </label>
                    <div className="relative">
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={form.phone_number}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            phone_number: e.target.value,
                          }))
                        }
                        className="w-full h-12 pr-10 pl-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ds-primary focus:border-transparent outline-none transition-all font-bold"
                        placeholder="01xxxxxxxxx"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-ds-text-secondary mb-2">
                      البريد الإلكتروني
                    </label>
                    <div className="relative">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, email: e.target.value }))
                        }
                        className="w-full h-12 pr-10 pl-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ds-primary focus:border-transparent outline-none transition-all font-bold"
                        placeholder="example@mail.com"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-ds-text-secondary mb-2">
                    الرقم القومي
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={form.national_id}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          national_id: e.target.value,
                        }))
                      }
                      className="w-full h-12 pr-10 pl-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ds-primary focus:border-transparent outline-none transition-all font-bold"
                      placeholder="أدخل الـ 14 رقم"
                      maxLength={14}
                    />
                  </div>
                </div>

                {/* FILE UPLOADS FOR NATIONAL ID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-ds-text-secondary mb-2">
                      صورة الرقم القومي (وجه)
                    </label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setForm(prev => ({ ...prev, national_id_front: file }));
                        }}
                        className="hidden"
                        id="front-id-upload"
                      />
                      <label
                        htmlFor="front-id-upload"
                        className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${form.national_id_front
                          ? 'border-ds-primary bg-blue-50/50'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                          }`}
                      >
                        {form.national_id_front ? (
                          <div className="flex flex-col items-center text-ds-primary">
                            <CheckCircle className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-bold truncate max-w-[120px]">
                              {form.national_id_front.name}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-gray-400">
                            <ImageIcon className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-bold">ارفع وجه البطاقة</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-ds-text-secondary mb-1.5">
                      صورة الرقم القومي (ظهر)
                    </label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setForm(prev => ({ ...prev, national_id_back: file }));
                        }}
                        className="hidden"
                        id="back-id-upload"
                      />
                      <label
                        htmlFor="back-id-upload"
                        className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${form.national_id_back
                          ? 'border-ds-primary bg-blue-50/50'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                          }`}
                      >
                        {form.national_id_back ? (
                          <div className="flex flex-col items-center text-ds-primary">
                            <CheckCircle className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-bold truncate max-w-[120px]">
                              {form.national_id_back.name}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-gray-400">
                            <ImageIcon className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-bold">ارفع ظهر البطاقة</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-ds-text-muted font-medium bg-gray-50 p-2 rounded-lg border border-gray-100 flex items-center gap-2">
                <Upload className="w-3.5 h-3.5 text-ds-primary" />
                <span>يجب إدخال وسيلة تواصل واحدة على الأقل. يفضل إرفاق صور البطاقة لتوثيق الهوية.</span>
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 bg-ds-primary text-white font-black text-base rounded-xl hover:bg-ds-primary-dark shadow-lg shadow-ds-primary/20 disabled:opacity-60 transition-all active:scale-95"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري التسجيل...</span>
                  </span>
                ) : (
                  "تأكيد الانضمام للحجز"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinBookingPage;
