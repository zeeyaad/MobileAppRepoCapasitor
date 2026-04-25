export type PaymentStatus = "active" | "expiring" | "overdue";

export type MemberPayment = {
    memberId: number;
    memberCode: string;
    memberType: "member" | "team_member";
    lastPaymentDate: string;       // "YYYY-MM-DD"
    lastPaymentAmount: number;     // EGP
    nextRenewalDate: string;       // "YYYY-MM-DD"
    subscriptionType: string;      // "شهري" | "ربع سنوي" | "نصف سنوي" | "سنوي"
    paymentStatus: PaymentStatus;  // stored but always recomputed on display
};

// Always recompute from date — never trust stored status alone
// TODO: Backend should return this computed server-side
export const computePaymentStatus = (nextRenewalDate: string): PaymentStatus => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const renewal = new Date(nextRenewalDate);
    renewal.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(
        (renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0) return "overdue";
    if (diffDays <= 30) return "expiring";
    return "active";
};

export const getDaysUntilRenewal = (nextRenewalDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const renewal = new Date(nextRenewalDate);
    renewal.setHours(0, 0, 0, 0);
    return Math.ceil(
        (renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
};

// TODO: Replace with GET /api/members/payments
export const MOCK_PAYMENTS: MemberPayment[] = [
    // ── Active ──────────────────────────────────────────────────────────────
    { memberId: 1, memberCode: "MEM-001", memberType: "member", lastPaymentDate: "2026-01-01", lastPaymentAmount: 500, nextRenewalDate: "2026-07-01", subscriptionType: "نصف سنوي", paymentStatus: "active" },
    { memberId: 2, memberCode: "MEM-002", memberType: "member", lastPaymentDate: "2026-02-01", lastPaymentAmount: 250, nextRenewalDate: "2026-08-01", subscriptionType: "ربع سنوي", paymentStatus: "active" },
    { memberId: 3, memberCode: "MEM-003", memberType: "member", lastPaymentDate: "2026-01-15", lastPaymentAmount: 1000, nextRenewalDate: "2027-01-15", subscriptionType: "سنوي", paymentStatus: "active" },
    { memberId: 4, memberCode: "TM-001", memberType: "team_member", lastPaymentDate: "2026-02-10", lastPaymentAmount: 300, nextRenewalDate: "2026-08-10", subscriptionType: "نصف سنوي", paymentStatus: "active" },
    { memberId: 5, memberCode: "TM-002", memberType: "team_member", lastPaymentDate: "2026-01-20", lastPaymentAmount: 300, nextRenewalDate: "2026-07-20", subscriptionType: "نصف سنوي", paymentStatus: "active" },
    { memberId: 6, memberCode: "MEM-004", memberType: "member", lastPaymentDate: "2026-02-15", lastPaymentAmount: 250, nextRenewalDate: "2026-08-15", subscriptionType: "ربع سنوي", paymentStatus: "active" },
    { memberId: 7, memberCode: "TM-003", memberType: "team_member", lastPaymentDate: "2026-02-20", lastPaymentAmount: 300, nextRenewalDate: "2026-08-20", subscriptionType: "نصف سنوي", paymentStatus: "active" },
    // ── Expiring (within 30 days — today is 2026-03-01) ────────────────────
    { memberId: 8, memberCode: "MEM-005", memberType: "member", lastPaymentDate: "2025-12-10", lastPaymentAmount: 250, nextRenewalDate: "2026-03-10", subscriptionType: "ربع سنوي", paymentStatus: "expiring" },
    { memberId: 9, memberCode: "MEM-006", memberType: "member", lastPaymentDate: "2025-12-20", lastPaymentAmount: 250, nextRenewalDate: "2026-03-20", subscriptionType: "ربع سنوي", paymentStatus: "expiring" },
    { memberId: 10, memberCode: "TM-004", memberType: "team_member", lastPaymentDate: "2025-12-05", lastPaymentAmount: 300, nextRenewalDate: "2026-03-05", subscriptionType: "ربع سنوي", paymentStatus: "expiring" },
    { memberId: 11, memberCode: "MEM-007", memberType: "member", lastPaymentDate: "2025-12-25", lastPaymentAmount: 500, nextRenewalDate: "2026-03-25", subscriptionType: "نصف سنوي", paymentStatus: "expiring" },
    { memberId: 12, memberCode: "TM-005", memberType: "team_member", lastPaymentDate: "2025-12-15", lastPaymentAmount: 300, nextRenewalDate: "2026-03-15", subscriptionType: "ربع سنوي", paymentStatus: "expiring" },
    // ── Overdue (renewal date already passed) ──────────────────────────────
    { memberId: 13, memberCode: "MEM-008", memberType: "member", lastPaymentDate: "2025-11-01", lastPaymentAmount: 250, nextRenewalDate: "2026-02-01", subscriptionType: "ربع سنوي", paymentStatus: "overdue" },
    { memberId: 14, memberCode: "MEM-009", memberType: "member", lastPaymentDate: "2025-10-15", lastPaymentAmount: 500, nextRenewalDate: "2026-01-15", subscriptionType: "نصف سنوي", paymentStatus: "overdue" },
    { memberId: 15, memberCode: "TM-006", memberType: "team_member", lastPaymentDate: "2025-11-20", lastPaymentAmount: 300, nextRenewalDate: "2026-02-20", subscriptionType: "ربع سنوي", paymentStatus: "overdue" },
    { memberId: 16, memberCode: "MEM-010", memberType: "member", lastPaymentDate: "2025-09-01", lastPaymentAmount: 1000, nextRenewalDate: "2026-01-01", subscriptionType: "سنوي", paymentStatus: "overdue" },
    { memberId: 17, memberCode: "TM-007", memberType: "team_member", lastPaymentDate: "2025-10-10", lastPaymentAmount: 300, nextRenewalDate: "2026-01-10", subscriptionType: "ربع سنوي", paymentStatus: "overdue" },
];

// O(1) lookup — key: `${memberType}-${memberId}`
export const PAYMENTS_MAP = new Map<string, MemberPayment>(
    MOCK_PAYMENTS.map(p => [`${p.memberType}-${p.memberId}`, p])
);

// Pre-computed alert list (expiring + overdue)
export const PAYMENT_ALERTS = MOCK_PAYMENTS.filter(p =>
    computePaymentStatus(p.nextRenewalDate) !== "active"
).sort((a, b) => {
    // overdue first, then expiring sorted by days remaining
    const sa = computePaymentStatus(a.nextRenewalDate);
    const sb = computePaymentStatus(b.nextRenewalDate);
    if (sa === "overdue" && sb !== "overdue") return -1;
    if (sb === "overdue" && sa !== "overdue") return 1;
    return getDaysUntilRenewal(a.nextRenewalDate) -
        getDaysUntilRenewal(b.nextRenewalDate);
});
