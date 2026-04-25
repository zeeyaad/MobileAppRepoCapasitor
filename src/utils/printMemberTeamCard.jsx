/**
 * printMemberTeamCard
 * Opens a hidden iframe and triggers the browser print dialog for a membership card.
 *
 * @param {object} options
 * @param {object} options.data  - CardData object
 * @param {string} options.type  - "member" | "team" | "staff"
 */
export function printMemberTeamCard({ data = {}, type = "member" } = {}) {
    const nameAr = data.nameAr || data.nameEn || "—";
    const memberId = data.memberId || (data.id ? `MEM-${String(data.id).padStart(5, "0")}` : "—");
    const memberType = data.memberType || data.staffType || "";
    const jobTitle = data.jobTitle || "";
    const phone = data.phone || "";
    const validUntil = data.validUntil || "";
    const nationalId = data.nationalId || data.barcode || "";

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>طباعة البطاقة</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: 85.6mm 54mm landscape; margin: 0; }
    body { width: 85.6mm; height: 54mm; font-family: 'Segoe UI', Arial, sans-serif; }

    .card-front, .card-back {
      width: 85.6mm; height: 54mm;
      background: linear-gradient(135deg, #1F3A5F 0%, #2EA7C9 100%);
      color: #fff;
      padding: 4mm;
      position: relative;
      overflow: hidden;
      page-break-after: always;
    }
    .card-back { page-break-after: avoid; }

    .header {
      border-bottom: 0.3mm solid rgba(255,255,255,0.3);
      padding-bottom: 1.5mm;
      margin-bottom: 2mm;
      text-align: right;
    }
    .header .club-name { font-size: 3.5mm; font-weight: 700; letter-spacing: 0.3mm; }
    .header .club-name-en { font-size: 2.3mm; opacity: 0.7; }

    .body { display: flex; gap: 2.5mm; align-items: flex-start; }
    .photo {
      width: 16mm; height: 19mm;
      border: 0.4mm solid rgba(255,255,255,0.5);
      border-radius: 1.5mm;
      background: rgba(255,255,255,0.15);
      display: flex; align-items: center; justify-content: center;
      font-size: 8mm; flex-shrink: 0;
      overflow: hidden;
    }
    .photo img { width: 100%; height: 100%; object-fit: cover; }
    .info { flex: 1; text-align: right; }
    .info .name { font-size: 3.5mm; font-weight: 700; margin-bottom: 1mm; }
    .info .sub { font-size: 2.5mm; opacity: 0.8; margin-bottom: 0.5mm; }
    .info .mono { font-size: 2.3mm; opacity: 0.6; direction: ltr; text-align: left; }

    .footer {
      position: absolute; bottom: 2.5mm; left: 3mm; right: 3mm;
      display: flex; justify-content: space-between; align-items: flex-end;
      font-size: 2mm; opacity: 0.55;
    }

    /* Back */
    .back-inner {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      height: 100%;
    }
    .back-club { font-size: 2.8mm; font-weight: 700; opacity: 0.8; margin-bottom: 4mm; }
    .barcode-box {
      width: 70%; height: 10mm;
      background: #fff; border-radius: 1mm;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 3mm;
      color: #1F3A5F; font-family: monospace; font-size: 2.2mm;
    }
    .sig-line {
      margin-top: auto; width: 50%;
      border-top: 0.3mm solid rgba(255,255,255,0.5);
      padding-top: 1.5mm; text-align: center;
      font-size: 2mm; opacity: 0.55;
    }
  </style>
</head>
<body>
  <!-- FRONT -->
  <div class="card-front">
    <div class="header">
      <div class="club-name">نادي جامعة حلوان</div>
      <div class="club-name-en">Helwan University Club</div>
    </div>
    <div class="body">
      <div class="photo">${data.photoUrl ? `<img src="${data.photoUrl}" />` : "👤"}</div>
      <div class="info">
        <div class="name">${nameAr}</div>
        ${jobTitle ? `<div class="sub">${jobTitle}</div>` : ""}
        ${memberType ? `<div class="sub">${memberType}</div>` : ""}
        <div class="mono">${memberId}</div>
      </div>
    </div>
    <div class="footer">
      <span dir="ltr">${validUntil ? `Valid Until: ${validUntil}` : ""}</span>
      <span dir="ltr">${phone}</span>
    </div>
  </div>

  <!-- BACK -->
  <div class="card-back">
    <div class="back-inner">
      <div class="back-club">نادي جامعة حلوان</div>
      <div class="barcode-box">${nationalId || "||||| ||||| |||||"}</div>
      <div class="sig-line">توقيع المدير العام</div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 200);
    };
  </script>
</body>
</html>`;

    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:0;";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    iframe.contentWindow.onafterprint = () => {
        document.body.removeChild(iframe);
    };
}

export default printMemberTeamCard;
