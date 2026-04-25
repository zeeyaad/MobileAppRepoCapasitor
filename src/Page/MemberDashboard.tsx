import { Toaster } from "../Component/StaffPagesComponents/ui/toaster";
import { Toaster as Sonner } from "../Component/StaffPagesComponents/ui/sonner";
import { TooltipProvider } from "../Component/StaffPagesComponents/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "../Component/StaffPagesComponents/layout/MainLayout";
import { useToast } from "../Component/StaffPagesComponents/ui/use-toast";
import MemberHomePage from "./MemberHomePage";
import MemberProfilePage from "./MemberProfilePage";
import MemberMembershipPage from "./MemberMembershipPage";
import MemberSportsPage from "./MemberSportsPage";
import MemberSubscribePage from "./MemberSubscribePage";
import CourtRentalPage from "../features/dashboard/pages/CourtRentalPage";

const queryClient = new QueryClient();

const MemberDashboard = () => {
    const { toast } = useToast();

    const showToast = (msg: string, t: "success" | "error" | "info") => {
        toast({
            title: msg,
            variant: t === "success" ? "success" : t === "error" ? "destructive" : "default",
        });
    };

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <MainLayout>
                    <Routes>
                        <Route index element={<Navigate to="home" replace />} />
                        <Route path="home" element={<MemberHomePage />} />
                        <Route path="profile" element={<MemberProfilePage />} />
                        <Route path="memberships" element={<MemberMembershipPage />} />
                        <Route path="sports" element={<MemberSportsPage />} />
                        <Route path="subscribe" element={<MemberSubscribePage />} />
                        <Route path="courts" element={<CourtRentalPage showToast={showToast} />} />
                        <Route path="*" element={<Navigate to="home" replace />} />
                    </Routes>
                </MainLayout>
            </TooltipProvider>
        </QueryClientProvider>
    );
};

export default MemberDashboard;
