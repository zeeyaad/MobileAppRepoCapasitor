import { motion } from "framer-motion";
import { ShieldX } from "lucide-react";
import { Button } from "../Component/StaffPagesComponents/ui/button";
import { useNavigate } from "react-router-dom";

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4"
      >
        <div className="mx-auto h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold text-foreground font-poppins">403</h1>
        <p className="text-lg text-muted-foreground">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          العودة للرئيسية
        </Button>
      </motion.div>
    </div>
  );
}
