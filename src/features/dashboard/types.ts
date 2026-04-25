export type Page = "dashboard" | "sports" | "courts" | "profile" | "available-sports";
export type ToastType = "success" | "error";
export type CourtType = "ملعب كرة القدم" | "ملعب تنس" | "صالة كرة السلة";

export interface EnrolledSport {
    id: number | string;
    name: string;
    nameAr?: string;
    icon: string;
    img?: string | null;
    status: "نشط" | "قادم" | "منتهي" | "قيد الانتظار";
    nextDay: string;
    nextTime: string;
    court: string;
    attended: number;
    absent: number;
    remaining: number;
    total: number;
    color: string;
    weekdays?: number[];
    records?: { date: string; attended: boolean }[];
    startDate?: string;
    endDate?: string;
    createdAt?: string;
    price?: number;
}

export interface TimeSlotOption {
    id: string;
    teamId: string | null;
    time: string;
    court: string;
    days: string;
    price: number;
    spots: number; // remaining spots
}

export interface ExploreSport {
    id: number;
    memberId?: number;
    name: string;
    nameEn?: string;
    icon: string;
    img: string;
    endDate?: string;
    slots: TimeSlotOption[];
    defaultPrice?: number;
    joined: boolean;
    joinedSlotId?: string;
    joinedStatus?: string;
    pendingPayment?: {
        subscriptionId: number;
        paymentReference: string;
        amount: number;
        currency: string;
        slotId?: string;
    };
}

export interface Notification {
    id: number;
    icon: string;
    title: string;
    msg: string;
    time: string;
    read: boolean;
}

export interface CalendarDay {
    date: Date;
    available: boolean;
}

export interface SessionEvent {
    sportId: string | number;
    name: string;
    icon: string;
    color: string;
    time: string;
    court: string;
    status: "حضور" | "غياب" | "قادم";
    price?: number;
}
