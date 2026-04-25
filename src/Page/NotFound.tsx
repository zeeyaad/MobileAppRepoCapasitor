import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted" dir="rtl">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">عذراً! الصفحة غير موجودة</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-primary underline hover:text-primary/90 font-semibold"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للصفحة السابقة
        </button>
      </div>
    </div>
  );
};

export default NotFound;
