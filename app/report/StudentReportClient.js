"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatThaiDate } from "@/lib/status";
import { CATEGORY_META, MIN_MAIN_HOURS } from "@/lib/workCategories";
import { academicYearLabel, getAcademicYear, listAcademicYears } from "@/lib/academicYear";

const MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

export default function StudentReportClient({ profile, entries }) {
  const target = Number(profile.target_hours) || 150;
  const [catFilter, setCatFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  const academicYears = useMemo(() => listAcademicYears(entries), [entries]);

  const approved = entries.filter((e) => e.status === "approved");
  const pending = entries.filter((e) => e.status === "pending");
  const rejected = entries.filter((e) => e.status === "rejected");
  const approvedHours = approved.reduce((s, e) => s + Number(e.hours), 0);
  const percent = Math.min(100, Math.round((approvedHours / target) * 100));
  const remaining = Math.max(0, target - approvedHours);
  const mainHoursTotal = approved.reduce(
    (s, e) => s + ((e.work_category ?? "main") === "main" ? Number(e.hours) : 0),
    0
  );
  const eligible = approvedHours >= target && mainHoursTotal >= MIN_MAIN_HOURS;

  // รายการที่กรองตามปีการศึกษา (ใช้กับสรุปแยกภาระงาน, รายการ, และกราฟรายเดือน — ไม่กระทบวงกลมสรุปสะสมรวมด้านบน)
  const yearEntries = useMemo(
    () => (yearFilter === "all" ? entries : entries.filter((e) => getAcademicYear(e.activity_date) === yearFilter)),
    [entries, yearFilter]
  );
  const yearApproved = yearEntries.filter((e) => e.status === "approved");

  const categoryHours = useMemo(() => {
    const map = { main: 0, secondary: 0, volunteer: 0 };
    yearApproved.forEach((e) => {
      const cat = e.work_category ?? "main";
      map[cat] = (map[cat] ?? 0) + Number(e.hours);
    });
    return map;
  }, [yearApproved]);

  const filteredEntries = catFilter === "all" ? yearEntries : yearEntries.filter((e) => (e.work_category ?? "main") === catFilter);

  const monthly = useMemo(() => {
    const map = {};
    yearApproved.forEach((e) => {
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
      .slice(yearFilter === "all" ? -6 : -12);
    const max = Math.max(1, ...rows.map((r) => r.hours));
    return { rows, max };
  }, [yearApproved, yearFilter]);

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

      {profile.completion_certified_at ? (
        <div className="bg-[oklch(88%_0.14_95)] border border-[oklch(72%_0.15_90)] rounded-2xl p-4 flex items-center gap-3">
          <div className="text-2xl flex-shrink-0">🏆</div>
          <div className="flex flex-col gap-0.5 flex-grow min-w-0">
            <div className="font-head font-bold text-[13.5px] text-[oklch(32%_0.1_70)]">
              ฝึกประสบการณ์ครบตามเกณฑ์แล้ว
            </div>
            <div className="text-[11.5px] text-[oklch(40%_0.08_70)] leading-snug">
              รับรองผลเมื่อ {formatThaiDate(profile.completion_certified_at)}
            </div>
          </div>
          <Link
            href={`/certificate/${profile.id}`}
            className="flex-shrink-0 text-[11.5px] font-semibold text-primarydark bg-primarytint px-3 py-2 rounded-full whitespace-nowrap"
          >
            พิมพ์เอกสาร
          </Link>
        </div>
      ) : eligible ? (
        <div className="bg-accenttint rounded-2xl p-4 flex items-center gap-3">
          <div className="text-2xl flex-shrink-0">⏳</div>
          <div className="flex flex-col gap-0.5">
            <div className="font-head font-bold text-[13.5px] text-[oklch(45%_0.14_70)]">
              สะสมชั่วโมงครบตามเกณฑ์แล้ว
            </div>
            <div className="text-[11.5px] text-[oklch(45%_0.1_70)] leading-snug">
              รอการรับรองผลจากอาจารย์ที่ปรึกษา
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2.5">
        <StatCard value={entries.length} label="บันทึกทั้งหมด" />
        <StatCard value={pending.length} label="รออนุมัติ" tone="accent" />
        <StatCard value={rejected.length} label="ถูกตีกลับ" tone="danger" />
      </div>

      {academicYears.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-ink2">ดูข้อมูลของปีการศึกษา</label>
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value === "all" ? "all" : Number(e.target.value))} className="report-select">
            <option value="all">ทุกปีการศึกษา (สะสมทั้งหมด)</option>
            {academicYears.map((ay) => (
              <option key={ay} value={ay}>
                {academicYearLabel(ay)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <div className="font-head font-semibold text-[15px] text-ink">
          ชั่วโมงแยกตามประเภทภาระงาน{yearFilter !== "all" ? ` (${academicYearLabel(yearFilter)})` : ""}
        </div>
        <div className="flex flex-col gap-2">
          {Object.entries(CATEGORY_META).map(([key, meta]) => {
            const hrs = categoryHours[key] ?? 0;
            const min = key === "main" ? MIN_MAIN_HOURS : null;
            const met = min ? hrs >= min : true;
            return (
              <div key={key} className="bg-surface border border-border rounded-2xl p-3.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.bg} ${meta.text}`}>{meta.label}</span>
                  {min && (
                    <span className={`text-[11px] font-medium ${met ? "text-primarydark" : "text-danger"}`}>
                      {met ? "ครบเกณฑ์ขั้นต่ำ" : `ต้องครบ ${min} ชม.`}
                    </span>
                  )}
                </div>
                <div className="text-[13.5px] font-head font-bold text-ink flex-shrink-0">
                  {hrs} {min ? `/ ${min}+ ชม.` : "ชม."}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="font-head font-semibold text-[15px] text-ink">รายการบันทึกแยกตามภาระงาน</div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          <CatTab active={catFilter === "all"} onClick={() => setCatFilter("all")} label="ทั้งหมด" />
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <CatTab key={key} active={catFilter === key} onClick={() => setCatFilter(key)} label={meta.short} />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {filteredEntries.length === 0 && (
            <div className="text-[13px] text-ink3 bg-surfacealt rounded-2xl py-8 text-center">ไม่มีรายการในหมวดนี้</div>
          )}
          {filteredEntries.map((e) => (
            <Link key={e.id} href={`/entries/${e.id}`} className="bg-surface border border-border rounded-2xl p-3.5 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[13.5px] font-semibold text-ink truncate">{e.place}</div>
                <div className="text-[12.5px] font-head font-bold text-ink flex-shrink-0">{e.hours} ชม.</div>
              </div>
              <div className="flex items-center justify-between text-[11.5px] text-ink3">
                <span>{e.work_type || CATEGORY_META[e.work_category ?? "main"].label}</span>
                <span>{formatThaiDate(e.activity_date)}</span>
              </div>
              {e.supervisor_name && (
                <div className="text-[11px] text-ink3">รับรองโดย {e.supervisor_name}</div>
              )}
            </Link>
          ))}
        </div>
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

      <style jsx global>{`
        .report-select {
          height: 44px;
          border-radius: 12px;
          border: 1px solid oklch(90% 0.012 80);
          background: white;
          padding: 0 14px;
          font-size: 13.5px;
          color: oklch(22% 0.02 80);
          width: 100%;
        }
      `}</style>
    </div>
  );
}

function CatTab({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap ${
        active ? "bg-primary text-white" : "bg-surfacealt text-ink2"
      }`}
    >
      {label}
    </button>
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
