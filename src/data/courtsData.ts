export type Court = {
    id: string;
    name: string;          // e.g. "ملعب 1", "الملعب الرئيسي"
    sportId: number;       // FK to Sport.id
    sportNameAr: string;   // denormalized for display
    capacity: number;      // max players at once
    isActive: boolean;
};

// TODO: Replace with GET /api/courts when endpoint is ready
export const MOCK_COURTS: Court[] = [
    { id: "c1", name: "ملعب 1", sportId: 1, sportNameAr: "كرة القدم", capacity: 22, isActive: true },
    { id: "c2", name: "ملعب 2", sportId: 1, sportNameAr: "كرة القدم", capacity: 22, isActive: true },
    { id: "c3", name: "حمام السباحة الرئيسي", sportId: 2, sportNameAr: "سباحة", capacity: 30, isActive: true },
    { id: "c4", name: "حمام السباحة الفرعي", sportId: 2, sportNameAr: "سباحة", capacity: 15, isActive: false },
    { id: "c5", name: "ملعب بادل 1", sportId: 3, sportNameAr: "بادل", capacity: 4, isActive: true },
    { id: "c6", name: "ملعب بادل 2", sportId: 3, sportNameAr: "بادل", capacity: 4, isActive: true },
    { id: "c7", name: "صالة الجمباز", sportId: 4, sportNameAr: "جمباز", capacity: 20, isActive: true },
];

// Sports that require court booking (identified by sportId)
// TODO: Replace with field from GET /api/sports when backend adds requires_booking
export const SPORTS_REQUIRING_BOOKING: number[] = [3]; // padel sport IDs

// TODO: Replace with GET /api/sports when endpoint is ready
export const MOCK_SPORTS_LIST: { id: number; nameAr: string }[] = [
    { id: 1, nameAr: "كرة القدم" },
    { id: 2, nameAr: "سباحة" },
    { id: 3, nameAr: "بادل" },
    { id: 4, nameAr: "جمباز" },
    { id: 5, nameAr: "تنس" },
    { id: 6, nameAr: "كرة السلة" },
];
