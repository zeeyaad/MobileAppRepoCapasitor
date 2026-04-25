export type UserCategory = 'student' | 'staff' | 'general';
export type MembershipType = 'monthly' | 'annual' | 'vip';
export type UserStatus = 'active' | 'expired' | 'pending';

export interface User {
    id: string;
    fullName: string;
    nationalId: string;
    email: string;
    phone: string;
    category: UserCategory;
    membershipType: MembershipType;
    status: UserStatus;
    nationalityType: 'egyptian' | 'non_egyptian';
    nationality: string;
    dob: string;
    // Dynamic
    universityName?: string;
    graduationYear?: string;
    jobId?: string;
    profession?: string;
    salary?: string;
    avatar?: string;
}

export const MOCK_USERS: User[] = [
    {
        id: "USR-001",
        fullName: "أحمد محمد علي",
        nationalId: "29901011234567",
        email: "ahmed@example.com",
        phone: "01012345678",
        category: "student",
        membershipType: "annual",
        status: "active",
        nationalityType: "egyptian",
        nationality: "مصرى",
        dob: "1999-01-01",
        universityName: "جامعة حلوان",
        graduationYear: "2024"
    },
    {
        id: "USR-002",
        fullName: "سارة أحمد محمود",
        nationalId: "28805051234567",
        email: "sara@example.com",
        phone: "01112345678",
        category: "staff",
        membershipType: "vip",
        status: "active",
        nationalityType: "egyptian",
        nationality: "مصرى",
        dob: "1988-05-05",
        jobId: "STF-2023-99"
    },
    {
        id: "USR-003",
        fullName: "مايكل جون",
        nationalId: "PASS-998877",
        email: "mike@example.com",
        phone: "01212345678",
        category: "general",
        membershipType: "monthly",
        status: "expired",
        nationalityType: "non_egyptian",
        nationality: "American",
        dob: "1985-10-20",
        profession: "Software Engineer",
        salary: "50000"
    }
];

export const userService = {
    fetchUsers: (): Promise<User[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...MOCK_USERS]), 800);
        });
    },
    createUser: (user: Omit<User, "id">): Promise<User> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newUser = { ...user, id: `USR-${Math.floor(Math.random() * 1000)}`, status: 'active' as UserStatus };
                resolve(newUser);
            }, 1000);
        });
    },
    updateUser: (id: string, data: Partial<User>): Promise<User> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // In a real app, we would update the backend here.
                // For mock, we just return the merged data.
                const existingUser = MOCK_USERS.find(u => u.id === id);
                const updatedUser = { ...existingUser, ...data, id } as User;
                resolve(updatedUser);
            }, 1000);
        });
    },
    deleteUser: (id: string): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), 800);
        });
    }
};
