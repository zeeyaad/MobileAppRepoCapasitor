// components/BranchDetails/branchesData.ts
export type Branch = {
  id: string;
  name: string;
  address: string;
  hours: string;
  facilities: string[];
  phone: string;
  email: string;
  manager?: string;
  photos?: string[];
  about?: string;
};

export const BRANCHES: Record<string, Branch> = {
  maadi: {
    id: "maadi",
    name: "فرع المعادي",
    address: "المعادي، القاهرة، مصر",
    hours: "يومياً 9 صباحاً - 10 مساءً",
    facilities: ["صالات لياقة", "ملاعب كرة قدم", "حمام سباحة", "ملاعب تنس"],
    phone: "+20 100 000 0000",
    email: "maadi@helwanclub.eg",
    manager: "أحمد محمد",
    photos: [
      "./club.png",
      "./club.png",
      "./club.png",
      "./club.png",
      "./club.png", 
      "./club.png",
      "./club.png",
    ],
    about:
      "نادي المعادي هو واحد من أقدم وأشهر الأندية في القاهرة، يقدم مجموعة واسعة من الأنشطة الرياضية والترفيهية لأعضائه.",
  },
};
