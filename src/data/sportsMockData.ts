// ─── Sports Members Mock Data ─────────────────────────────────────────────────
// All exports here are temporary static data.
// When the backend endpoints are ready, replace each export with a real API call.

export type SportRow = {
    id: number;
    name_ar: string;
    name_en: string;
    is_active: boolean;
    memberCount: number;
};

export type MemberRow = {
    id: number;
    memberId: string;     // e.g. MEM-001
    nameAr: string;
    nameEn: string;
    phone: string;
    nationalId: string;
    status: "نشط" | "قيد المراجعة" | "موقوف";
};

// TODO: Replace with real API call when endpoint is ready
// Endpoint: GET /api/sports
export const MOCK_SPORTS: SportRow[] = [
    { id: 1, name_ar: "كرة القدم", name_en: "Football", is_active: true, memberCount: 24 },
    { id: 2, name_ar: "كرة السلة", name_en: "Basketball", is_active: true, memberCount: 15 },
    { id: 3, name_ar: "كرة الطائرة", name_en: "Volleyball", is_active: true, memberCount: 12 },
    { id: 4, name_ar: "السباحة", name_en: "Swimming", is_active: true, memberCount: 30 },
    { id: 5, name_ar: "كرة اليد", name_en: "Handball", is_active: false, memberCount: 8 },
    { id: 6, name_ar: "التنس", name_en: "Tennis", is_active: true, memberCount: 10 },
];

// TODO: Replace with real API call when endpoint is ready
// Endpoint: GET /api/sports/team-members/sport/:sportName
export const MOCK_SPORT_MEMBERS: Record<number, MemberRow[]> = {
    1: [
        { id: 101, memberId: "MEM-101", nameAr: "أحمد محمود علي", nameEn: "Ahmed Mahmoud Ali", phone: "01001234567", nationalId: "29901011234567", status: "نشط" },
        { id: 102, memberId: "MEM-102", nameAr: "محمد حسن إبراهيم", nameEn: "Mohamed Hassan Ibrahim", phone: "01112345678", nationalId: "30002021234567", status: "نشط" },
        { id: 103, memberId: "MEM-103", nameAr: "عمر عبدالله خالد", nameEn: "Omar Abdullah Khaled", phone: "01223456789", nationalId: "29805031234567", status: "قيد المراجعة" },
        { id: 104, memberId: "MEM-104", nameAr: "يوسف سمير فارس", nameEn: "Yousef Samir Fares", phone: "01534567890", nationalId: "30106041234567", status: "نشط" },
        { id: 105, memberId: "MEM-105", nameAr: "كريم وليد منصور", nameEn: "Karim Walid Mansour", phone: "01067891234", nationalId: "29707051234567", status: "موقوف" },
    ],
    2: [
        { id: 201, memberId: "MEM-201", nameAr: "سارة أحمد عمر", nameEn: "Sara Ahmed Omar", phone: "01098765432", nationalId: "30108061234567", status: "نشط" },
        { id: 202, memberId: "MEM-202", nameAr: "نور الدين محمد", nameEn: "Nour Eldin Mohamed", phone: "01187654321", nationalId: "29909071234567", status: "نشط" },
        { id: 203, memberId: "MEM-203", nameAr: "ياسمين طارق سالم", nameEn: "Yasmine Tarek Salem", phone: "01276543210", nationalId: "30010081234567", status: "قيد المراجعة" },
        { id: 204, memberId: "MEM-204", nameAr: "مصطفى جمال النجار", nameEn: "Mostafa Gamal Elnaggar", phone: "01565432109", nationalId: "29811091234567", status: "نشط" },
    ],
    3: [
        { id: 301, memberId: "MEM-301", nameAr: "رنا علي حسن", nameEn: "Rana Ali Hassan", phone: "01012345678", nationalId: "30212101234567", status: "نشط" },
        { id: 302, memberId: "MEM-302", nameAr: "هدى محمود فؤاد", nameEn: "Hoda Mahmoud Fouad", phone: "01123456789", nationalId: "29813111234567", status: "نشط" },
        { id: 303, memberId: "MEM-303", nameAr: "ليلى عبدالرحمن", nameEn: "Laila Abdel Rahman", phone: "01234567890", nationalId: "30114121234567", status: "موقوف" },
    ],
    4: [
        { id: 401, memberId: "MEM-401", nameAr: "خالد إبراهيم نجيب", nameEn: "Khaled Ibrahim Naguib", phone: "01545678901", nationalId: "29815131234567", status: "نشط" },
        { id: 402, memberId: "MEM-402", nameAr: "دينا وائل رشدي", nameEn: "Dina Wael Rushdi", phone: "01056789012", nationalId: "30016141234567", status: "نشط" },
        { id: 403, memberId: "MEM-403", nameAr: "مريم حاتم زيدان", nameEn: "Mariam Hatem Zeidan", phone: "01167890123", nationalId: "29817151234567", status: "قيد المراجعة" },
        { id: 404, memberId: "MEM-404", nameAr: "تامر صلاح الدين", nameEn: "Tamer Salah Eldin", phone: "01278901234", nationalId: "30118161234567", status: "نشط" },
        { id: 405, memberId: "MEM-405", nameAr: "أميرة فتحي زكريا", nameEn: "Amira Fathy Zakaria", phone: "01589012345", nationalId: "29919171234567", status: "نشط" },
    ],
    5: [
        { id: 501, memberId: "MEM-501", nameAr: "عمرو حمدي الشرقاوي", nameEn: "Amr Hamdy Elsharkawy", phone: "01090123456", nationalId: "30020181234567", status: "نشط" },
        { id: 502, memberId: "MEM-502", nameAr: "شيماء محمد رمضان", nameEn: "Shaimaa Mohamed Ramadan", phone: "01101234567", nationalId: "29821191234567", status: "موقوف" },
        { id: 503, memberId: "MEM-503", nameAr: "إسلام عادل الجندي", nameEn: "Islam Adel Elgundi", phone: "01212345678", nationalId: "30022201234567", status: "قيد المراجعة" },
    ],
    6: [
        { id: 601, memberId: "MEM-601", nameAr: "هاني سعيد منير", nameEn: "Hany Saeed Moneer", phone: "01523456789", nationalId: "29823211234567", status: "نشط" },
        { id: 602, memberId: "MEM-602", nameAr: "ندى كمال الدمنهوري", nameEn: "Nada Kamal Eldamanhory", phone: "01034567890", nationalId: "30024221234567", status: "نشط" },
        { id: 603, memberId: "MEM-603", nameAr: "زينب فهمي السيد", nameEn: "Zeinab Fahmy Elsayed", phone: "01145678901", nationalId: "29825231234567", status: "نشط" },
    ],
};
