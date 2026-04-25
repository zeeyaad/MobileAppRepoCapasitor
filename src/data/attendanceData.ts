export type AttendanceStatus = "present" | "absent";

export type AttendanceRecord = {
    id: string;
    sessionId: string;
    memberId: number;
    memberNameAr: string;
    memberCode: string;
    sportId: number;
    sportNameAr: string;
    sessionDate: string;
    sessionDay: string;
    sessionTime: string;
    status: AttendanceStatus;
    markedBy?: string;
};

export type TrainingSession = {
    id: string;
    sportId: number;
    sportNameAr: string;
    day: string;
    time: string;
    label: string;
};

// TODO: Replace with GET /api/sports/sessions
export const MOCK_SESSIONS: TrainingSession[] = [
    { id: "s1", sportId: 1, sportNameAr: "كرة القدم", day: "السبت", time: "10:00", label: "السبت - ١٠:٠٠ ص" },
    { id: "s2", sportId: 1, sportNameAr: "كرة القدم", day: "الثلاثاء", time: "10:00", label: "الثلاثاء - ١٠:٠٠ ص" },
    { id: "s3", sportId: 2, sportNameAr: "سباحة", day: "الأحد", time: "08:00", label: "الأحد - ٨:٠٠ ص" },
    { id: "s4", sportId: 2, sportNameAr: "سباحة", day: "الأربعاء", time: "08:00", label: "الأربعاء - ٨:٠٠ ص" },
    { id: "s5", sportId: 3, sportNameAr: "بادل", day: "الجمعة", time: "18:00", label: "الجمعة - ٦:٠٠ م" },
    { id: "s6", sportId: 4, sportNameAr: "تنس", day: "الاثنين", time: "09:00", label: "الاثنين - ٩:٠٠ ص" },
];

// TODO: Replace with GET /api/attendance
export const MOCK_ATTENDANCE: AttendanceRecord[] = [
    // كرة القدم s1 — 2026-03-01
    { id: "a1", sessionId: "s1", memberId: 1, memberNameAr: "محمد أحمد علي", memberCode: "TM-001", sportId: 1, sportNameAr: "كرة القدم", sessionDate: "2026-03-01", sessionDay: "السبت", sessionTime: "10:00", status: "present" },
    { id: "a2", sessionId: "s1", memberId: 2, memberNameAr: "علي محمود سعد", memberCode: "TM-002", sportId: 1, sportNameAr: "كرة القدم", sessionDate: "2026-03-01", sessionDay: "السبت", sessionTime: "10:00", status: "absent" },
    { id: "a3", sessionId: "s1", memberId: 3, memberNameAr: "خالد إبراهيم", memberCode: "TM-003", sportId: 1, sportNameAr: "كرة القدم", sessionDate: "2026-03-01", sessionDay: "السبت", sessionTime: "10:00", status: "present" },
    { id: "a4", sessionId: "s1", memberId: 4, memberNameAr: "أحمد حسن عمر", memberCode: "TM-004", sportId: 1, sportNameAr: "كرة القدم", sessionDate: "2026-03-01", sessionDay: "السبت", sessionTime: "10:00", status: "absent" },
    { id: "a5", sessionId: "s1", memberId: 5, memberNameAr: "يوسف طارق نبيل", memberCode: "TM-005", sportId: 1, sportNameAr: "كرة القدم", sessionDate: "2026-03-01", sessionDay: "السبت", sessionTime: "10:00", status: "present" },
    { id: "a6", sessionId: "s1", memberId: 6, memberNameAr: "عمر سامي فؤاد", memberCode: "TM-006", sportId: 1, sportNameAr: "كرة القدم", sessionDate: "2026-03-01", sessionDay: "السبت", sessionTime: "10:00", status: "present" },
    // كرة القدم s2 — 2026-03-04
    { id: "a7", sessionId: "s2", memberId: 1, memberNameAr: "محمد أحمد علي", memberCode: "TM-001", sportId: 1, sportNameAr: "كرة القدم", sessionDate: "2026-03-04", sessionDay: "الثلاثاء", sessionTime: "10:00", status: "absent" },
    { id: "a8", sessionId: "s2", memberId: 2, memberNameAr: "علي محمود سعد", memberCode: "TM-002", sportId: 1, sportNameAr: "كرة القدم", sessionDate: "2026-03-04", sessionDay: "الثلاثاء", sessionTime: "10:00", status: "present" },
    { id: "a9", sessionId: "s2", memberId: 3, memberNameAr: "خالد إبراهيم", memberCode: "TM-003", sportId: 1, sportNameAr: "كرة القدم", sessionDate: "2026-03-04", sessionDay: "الثلاثاء", sessionTime: "10:00", status: "absent" },
    { id: "a10", sessionId: "s2", memberId: 4, memberNameAr: "أحمد حسن عمر", memberCode: "TM-004", sportId: 1, sportNameAr: "كرة القدم", sessionDate: "2026-03-04", sessionDay: "الثلاثاء", sessionTime: "10:00", status: "present" },
    { id: "a11", sessionId: "s2", memberId: 5, memberNameAr: "يوسف طارق نبيل", memberCode: "TM-005", sportId: 1, sportNameAr: "كرة القدم", sessionDate: "2026-03-04", sessionDay: "الثلاثاء", sessionTime: "10:00", status: "present" },
    { id: "a12", sessionId: "s2", memberId: 6, memberNameAr: "عمر سامي فؤاد", memberCode: "TM-006", sportId: 1, sportNameAr: "كرة القدم", sessionDate: "2026-03-04", sessionDay: "الثلاثاء", sessionTime: "10:00", status: "absent" },
    // سباحة s3 — 2026-03-02
    { id: "a13", sessionId: "s3", memberId: 7, memberNameAr: "سارة محمد خالد", memberCode: "TM-007", sportId: 2, sportNameAr: "سباحة", sessionDate: "2026-03-02", sessionDay: "الأحد", sessionTime: "08:00", status: "present" },
    { id: "a14", sessionId: "s3", memberId: 8, memberNameAr: "نور أحمد سعيد", memberCode: "TM-008", sportId: 2, sportNameAr: "سباحة", sessionDate: "2026-03-02", sessionDay: "الأحد", sessionTime: "08:00", status: "absent" },
    { id: "a15", sessionId: "s3", memberId: 9, memberNameAr: "ريم عبدالله فتحي", memberCode: "TM-009", sportId: 2, sportNameAr: "سباحة", sessionDate: "2026-03-02", sessionDay: "الأحد", sessionTime: "08:00", status: "present" },
    { id: "a16", sessionId: "s3", memberId: 10, memberNameAr: "هنا كريم علي", memberCode: "TM-010", sportId: 2, sportNameAr: "سباحة", sessionDate: "2026-03-02", sessionDay: "الأحد", sessionTime: "08:00", status: "present" },
    { id: "a17", sessionId: "s3", memberId: 11, memberNameAr: "مريم طارق حسن", memberCode: "TM-011", sportId: 2, sportNameAr: "سباحة", sessionDate: "2026-03-02", sessionDay: "الأحد", sessionTime: "08:00", status: "absent" },
    { id: "a18", sessionId: "s3", memberId: 12, memberNameAr: "دينا وليد رضا", memberCode: "TM-012", sportId: 2, sportNameAr: "سباحة", sessionDate: "2026-03-02", sessionDay: "الأحد", sessionTime: "08:00", status: "present" },
    // سباحة s4 — 2026-03-05
    { id: "a19", sessionId: "s4", memberId: 7, memberNameAr: "سارة محمد خالد", memberCode: "TM-007", sportId: 2, sportNameAr: "سباحة", sessionDate: "2026-03-05", sessionDay: "الأربعاء", sessionTime: "08:00", status: "absent" },
    { id: "a20", sessionId: "s4", memberId: 8, memberNameAr: "نور أحمد سعيد", memberCode: "TM-008", sportId: 2, sportNameAr: "سباحة", sessionDate: "2026-03-05", sessionDay: "الأربعاء", sessionTime: "08:00", status: "present" },
    { id: "a21", sessionId: "s4", memberId: 9, memberNameAr: "ريم عبدالله فتحي", memberCode: "TM-009", sportId: 2, sportNameAr: "سباحة", sessionDate: "2026-03-05", sessionDay: "الأربعاء", sessionTime: "08:00", status: "present" },
    { id: "a22", sessionId: "s4", memberId: 10, memberNameAr: "هنا كريم علي", memberCode: "TM-010", sportId: 2, sportNameAr: "سباحة", sessionDate: "2026-03-05", sessionDay: "الأربعاء", sessionTime: "08:00", status: "absent" },
    { id: "a23", sessionId: "s4", memberId: 11, memberNameAr: "مريم طارق حسن", memberCode: "TM-011", sportId: 2, sportNameAr: "سباحة", sessionDate: "2026-03-05", sessionDay: "الأربعاء", sessionTime: "08:00", status: "absent" },
    { id: "a24", sessionId: "s4", memberId: 12, memberNameAr: "دينا وليد رضا", memberCode: "TM-012", sportId: 2, sportNameAr: "سباحة", sessionDate: "2026-03-05", sessionDay: "الأربعاء", sessionTime: "08:00", status: "present" },
    // بادل s5 — 2026-02-28
    { id: "a25", sessionId: "s5", memberId: 13, memberNameAr: "كريم منصور أيمن", memberCode: "TM-013", sportId: 3, sportNameAr: "بادل", sessionDate: "2026-02-28", sessionDay: "الجمعة", sessionTime: "18:00", status: "present" },
    { id: "a26", sessionId: "s5", memberId: 14, memberNameAr: "زياد حسام فاروق", memberCode: "TM-014", sportId: 3, sportNameAr: "بادل", sessionDate: "2026-02-28", sessionDay: "الجمعة", sessionTime: "18:00", status: "absent" },
    { id: "a27", sessionId: "s5", memberId: 15, memberNameAr: "تامر رامي شريف", memberCode: "TM-015", sportId: 3, sportNameAr: "بادل", sessionDate: "2026-02-28", sessionDay: "الجمعة", sessionTime: "18:00", status: "present" },
    { id: "a28", sessionId: "s5", memberId: 16, memberNameAr: "بسام وائل لطفي", memberCode: "TM-016", sportId: 3, sportNameAr: "بادل", sessionDate: "2026-02-28", sessionDay: "الجمعة", sessionTime: "18:00", status: "absent" },
    { id: "a29", sessionId: "s5", memberId: 1, memberNameAr: "محمد أحمد علي", memberCode: "TM-001", sportId: 3, sportNameAr: "بادل", sessionDate: "2026-02-28", sessionDay: "الجمعة", sessionTime: "18:00", status: "absent" },
    { id: "a30", sessionId: "s5", memberId: 2, memberNameAr: "علي محمود سعد", memberCode: "TM-002", sportId: 3, sportNameAr: "بادل", sessionDate: "2026-02-28", sessionDay: "الجمعة", sessionTime: "18:00", status: "present" },
    // تنس s6 — 2026-03-02
    { id: "a31", sessionId: "s6", memberId: 17, memberNameAr: "لمى إيهاب مصطفى", memberCode: "TM-017", sportId: 4, sportNameAr: "تنس", sessionDate: "2026-03-02", sessionDay: "الاثنين", sessionTime: "09:00", status: "present" },
    { id: "a32", sessionId: "s6", memberId: 18, memberNameAr: "منة الله سيد", memberCode: "TM-018", sportId: 4, sportNameAr: "تنس", sessionDate: "2026-03-02", sessionDay: "الاثنين", sessionTime: "09:00", status: "absent" },
    { id: "a33", sessionId: "s6", memberId: 19, memberNameAr: "جنة محمد رشاد", memberCode: "TM-019", sportId: 4, sportNameAr: "تنس", sessionDate: "2026-03-02", sessionDay: "الاثنين", sessionTime: "09:00", status: "present" },
    { id: "a34", sessionId: "s6", memberId: 20, memberNameAr: "هاجر علاء الدين", memberCode: "TM-020", sportId: 4, sportNameAr: "تنس", sessionDate: "2026-03-02", sessionDay: "الاثنين", sessionTime: "09:00", status: "present" },
    { id: "a35", sessionId: "s6", memberId: 3, memberNameAr: "خالد إبراهيم", memberCode: "TM-003", sportId: 4, sportNameAr: "تنس", sessionDate: "2026-03-02", sessionDay: "الاثنين", sessionTime: "09:00", status: "absent" },
    { id: "a36", sessionId: "s6", memberId: 4, memberNameAr: "أحمد حسن عمر", memberCode: "TM-004", sportId: 4, sportNameAr: "تنس", sessionDate: "2026-03-02", sessionDay: "الاثنين", sessionTime: "09:00", status: "present" },
];
