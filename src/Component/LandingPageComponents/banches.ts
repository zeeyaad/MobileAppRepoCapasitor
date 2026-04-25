
interface Branch {
  id: number;
  name: string;
  location: string;
  schedule: string;
  members: string;
  image: string;
  url: string;
}

const branches: Branch[] = [
  {
    id: 1,
    name: "فرع المعادي",
    location: "المعادي",
    schedule: "السبت - الخميس (10:00 - 22:00)",
    members: "1000",
    image: "/assets/club.png",
    url: "#/branches/maadi"
  },
  {
    id: 2,
    name: "فرع المنستير",
    location: "المنستير",
    schedule: "الجمعة - الخميس (12:00 - 20:00)",
    members: "800",
    image: "/assets/club2.png",
    url: "#/branches/manshiyat"
  },
  {
    id: 3,
    name: "فرع المطريه",
    location: "المطريه",
    schedule: "الاحد - الخميس (11:00 - 21:00)",
    members: "1200",
    image: "/assets/club.png",
    url: "#/branches/matarya"
  }
];

export default branches;
