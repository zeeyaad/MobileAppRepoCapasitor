export const mockMembers = [
  { id: 1, name: "أحمد محمد", photo: "", membershipType: "سنوي", status: "active" as const, sport: "كرة القدم", joinedAt: "2024-01-15", phoneNumber: "01000000001", nationalIdNumber: "29801011234567", nationalIdCardPhoto: "", sports: ["كرة القدم"] },
  { id: 2, name: "محمد عبدالله", photo: "", membershipType: "شهري", status: "active" as const, sport: "السباحة", joinedAt: "2024-02-20", phoneNumber: "01000000002", nationalIdNumber: "29902021234567", nationalIdCardPhoto: "", sports: ["السباحة"] },
  { id: 3, name: "فاطمة أحمد", photo: "", membershipType: "سنوي", status: "inactive" as const, sport: "التنس", joinedAt: "2024-03-10", phoneNumber: "01000000003", nationalIdNumber: "30003101234567", nationalIdCardPhoto: "", sports: ["التنس"] },
  { id: 4, name: "سارة خالد", photo: "", membershipType: "ربع سنوي", status: "pending" as const, sport: "كرة السلة", joinedAt: "2024-04-05", phoneNumber: "01000000004", nationalIdNumber: "30104051234567", nationalIdCardPhoto: "", sports: ["كرة السلة"] },
  { id: 5, name: "عمر حسن", photo: "", membershipType: "سنوي", status: "active" as const, sport: "الكاراتيه", joinedAt: "2024-01-30", phoneNumber: "01000000005", nationalIdNumber: "29701301234567", nationalIdCardPhoto: "", sports: ["الكاراتيه"] },
  { id: 6, name: "نور الدين", photo: "", membershipType: "شهري", status: "active" as const, sport: "كرة القدم", joinedAt: "2024-05-12", phoneNumber: "01000000006", nationalIdNumber: "30205121234567", nationalIdCardPhoto: "", sports: ["كرة القدم", "الجمباز"] },
  { id: 7, name: "ليلى عمر", photo: "", membershipType: "سنوي", status: "inactive" as const, sport: "السباحة", joinedAt: "2024-06-01", phoneNumber: "01000000007", nationalIdNumber: "30306011234567", nationalIdCardPhoto: "", sports: ["السباحة"] },
  { id: 8, name: "كريم سعيد", photo: "", membershipType: "شهري", status: "active" as const, sport: "الجمباز", joinedAt: "2024-03-22", phoneNumber: "01000000008", nationalIdNumber: "30003221234567", nationalIdCardPhoto: "", sports: ["الجمباز"] },
];

export const mockSports = [
  { id: 1, name: "كرة القدم", membersCount: 45, price: 500 },
  { id: 2, name: "السباحة", membersCount: 32, price: 700 },
  { id: 3, name: "التنس", membersCount: 18, price: 400 },
  { id: 4, name: "كرة السلة", membersCount: 25, price: 450 },
  { id: 5, name: "الكاراتيه", membersCount: 20, price: 350 },
  { id: 6, name: "الجمباز", membersCount: 15, price: 600 },
];

export const mockPayments = [
  { id: 1, member: "أحمد محمد", sport: "كرة القدم", amount: 500, status: "paid" as const },
  { id: 2, member: "محمد عبدالله", sport: "السباحة", amount: 700, status: "paid" as const },
  { id: 3, member: "فاطمة أحمد", sport: "التنس", amount: 400, status: "unpaid" as const },
  { id: 4, member: "سارة خالد", sport: "كرة السلة", amount: 450, status: "unpaid" as const },
  { id: 5, member: "عمر حسن", sport: "الكاراتيه", amount: 350, status: "paid" as const },
  { id: 6, member: "نور الدين", sport: "كرة القدم", amount: 500, status: "unpaid" as const },
];

export const mockTasks = [
  { id: 1, title: "إضافة رياضة جديدة", description: "طلب إضافة رياضة التايكوندو للنادي", createdBy: "محمد عبدالله", status: "pending" as const },
  { id: 2, title: "تحديث أسعار العضوية", description: "مراجعة وتحديث أسعار الاشتراكات الشهرية", createdBy: "فاطمة أحمد", status: "pending" as const },
  { id: 3, title: "صيانة حمام السباحة", description: "طلب صيانة دورية لحمام السباحة", createdBy: "أحمد محمد", status: "approved" as const },
  { id: 4, title: "شراء معدات رياضية", description: "طلب شراء معدات جديدة لصالة الجمباز", createdBy: "سارة خالد", status: "pending" as const },
];

export const mockMembershipTrends = [
  { month: "يناير", members: 120 },
  { month: "فبراير", members: 145 },
  { month: "مارس", members: 160 },
  { month: "أبريل", members: 155 },
  { month: "مايو", members: 180 },
  { month: "يونيو", members: 200 },
];

export const mockSportsDistribution = [
  { name: "كرة القدم", value: 45 },
  { name: "السباحة", value: 32 },
  { name: "التنس", value: 18 },
  { name: "كرة السلة", value: 25 },
  { name: "الكاراتيه", value: 20 },
  { name: "الجمباز", value: 15 },
];

export const mockPrivilegePackages = [
  {
    id: 1,
    name: "مدير رياضي",
    modules: {
      sports: { view: true, create: true, edit: true, delete: false, approve: false },
      members: { view: true, create: false, edit: false, delete: false, approve: false },
      finance: { view: false, create: false, edit: false, delete: false, approve: false },
      tasks: { view: true, create: false, edit: false, delete: false, approve: true },
    },
  },
  {
    id: 2,
    name: "موظف تسجيل",
    modules: {
      sports: { view: true, create: false, edit: false, delete: false, approve: false },
      members: { view: true, create: true, edit: true, delete: false, approve: false },
      finance: { view: false, create: false, edit: false, delete: false, approve: false },
      tasks: { view: false, create: false, edit: false, delete: false, approve: false },
    },
  },
  {
    id: 3,
    name: "مدير مالي",
    modules: {
      sports: { view: true, create: false, edit: false, delete: false, approve: false },
      members: { view: true, create: false, edit: false, delete: false, approve: false },
      finance: { view: true, create: true, edit: true, delete: false, approve: true },
      tasks: { view: false, create: false, edit: false, delete: false, approve: false },
    },
  },
];
