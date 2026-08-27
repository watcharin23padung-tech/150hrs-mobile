"use client";

import { useMemo } from "react";
import Link from "next/link";
import { formatThaiDate } from "@/lib/status";

const MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

export default function StudentReportClient({ profile, entries }) {
  const target = Number(profile.target_hours) || 150;

  const approved = entries.filter((e) => e.status === "approved");
  const pending = entries.filter((e) => e.status === "pending");
  const rejected = entries.filter((e) => e.status === "rejected");
  const approvedHours = approved.reduce((s, e) => s + Number(e.hours), 0);
  const percent = Math.min(100, Math.round((approvedHours / target) * 100));
  const remaining = Math.max(0, target - approvedHours);

  const monthly = useMemo(() => {
    const map = {};
    approved.forEach((e) => {
      if (!e.activity_date) return;
      const d = new Date(e.activity_date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      map[key] = (map[key] ?? 0) + Number(e.hours);
    });
    const rows = Object.entries(map)
      .map(([key, hours]) => {
        const [y, m] = key.split("-").map(Number);
        return { key, year: y, month: m, hours };
      })
      .sort((a, b) => (a.year - b.year) || (a.month - b.month))
      .slice(-6);
    const max = Math.max(1, ...rows.map((r) => r.hours));
    return { rows, max };
  }, [approved]);

  return (
    <div className="flex flex-col gap-5 p-5 pb-8">
      <div className="flex flex-col gap-0.5">
        <div className="font-head font-bold text-xl text-ink">รายงานความคืบหน้า</div>
        <div className="text-[13px] text-ink3">สรุปการบันทึกชั่วโมงฝึกฯ ของฉัน</div>
      </div>

      <div className="bg-primary rounded-[20px] p-[22px] flex items-center gap-[18px]">
        <div
          className="w-[88px] h-[88px] rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: `conic-gradient(white ${(percent / 100) * 360}deg, oklch(100% 0 0 / 0.22) 0deg)`,
          }}
        >
          <div className="w-[70px] h-[70px] rounded-full bg-primary flex items-center justify-center">
            <div className="font-head font-bold text-lg text-white">{percent}%</div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[12.5px] text-white/85">สะสมชั่วโมงฝึกฯ</div>
          <div className="font-head font-bold text-[22px] text-white">
            {approvedHours} <span className="text-sm font-medium text-white/80">/ {target} ชม.</span>
          </div>
          <div className="text-xs text-white/85">เหลืออีก {remaining} ชั่วโมง</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <StatCard value={entries.length} label="บันทึกทั้งหมด" />
        <StatCard value={pending.length} label="รออนุมัติ" tone="accent" />
        <StatCard value={rejected.length} label="ถูกตีกลับ" tone="danger" />
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="font-head font-semibold text-[15px] text-ink">ชั่วโมงที่อนุมัติรายเดือน</div>
        {monthly.rows.length === 0 ? (
          <div className="text-[13px] text-ink3 bg-surfacealt rounded-2xl py-8 text-center">
            ยังไม่มีรายการที่ได้รับการอนุมัติ
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl p-4 flex items-end gap-3 h-[140px]">
            {monthly.rows.map((r) => (
              <div key={r.key} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="text-[10.5px] text-ink3">{r.hours}</div>
                <div
                  className="w-full max-w-[26px] rounded-t-md bg-primary"
                  style={{ height: `${Math.max(4, (r.hours / monthly.max) * 84)}px` }}
                />
                <div className="text-[10.5px] text-ink3">{MONTHS_SHORT[r.month]}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {rejected.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="font-head font-semibold text-[15px] text-ink">รายการที่ถูกตีกลับ</div>
          <div className="flex flex-col gap-2">
            {rejected.map((e) => (
              <Link
                key={e.id}
                href={`/entries/${e.id}`}
                className="bg-surface border border-border rounded-2xl p-3.5 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <div className="text-[13.5px] font-semibold text-ink truncate">{e.place}</div>
                  <div className="text-xs text-ink3">{formatThaiDate(e.activity_date)}</div>
                </div>
                {e.reviewer_comment && (
                  <div className="text-[12px] text-danger bg-dangertint rounded-lg px-2.5 py-1.5">
                    {e.reviewer_comment}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ value, label, tone }) {
  const bg = tone === "accent" ? "bg-accenttint" : tone === "danger" ? "bg-dangertint" : "bg-surface border border-border";
  const text = tone === "accent" ? "text-[oklch(45%_0.14_70)]" : tone === "danger" ? "text-danger" : "text-ink";
  return (
    <div className={`${bg} rounded-2xl py-3.5 px-2.5 flex flex-col items-center gap-0.5`}>
      <div className={`font-head font-bold text-lg ${text}`}>{value}</div>
      <div className="text-[11px] text-ink3 text-center">{label}</div>
    </div>
  );
}
