import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useRef } from 'react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const CONTACT_EMAIL = 'huc@hq.helwan.edu.eg';
const CLUB_LOCATION_URL = 'https://maps.app.goo.gl/cvi5kAenfG6cPwBh6';
const CLUB_MAP_EMBED_URL = 'https://maps.google.com/maps?hl=ar&q=%D8%AC%D8%A7%D9%85%D8%B9%D8%A9%20%D8%AD%D9%84%D9%88%D8%A7%D9%86%20%D8%A7%D9%84%D9%82%D8%A7%D9%87%D8%B1%D8%A9&z=13&output=embed';

const ContactPage: React.FC = () => {
  const { t } = useTranslation("landing");
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const faqItemsRef = useRef<(HTMLDetailsElement | null)[]>([]);

  useEffect(() => {
    // // Add Cairo font to document head
    // const link = document.createElement('link');
    // link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap';
    // link.rel = 'stylesheet';
    // document.head.appendChild(link);

    // // Set document direction
    // document.documentElement.dir = 'rtl';
    // document.documentElement.lang = 'ar';

    // Intersection Observer for animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    // Observe contact cards and FAQ items
    contactCardsRef.current.forEach((card) => card && observer.observe(card));
    faqItemsRef.current.forEach((item) => item && observer.observe(item));

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const subjectLabels: Record<string, string> = {
      membership: t("contact.form.subj_membership", "استفسار عن العضوية"),
      vendor: t("contact.form.subj_vendor", "أن تكون مورد"),
      reservation: t("contact.form.subj_reservation", "حجز ملعب أو نشاط"),
      complaint: t("contact.form.subj_complaint", "شكوى أو اقتراح"),
      other: t("contact.form.subj_other", "آخر"),
    };

    const selectedSubject = subjectLabels[formData.subject] || t("contact.form.msg_from_form", "رسالة من نموذج التواصل");
    const body = [
      `الاسم: ${formData.name}`,
      `البريد الإلكتروني: ${formData.email}`,
      `رقم الهاتف: ${formData.phone}`,
      `الموضوع: ${selectedSubject}`,
      '',
      'الرسالة:',
      formData.message,
    ].join('\n');

    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(selectedSubject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;

    setIsSubmitting(false);
    setIsSubmitted(true);

    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      setIsSubmitted(false);
    }, 2000);
  };

  const contactInfo = [
    {
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: t("contact.phone", "الهاتف"),
      content: (
        <a href="tel:1913641" className="text-primary-dark font-bold text-2xl hover:text-[#ffd700] transition-colors">
          1913641
        </a>
      ),
    },
    {
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: t("contact.email", "البريد الإلكتروني"),
      content: (
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-dark font-semibold text-lg hover:text-primary-yellow transition-colors hover:text-[#ffd700] transition-colors block">
          {CONTACT_EMAIL}
        </a>
      ),
    },
    {
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: t("contact.address", "العنوان"),
      content: (
        <a
          href={CLUB_LOCATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-dark font-semibold text-lg hover:text-[#ffd700] transition-colors block"
        >
          {t("contact.map", "الموقع على الخريطة")}
        </a>
      ),
    },
  ];

  const faqItems = [
    {
      question: t("contact.faq.q1", "كيف يمكنني التسجيل كعضو جديد؟"),
      answer: t("contact.faq.a1", "يمكنك التسجيل من خلال زيارة فرعنا في المعادي أو التواصل معنا عبر الهاتف. سيقوم فريقنا بمساعدتك في اختيار باقة العضوية المناسبة."),
    },
    {
      question: t("contact.faq.q2", "ما هي وسائل الدفع المتاحة؟"),
      answer: t("contact.faq.a2", "نقبل الدفع النقدي، بطاقات الائتمان، والتحويل البنكي. كما نوفر خيارات الدفع بالتقسيط لبعض الباقات."),
    },
    {
      question: t("contact.faq.q3", "هل يمكنني إلغاء العضوية؟"),
      answer: t("contact.faq.a3", "نعم، يمكنك إلغاء العضوية وفقًا لسياسة الإلغاء الخاصة بنا. يرجى الاتصال بخدمة العملاء لمزيد من التفاصيل."),
    },
    {
      question: t("contact.faq.q4", "هل توفرون مواقف للسيارات؟"),
      answer: t("contact.faq.a4", "نعم، يتوفر موقف واسع للسيارات مجانًا لجميع الأعضاء والزوار."),
    },
  ];

  const socialLinks = [
    {
      label: 'Facebook',
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      href: "https://www.facebook.com/share/1ADZY7CcCU/?mibextid=wwXIfr",
    },
    {
      label: 'Instagram',
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      href: "https://www.instagram.com/helwan.university.club/",
    },
    {
      label: 'X',
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2H21.5l-7.12 8.138L22.5 22h-6.356l-4.98-6.94L4.95 22H1.69l7.62-8.71L1.5 2h6.52l4.5 6.28L18.244 2zm-1.115 18h1.8L6.13 3.895H4.2L17.13 20z" />
        </svg>
      ),
      href: "https://x.com/Helwan_HUC",
    },
  ];

  return (
    <div className="font-cairo bg-gray-50" >
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary-navy hero-pattern">
        <div className="gradient-overlay">
          <div className="container mx-auto px-4 py-20 md:py-32">
            <div className="max-w-4xl mx-auto text-center text-white animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
                {t("contact.title", "تواصل معنا")}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                {t("contact.subtitle", "عايز تكون عضو، مورد، أو عندك استفسار؟ استخدم النموذج أدناه للتواصل معنا")}
              </p>
              <div className="flex items-center justify-center gap-4 text-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-yellow rounded-full animate-pulse"></div>
                  <span className="text-white/80">{t("contact.or_call", "أو اتصل بنا على")}</span>
                </div>
                <a href="tel:1913641" className="text-[#FDBF00] font-bold text-2xl hover:text-[#ffd700] transition-colors">
                  1913641
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB" />
          </svg>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto -mt-20 relative z-10">
            {contactInfo.map((item, index) => (
              <div
                key={index}
                ref={(el) => { contactCardsRef.current[index] = el; }}
                className="contact-card bg-white rounded-3xl shadow-xl p-8 text-center transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="w-20 h-20 bg-[#0A1A44] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                {item.content}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

              {/* Contact Form */}
              <div className="bg-gray-50 rounded-3xl shadow-xl p-8 md:p-12">
                <div className="mb-8">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("contact.form.title", "أرسل لنا رسالة")}</h2>
                  <p className="text-gray-600 text-lg">{t("contact.form.subtitle", "املأ النموذج وسنتواصل معك في أقرب وقت")}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-gray-800 font-bold mb-2 text-lg">{t("contact.form.name", "الاسم الكامل")}</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t("contact.form.name_placeholder", "أدخل اسمك")}
                      className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg transition-all duration-300 bg-white focus:border-primary-dark focus:ring-3 focus:ring-primary-dark/10"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-gray-800 font-bold mb-2 text-lg">{t("contact.email", "البريد الإلكتروني")}</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="example@email.com"
                      className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg transition-all duration-300 bg-white focus:border-primary-dark focus:ring-3 focus:ring-primary-dark/10"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-gray-800 font-bold mb-2 text-lg">{t("contact.form.phone", "رقم الهاتف")}</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+20 XXX XXX XXXX"
                      className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg transition-all duration-300 bg-white focus:border-primary-dark focus:ring-3 focus:ring-primary-dark/10"
                      required
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-gray-800 font-bold mb-2 text-lg">{t("contact.form.subject", "الموضوع")}</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg transition-all duration-300 bg-white focus:border-primary-dark focus:ring-3 focus:ring-primary-dark/10"
                    >
                      <option value="">{t("contact.form.subject_empty", "اختر الموضوع")}</option>
                      <option value="membership">{t("contact.form.subj_membership", "استفسار عن العضوية")}</option>
                      <option value="vendor">{t("contact.form.subj_vendor", "أن تكون مورد")}</option>
                      <option value="reservation">{t("contact.form.subj_reservation", "حجز ملعب أو نشاط")}</option>
                      <option value="complaint">{t("contact.form.subj_complaint", "شكوى أو اقتراح")}</option>
                      <option value="other">{t("contact.form.subj_other", "آخر")}</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-gray-800 font-bold mb-2 text-lg">{t("contact.form.message", "الرسالة")}</label>
                    <textarea
                      rows={5}
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={t("contact.form.message_placeholder", "اكتب رسالتك هنا...")}
                      className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg transition-all duration-300 resize-none bg-white focus:border-primary-dark focus:ring-3 focus:ring-primary-dark/10"
                      required
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isSubmitted}
                    className={`w-full bg-gradient-to-r from-[#0e1c38] to-[#0A1A44] ${isSubmitted
                        ? 'bg-green-600'
                        : 'bg-gradient-to-r from-primary-navy to-primary-dark hover:from-primary-dark hover:to-primary-navy'
                      } text-white py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:transform-none disabled:hover:shadow-lg`}
                  >
                    {isSubmitting ? t("contact.form.sending", "جاري الإرسال...") : isSubmitted ? t("contact.form.success", "✓ تم الإرسال بنجاح!") : t("contact.form.submit", "إرسال الرسالة")}
                  </button>
                </form>
              </div>

              {/* Map & Info */}
              <div className="space-y-8">
                {/* Map */}
                <div className="map-container">
                  <iframe
                    src={CLUB_MAP_EMBED_URL}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    className="rounded-3xl"
                    title="Helwan Club Location"
                  ></iframe>
                </div>

                {/* Working Hours */}
                <div className="bg-gray-50 rounded-3xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <svg className="w-8 h-8 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t("contact.hours.title", "ساعات العمل")}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-700 font-semibold text-lg">{t("contact.hours.sat_thu", "السبت - الخميس")}</span>
                      <span className="text-primary-dark font-bold text-lg">{t("contact.hours.sat_thu_time", "6:00 ص - 11:00 م")}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-700 font-semibold text-lg">{t("contact.hours.fri", "الجمعة")}</span>
                      <span className="text-primary-dark font-bold text-lg">{t("contact.hours.fri_time", "8:00 ص - 12:00 ص")}</span>
                    </div>
                    <div className="bg-primary-yellow/10 rounded-2xl p-4 mt-4">
                      <p className="text-gray-700 text-center font-medium">
                        {t("contact.hours.offers", "🎉 عروض خاصة متاحة في عطلات نهاية الأسبوع")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">{t("contact.social.title", "تابعنا على")}</h3>
                  <div className="flex justify-center gap-4">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="w-14 h-14 bg-[#0A1A44] hover:bg-[#FDBF00] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t("contact.faq_section.title", "الأسئلة الشائعة")}</h2>
              <p className="text-gray-600 text-lg">{t("contact.faq_section.subtitle", "إجابات سريعة لأكثر الأسئلة شيوعًا")}</p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <details
                  key={index}
                  ref={(el) => { faqItemsRef.current[index] = el; }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden group"
                >
                  <summary className="cursor-pointer p-6 font-bold text-lg text-gray-900 hover:bg-gray-50 transition-colors list-none flex justify-between items-center">
                    <span>{item.question}</span>
                    <svg className="w-6 h-6 transform group-open:rotate-180 transition-transform text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="p-6 pt-0 text-gray-600 leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-[#0e1c38]">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("contact.cta.title", "جاهز للانضمام؟")}</h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              {t("contact.cta.subtitle", "ابدأ رحلتك الرياضية معنا اليوم واستمتع بأفضل الخدمات")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#FDBF00] hover:bg-[#ffd700] text-[#0e1c38] px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                {t("contact.cta.subscribe", "اشترك الآن")}
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 border-2 border-white/40 backdrop-blur-sm hover:border-white/60">
                {t("contact.cta.contact", "تواصل معنا")}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-[#0e1c38] py-4">
        <div className="max-w-5xl mx-auto px-6">
          <div className="h-px w-full bg-white/20"></div>
        </div>
      </div>

      <style>{`
        .gradient-overlay {
          background: linear-gradient(135deg, rgba(10, 26, 68, 0.95) 0%, rgba(14, 28, 56, 0.9) 100%);
        }
        
        .hero-pattern {
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(253, 191, 0, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(253, 191, 0, 0.1) 0%, transparent 50%);
        }
        
        .map-container {
          position: relative;
          width: 100%;
          height: 450px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default ContactPage;
