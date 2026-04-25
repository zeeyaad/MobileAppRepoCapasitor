import { motion } from "framer-motion";
import { DollarSign, AlertCircle } from "lucide-react";
import { StatCard } from "../Component/StaffPagesComponents/StatCard";
import { mockPayments } from "../data/mockData";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../Component/StaffPagesComponents/ui/table";
import { Badge } from "../Component/StaffPagesComponents/ui/badge";

export default function FinancePage() {
  const totalRevenue = mockPayments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = mockPayments.filter((p) => p.status === "unpaid").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الإدارة المالية</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="إجمالي الإيرادات" value={`${totalRevenue.toLocaleString("ar-EG")} ج.م`} icon={DollarSign} />
        <StatCard title="المدفوعات المعلقة" value={`${pendingAmount.toLocaleString("ar-EG")} ج.م`} icon={AlertCircle} />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-card shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العضو</TableHead>
              <TableHead>الرياضة</TableHead>
              <TableHead>المبلغ (ج.م)</TableHead>
              <TableHead>الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPayments.map((payment) => (
              <TableRow key={payment.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{payment.member}</TableCell>
                <TableCell>{payment.sport}</TableCell>
                <TableCell className="font-poppins">{payment.amount}</TableCell>
                <TableCell>
                  <Badge className={payment.status === "paid" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
                    {payment.status === "paid" ? "مدفوع" : "غير مدفوع"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
