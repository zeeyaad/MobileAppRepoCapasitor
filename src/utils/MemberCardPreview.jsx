import { useState } from "react";

/**
 * MemberCardPreview
 * Renders a visual preview of the membership card (front/back).
 * Uses the real card image assets when available, falls back to a styled placeholder.
 */
export default function MemberCardPreview({ data = {}, type = "member", scale = 1 }) {
    const [showBack, setShowBack] = useState(false);

    // CR80 card dimensions in px at 96dpi (scaled)
    const W = Math.round(323 * scale);
    const H = Math.round(204 * scale);

    const nameAr = data.nameAr || data.nameEn || "—";
    const memberId = data.memberId || (data.id ? `MEM-${String(data.id).padStart(5, "0")}` : "—");
    const memberType = data.memberType || data.staffType || "—";
    const jobTitle = data.jobTitle || "";

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Card face */}
            <div
                style={{ width: W, height: H, position: "relative", borderRadius: 10, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.25)" }}
            >
                {!showBack ? (
                    /* ── FRONT ─────────────────────────────────────── */
                    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1F3A5F 0%, #2EA7C9 100%)", display: "flex", flexDirection: "column", alignItems: "flex-end", padding: `${12 * scale}px`, color: "#fff", boxSizing: "border-box" }}>
                        {/* Header */}
                        <div style={{ width: "100%", textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: 6 * scale, marginBottom: 8 * scale }}>
                            <div style={{ fontSize: 10 * scale, fontWeight: 700, letterSpacing: 1 }}>نادي جامعة حلوان</div>
                            <div style={{ fontSize: 7 * scale, opacity: 0.75 }}>Helwan University Club</div>
                        </div>

                        <div style={{ display: "flex", width: "100%", gap: 10 * scale, alignItems: "flex-start" }}>
                            {/* Photo */}
                            <div style={{ width: 60 * scale, height: 72 * scale, borderRadius: 6 * scale, border: "2px solid rgba(255,255,255,0.5)", overflow: "hidden", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                {data.photoUrl
                                    ? <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : <div style={{ fontSize: 22 * scale, opacity: 0.4 }}>👤</div>
                                }
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, textAlign: "right", direction: "rtl" }}>
                                <div style={{ fontSize: 11 * scale, fontWeight: 700, marginBottom: 4 * scale }}>{nameAr}</div>
                                {jobTitle && <div style={{ fontSize: 8 * scale, opacity: 0.8, marginBottom: 3 * scale }}>{jobTitle}</div>}
                                <div style={{ fontSize: 8 * scale, opacity: 0.75, marginBottom: 2 * scale }}>{memberType}</div>
                                <div style={{ fontSize: 8 * scale, opacity: 0.6, direction: "ltr", textAlign: "left" }}>{memberId}</div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ position: "absolute", bottom: 8 * scale, left: 10 * scale, right: 10 * scale, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontSize: 7 * scale, opacity: 0.6, direction: "ltr" }}>
                                {data.validUntil && `Valid Until: ${data.validUntil}`}
                            </div>
                            <div style={{ fontSize: 7 * scale, opacity: 0.6 }}>
                                {data.phone && <span dir="ltr">{data.phone}</span>}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ── BACK ──────────────────────────────────────── */
                    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1F3A5F 0%, #2EA7C9 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", padding: `${16 * scale}px`, boxSizing: "border-box" }}>
                        <div style={{ fontSize: 9 * scale, fontWeight: 700, marginBottom: 16 * scale, opacity: 0.8 }}>نادي جامعة حلوان</div>

                        {/* Barcode placeholder */}
                        <div style={{ width: "80%", height: 36 * scale, background: "#fff", borderRadius: 4 * scale, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 * scale }}>
                            <div style={{ fontSize: 7 * scale, color: "#1F3A5F", fontFamily: "monospace" }}>{data.barcode || data.nationalId || "||||| ||||| |||||"}</div>
                        </div>

                        {/* Signature line */}
                        <div style={{ marginTop: "auto", width: "60%", borderTop: "1px solid rgba(255,255,255,0.5)", paddingTop: 6 * scale, textAlign: "center", fontSize: 7 * scale, opacity: 0.6 }}>
                            توقيع المدير العام
                        </div>
                    </div>
                )}
            </div>

            {/* Front/Back toggle */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setShowBack(false)}
                    className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${!showBack ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
                >
                    الوجه الأمامي
                </button>
                <button
                    type="button"
                    onClick={() => setShowBack(true)}
                    className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${showBack ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
                >
                    الوجه الخلفي
                </button>
            </div>
        </div>
    );
}
