"use client";

import { useRouter } from "next/navigation";
import { CATEGORY_META } from "@/lib/workCategories";
import { formatThaiDate } from "@/lib/status";

export default function CertificateClient({ student, advisor, categoryHours, totalHours, minMainHours }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-surfacealt flex flex-col items-center py-6 px-4 print:bg-white print:py-0 print:px-0">
      <div className="no-print flex items-center justify-between w-full max-w-[720px] mb-4">
        <button onClick={() => router.back()} className="text-[13px] font-semibold text-ink2">
          ← กลับ
        </button>
        <button onClick={() => window.print()} className="h-10 px-5 rounded-xl bg-primary text-white font-semibold text-[13px]">
          พิมพ์เอกสาร / บันทึกเป็น PDF
        </button>
      </div>

      <div className="bg-white w-full max-w-[720px] rounded-2xl print:rounded-none shadow-sm print:shadow-none border border-border print:border-0 p-10 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Burapha University x Faculty of Sport Science" className="h-16 w-auto" />
          <div className="font-head font-bold text-lg text-ink">หนังสือรับรองผลการฝึกประสบการณ์</div>
          <div className="font-head font-bold text-lg text-ink">ด้านบริการวิชาการแก่ชุมชน 150 ชั่วโมง</div>
          <div className="text-[13px] text-ink2">คณะวิทยาศาสตร์การกีฬา มหาวิทยาลัยบูรพา</div>
        </div>

        <div className="h-px bg-border" />

        <div className="flex flex-col gap-2 text-[14px] text-ink leading-relaxed">
          <div>
            ขอรับรองว่า <span className="font-semibold">{student.full_name}</span>{" "}
            {student.code ? `รหัสนิสิต ${student.code} ` : ""}
            {student.major ? `สาขาวิชา${student.major} ` : ""}
            {student.year_level ? `ชั้นปีที่ ${student.year_level}` : ""}
          </div>
          <div>
            ได้เข้าร่วมและสะสมชั่วโมงการฝึกประสบการณ์ด้านบริการวิชาการแก่ชุมชนครบตามเกณฑ์ที่กำหนดแล้ว รวมทั้งสิ้น{" "}
            <span className="font-semibold">{totalHours}</span> ชั่วโมง จากเกณฑ์ {student.target_hours || 150} ชั่วโมง
          </div>
        </div>

        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-surfacealt text-ink2">
                <th className="text-left py-2.5 px-3.5 font-semibold">หมวดภาระงาน</th>
                <th className="text-right py-2.5 px-3.5 font-semibold">ชั่วโมงสะสม</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <tr key={key} className="border-t border-border">
                  <td className="py-2.5 px-3.5 text-ink">
                    {meta.label}
                    {key === "main" ? ` (ขั้นต่ำ ${minMainHours} ชม.)` : ""}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-semibold text-ink">{categoryHours[key] ?? 0} ชม.</td>
                </tr>
              ))}
              <tr className="border-t border-border bg-surfacealt">
                <td className="py-2.5 px-3.5 font-semibold text-ink">รวมทั้งหมด</td>
                <td className="py-2.5 px-3.5 text-right font-bold text-ink">{totalHours} ชม.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="text-[12.5px] text-ink3">รับรองผลเมื่อวันที่ {formatThaiDate(student.completion_certified_at)}</div>

        <div className="flex flex-col items-center gap-1 pt-6">
          <div className="h-[70px] flex items-end">
            {advisor?.signature_data ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={advisor.signature_data} alt="ลายเซ็นอาจารย์ที่ปรึกษา" className="max-h-[70px] object-contain" />
            ) : (
              <div className="text-[12px] text-ink3">(ยังไม่มีลายเซ็นในระบบ)</div>
            )}
          </div>
          <div className="w-[220px] border-t border-ink3 pt-1.5 text-center">
            <div className="text-[13px] font-semibold text-ink">{advisor?.full_name ?? "-"}</div>
            <div className="text-[11.5px] text-ink3">อาจารย์ที่ปรึกษาการฝึกประสบการณ์</div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          @page {
            margin: 14mm;
          }
        }
      `}</style>
    </div>
  );
}
