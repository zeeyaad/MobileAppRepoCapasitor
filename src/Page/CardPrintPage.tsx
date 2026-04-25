/**
 * CardPrintPage.tsx  —  طباعة بطاقات الأعضاء
 *
 * Left : member list (mock data, replace with real API later)
 * Right: card front/back preview + member info summary + print button
 *
 * Print: injects card HTML into a hidden iframe → iframe.contentWindow.print()
 * Based on printMemberTeamCard.jsx reference implementation.
 */

import { useState } from "react";
import { Printer, CreditCard } from "lucide-react";
import { Button } from "../Component/StaffPagesComponents/ui/button";
const cardFront = "/assets/card-front.png";
const cardBack = "/assets/card-back.png";

// ─── Mock Data ─────────────────────────────────────────────────────────────────
// TODO: Replace with real API call when endpoint is ready

const MOCK_MEMBERS = [
    { id: 1, nameAr: "أحمد محمد علي", memberId: "MEM-001", sport: "كرة القدم", endDate: "31/12/2025" },
    { id: 2, nameAr: "محمد علي حسن", memberId: "MEM-002", sport: "سباحة", endDate: "31/12/2025" },
    { id: 3, nameAr: "كريم أحمد سعيد", memberId: "MEM-003", sport: "تنس", endDate: "30/06/2025" },
];

type Member = typeof MOCK_MEMBERS[number];

// ─── Print logic (from printMemberTeamCard reference) ─────────────────────────

const escapeHtml = (s: string) =>
    String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

function getCardHTML(member: Member, frontImgDataUrl: string): string {
    return `<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>HUC — بطاقة العضوية</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800&display=swap');
    @page { size: 8.56cm 5.4cm landscape; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; height: 100%; font-family: "Cairo", Arial, sans-serif; }
    .page { min-height: 100vh; display: grid; place-items: center; }

    /* CR-80 card */
    .card {
      width: 8.56cm; height: 5.4cm;
      overflow: hidden; direction: ltr;
      display: grid; grid-template-columns: 3.2cm 1fr;
      position: relative;
    }
    /* Left: card front image fills the panel */
    .left { position: relative; overflow: hidden; }
    .left img { width: 100%; height: 100%; object-fit: cover; display: block; }

    /* Right: white info area */
    .right {
      padding: 8px 10px;
      background: #fff;
      position: relative;
      display: flex; flex-direction: column; justify-content: center;
    }
    .info { display: flex; flex-direction: column; gap: 8px; }
    .field-value { font-size: 7.5pt; font-weight: 700; color: #111; line-height: 1.3; }

    .sig {
      position: absolute; bottom: 5px; right: 8px;
      text-align: right; font-size: 6.5pt; font-weight: 800; color: #111; line-height: 1.3;
    }

    @media print {
      .page { background: transparent; padding: 0; }
      .card { box-shadow: none; margin: 0; }
    }
  </style>
</head>
<body class="page">
  <div class="card">
    <aside class="left">
      <img src="${frontImgDataUrl}" alt="card front" />
    </aside>
    <section class="right">
      <div class="info" dir="rtl">
        <div class="field-value">الاسم : ${escapeHtml(member.nameAr)}</div>
        <div class="field-value">رقم العضوية : ${escapeHtml(member.memberId)}</div>
        <div class="field-value">النشاط : ${escapeHtml(member.sport)}</div>
        <div class="field-value">ساري حتى : ${escapeHtml(member.endDate)}</div>
      </div>
      <div class="sig" dir="rtl">
        <div>المدير التنفيذي</div>
        <div>ا.د / احمد فاروق</div>
      </div>
    </section>
  </div>
</body>
</html>`;
}

async function printCard(member: Member) {
    // Convert bundled front image to data URL so the iframe can embed it
    const resp = await fetch(cardFront);
    const blob = await resp.blob();
    const dataUrl = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(blob);
    });

    const iframe = document.createElement("iframe");
    Object.assign(iframe.style, { position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "0" });
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow!.document;
    doc.open();
    doc.write(getCardHTML(member, dataUrl));
    doc.close();

    // Wait for DOM ready
    await new Promise<void>((resolve) => {
        if (doc.readyState === "complete") { resolve(); return; }
        iframe.contentWindow!.addEventListener("load", () => resolve(), { once: true });
    });

    iframe.contentWindow!.focus();
    iframe.contentWindow!.print();

    // Clean up after print
    iframe.contentWindow!.onafterprint = () => setTimeout(() => document.body.removeChild(iframe), 50);
    setTimeout(() => { if (document.body.contains(iframe)) document.body.removeChild(iframe); }, 5000);
}

// ─── Info row helper ──────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-semibold">{value}</span>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CardPrintPage() {
    const [selected, setSelected] = useState<Member>(MOCK_MEMBERS[0]);
    const [printing, setPrinting] = useState(false);

    const handlePrint = async () => {
        setPrinting(true);
        try {
            await printCard(selected);
        } finally {
            setPrinting(false);
        }
    };

    return (
        <div className="h-full flex" dir="rtl">

            {/* ── Left Panel: Member List ── */}
            <div className="w-72 shrink-0 border-l border-border flex flex-col">
                <div className="px-4 py-4 border-b border-border shrink-0">
                    <h2 className="text-base font-bold flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        قائمة الأعضاء
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">اختر عضواً لمعاينة بطاقته</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {MOCK_MEMBERS.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setSelected(m)}
                            className={`w-full text-right rounded-lg border px-4 py-3 transition-all duration-150 ${selected.id === m.id
                                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                    : "border-border bg-card hover:bg-muted/50"
                                }`}
                        >
                            <p className="font-semibold text-sm leading-tight">{m.nameAr}</p>
                            <p className={`text-xs mt-0.5 ${selected.id === m.id ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                                {m.sport} · {m.memberId}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Right Panel: Preview + Info + Print ── */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">

                {/* Card Image Previews */}
                <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">نموذج البطاقة</p>
                    <div className="flex flex-wrap gap-6">
                        <div className="space-y-1.5">
                            <p className="text-xs text-muted-foreground text-center">الوجه الأمامي</p>
                            <img
                                src={cardFront}
                                alt="card front"
                                className="max-w-[360px] rounded-xl shadow-md border border-border"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-xs text-muted-foreground text-center">الوجه الخلفي</p>
                            <img
                                src={cardBack}
                                alt="card back"
                                className="max-w-[360px] rounded-xl shadow-md border border-border"
                            />
                        </div>
                    </div>
                </div>

                {/* Member Info Summary */}
                <div className="max-w-sm space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">بيانات العضو المختار</p>
                    <div className="rounded-xl border border-border bg-card px-4 py-1">
                        <InfoRow label="الاسم" value={selected.nameAr} />
                        <InfoRow label="الرياضة" value={selected.sport} />
                        <InfoRow label="رقم العضو" value={selected.memberId} />
                        <InfoRow label="تاريخ الانتهاء" value={selected.endDate} />
                    </div>
                </div>

                {/* Print Button */}
                <div>
                    <Button
                        onClick={() => void handlePrint()}
                        disabled={printing}
                        className="gap-2"
                        size="lg"
                    >
                        <Printer className="h-4 w-4" />
                        {printing ? "جارٍ الإعداد..." : "طباعة البطاقة"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                        تأكد من اختيار: الطابعة MagicCard Rio Pro 360 · حجم الورق CR80 · الهوامش: بدون
                    </p>
                </div>
            </div>
        </div>
    );
}
