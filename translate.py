import re

path = 'd:/GPProjectRepo/src/Component/LandingPageComponents/ContactUs.tsx'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

# Add useTranslation import if not there
if 'useTranslation' not in code:
    code = code.replace('import React', 'import { useTranslation } from \'react-i18next\';\nimport React')

# Add const { t } = useTranslation('landing') inside ContactPage
if 'const { t } = useTranslation(' not in code:
    code = code.replace('const ContactPage: React.FC = () => {', 'const ContactPage: React.FC = () => {\n  const { t } = useTranslation("landing");')

replacements = [
  (r'>تواصل معنا<', '>{t("contact.cta.contact", "تواصل معنا")}<'),
  (r'"تواصل معنا"', 't("contact.title", "تواصل معنا")'),
  (r'عايز تكون عضو، مورد، أو عندك استفسار؟ استخدم النموذج أدناه للتواصل معنا', '{t("contact.subtitle", "عايز تكون عضو، مورد، أو عندك استفسار؟ استخدم النموذج أدناه للتواصل معنا")}'),
  (r'أو اتصل بنا على', '{t("contact.or_call", "أو اتصل بنا على")}'),
  (r'"الهاتف"', 't("contact.phone", "الهاتف")'),
  (r'"البريد الإلكتروني"', 't("contact.email", "البريد الإلكتروني")'),
  (r'"العنوان"', 't("contact.address", "العنوان")'),
  (r'>الموقع على الخريطة<', '>{t("contact.map", "الموقع على الخريطة")}<'),
  (r'"كيف يمكنني التسجيل كعضو جديد؟"', 't("contact.faq.q1", "كيف يمكنني التسجيل كعضو جديد؟")'),
  (r'"يمكنك التسجيل من خلال زيارة فرعنا في المعادي أو التواصل معنا عبر الهاتف\. سيقوم فريقنا بمساعدتك في اختيار باقة العضوية المناسبة\."', 't("contact.faq.a1", "يمكنك التسجيل من خلال زيارة فرعنا في المعادي أو التواصل معنا عبر الهاتف. سيقوم فريقنا بمساعدتك في اختيار باقة العضوية المناسبة.")'),
  (r'"ما هي وسائل الدفع المتاحة؟"', 't("contact.faq.q2", "ما هي وسائل الدفع المتاحة؟")'),
  (r'"نقبل الدفع النقدي، بطاقات الائتمان، والتحويل البنكي\. كما نوفر خيارات الدفع بالتقسيط لبعض الباقات\."', 't("contact.faq.a2", "نقبل الدفع النقدي، بطاقات الائتمان، والتحويل البنكي. كما نوفر خيارات الدفع بالتقسيط لبعض الباقات.")'),
  (r'"هل يمكنني إلغاء العضوية؟"', 't("contact.faq.q3", "هل يمكنني إلغاء العضوية؟")'),
  (r'"نعم، يمكنك إلغاء العضوية وفقًا لسياسة الإلغاء الخاصة بنا\. يرجى الاتصال بخدمة العملاء لمزيد من التفاصيل\."', 't("contact.faq.a3", "نعم، يمكنك إلغاء العضوية وفقًا لسياسة الإلغاء الخاصة بنا. يرجى الاتصال بخدمة العملاء لمزيد من التفاصيل.")'),
  (r'"هل توفرون مواقف للسيارات؟"', 't("contact.faq.q4", "هل توفرون مواقف للسيارات؟")'),
  (r'"نعم، يتوفر موقف واسع للسيارات مجانًا لجميع الأعضاء والزوار\."', 't("contact.faq.a4", "نعم، يتوفر موقف واسع للسيارات مجانًا لجميع الأعضاء والزوار.")'),
  (r'>أرسل لنا رسالة<', '>{t("contact.form.title", "أرسل لنا رسالة")}<'),
  (r'>املأ النموذج وسنتواصل معك في أقرب وقت<', '>{t("contact.form.subtitle", "املأ النموذج وسنتواصل معك في أقرب وقت")}<'),
  (r'>الاسم الكامل<', '>{t("contact.form.name", "الاسم الكامل")}<'),
  (r'"أدخل اسمك"', 't("contact.form.name_placeholder", "أدخل اسمك")'),
  (r'>رقم الهاتف<', '>{t("contact.form.phone", "رقم الهاتف")}<'),
  (r'>الموضوع<', '>{t("contact.form.subject", "الموضوع")}<'),
  (r'>اختر الموضوع<', '>{t("contact.form.subject_empty", "اختر الموضوع")}<'),
  (r'>استفسار عن العضوية<', '>{t("contact.form.subj_membership", "استفسار عن العضوية")}<'),
  (r'>أن تكون مورد<', '>{t("contact.form.subj_vendor", "أن تكون مورد")}<'),
  (r'>حجز ملعب أو نشاط<', '>{t("contact.form.subj_reservation", "حجز ملعب أو نشاط")}<'),
  (r'>شكوى أو اقتراح<', '>{t("contact.form.subj_complaint", "شكوى أو اقتراح")}<'),
  (r'>آخر<', '>{t("contact.form.subj_other", "آخر")}<'),
  (r'>الرسالة<', '>{t("contact.form.message", "الرسالة")}<'),
  (r'"اكتب رسالتك هنا\.\.\."', 't("contact.form.message_placeholder", "اكتب رسالتك هنا...")'),
  (r'(?<!>)جاري الإرسال\.\.\.(?!<)', 't("contact.form.sending", "جاري الإرسال...")'),
  (r'(?<!>)✓ تم الإرسال بنجاح!(?!<)', 't("contact.form.success", "✓ تم الإرسال بنجاح!")'),
  (r'(?<!>)إرسال الرسالة(?!<)', 't("contact.form.submit", "إرسال الرسالة")'),
  (r'>ساعات العمل<', '>{t("contact.hours.title", "ساعات العمل")}<'),
  (r'>السبت - الخميس<', '>{t("contact.hours.sat_thu", "السبت - الخميس")}<'),
  (r'>6:00 ص - 11:00 م<', '>{t("contact.hours.sat_thu_time", "6:00 ص - 11:00 م")}<'),
  (r'>الجمعة<', '>{t("contact.hours.fri", "الجمعة")}<'),
  (r'>8:00 ص - 12:00 ص<', '>{t("contact.hours.fri_time", "8:00 ص - 12:00 ص")}<'),
  (r'🎉 عروض خاصة متاحة في عطلات نهاية الأسبوع', '{t("contact.hours.offers", "🎉 عروض خاصة متاحة في عطلات نهاية الأسبوع")}'),
  (r'>تابعنا على<', '>{t("contact.social.title", "تابعنا على")}<'),
  (r'>الأسئلة الشائعة<', '>{t("contact.faq_section.title", "الأسئلة الشائعة")}<'),
  (r'>إجابات سريعة لأكثر الأسئلة شيوعًا<', '>{t("contact.faq_section.subtitle", "إجابات سريعة لأكثر الأسئلة شيوعًا")}<'),
  (r'>جاهز للانضمام؟<', '>{t("contact.cta.title", "جاهز للانضمام؟")}<'),
  (r'ابدأ رحلتك الرياضية معنا اليوم واستمتع بأفضل الخدمات', '{t("contact.cta.subtitle", "ابدأ رحلتك الرياضية معنا اليوم واستمتع بأفضل الخدمات")}'),
  (r'>اشترك الآن<', '>{t("contact.cta.subscribe", "اشترك الآن")}<'),
  (r'رسالة من نموذج التواصل', 't("contact.form.msg_from_form", "رسالة من نموذج التواصل")'),
  (r'استفسار عن العضوية', 't("contact.form.subj_membership", "استفسار عن العضوية")'),
  (r'أن تكون مورد', 't("contact.form.subj_vendor", "أن تكون مورد")'),
  (r'حجز ملعب أو نشاط', 't("contact.form.subj_reservation", "حجز ملعب أو نشاط")'),
  (r'شكوى أو اقتراح', 't("contact.form.subj_complaint", "شكوى أو اقتراح")'),
  (r"'آخر'", 't("contact.form.subj_other", "آخر")'),
  (r'dir="rtl"', ''), 
  (r"dir='rtl'", ''),
]

for pat, rep in replacements:
    code = re.sub(pat, rep, code)

with open(path, 'w', encoding='utf-8') as f:
    f.write(code)
