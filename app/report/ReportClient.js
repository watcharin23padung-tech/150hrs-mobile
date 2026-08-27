"use client";

import { useMemo, useState } from "react";
import { formatThaiDate } from "@/lib/status";

const SORTS = {
  progress_asc: { label: "คืบหน้าน้อยสุดก่อน", fn: (a, b) => a.percent - b.percent },
  progress_desc: { label: "คืบหน้ามากสุดก่อน", fn: (a, b) => b.percent - a.percent },
  name: { label: "ชื่อ (ก-ฮ)", fn: (a, b) => (a.fullName || "").localeCompare(b.fullName || "", "th") },
  pending: { label: "รออนุมัติมากสุดก่อน", fn: (a, b) => b.pendingCount - a.pendingCount },
};

export default function ReportClient({ students }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("progress_asc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? students
      : students.filter(
          (s) =>
            s.fullName?.toLowerCase().includes(q) ||
            s.code?.toLowerCase().includes(q) ||
            s.major?.toLowerCase().includes(q)
        );
    return [...list].sort(SORTS[sortKey].fn);
  }, [students, query, sortKey]);

  const totalStudents = students.length;
  const avgPercent = totalStudents
    ? Math.round(students.reduce((s, x) => s + x.percent, 0) / totalStudents)
    : 0;
  const notStarted = students.filter((s) => s.approvedHours === 0).length;
  const totalPending = students.reduce((s, x) => s + x.pendingCount, 0);

  return (
    <div className="flex flex-col gap-5 p-5 pb-8">
      <div className="flex flex-col gap-0.5">
        <div className="font-head font-bold text-xl text-ink">รายงานสรุปนิสิต</div>
        <div className="text-[13px] text-ink3">ภาพรวมความคืบหน้าของนิสิตในความดูแลทั้งหมด</div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <SummaryCard value={totalStudents} label="นิสิตในความดูแล" />
        <SummaryCard value={`${avgPercent}%`} label="ความคืบหน้าเฉลี่ย" tone="primary" />
        <SummaryCard value={notStarted} label="ยังไม่เริ่มบันทึก" tone="danger" />
        <SummaryCard value={totalPending} label="รายการรอตรวจรวม" tone="accent" />
      </div>

      <div className="flex flex-col gap-2.5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาชื่อ รหัสนิสิต หรือสาขาวิชา"
          className="input"
        />
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {Object.entries(SORTS).map(([key, s]) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              className={`flex-shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap ${
                sortKey === key ? "bg-primary text-white" : "bg-surfacealt text-ink2"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {filtered.length === 0 && (
          <div className="text-[13px] text-ink3 bg-surfacealt rounded-2xl py-8 text-center">
            {students.length === 0 ? "ยังไม่มีนิสิตในความดูแล" : "ไม่พบนิสิตที่ค้นหา"}
          </div>
        )}

        {filtered.map((s) => (
          <StudentCard key={s.id} student={s} />
        ))}
      </div>
    </div>
  );
}

function StudentCard({ student }) {
  const barTone =
    student.percent >= 100 ? "bg-primary" : student.percent === 0 ? "bg-danger" : "bg-primary";

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="text-[14px] font-semibold text-ink truncate">{student.fullName}</div>
          <div className="text-[11.5px] text-ink3 truncate">
            {[student.code, student.yearLevel ? `ปี ${student.yearLevel}` : null, student.major]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>
        <div className="flex-shrink-0 font-head font-bold text-[15px] text-primary">{student.percent}%</div>
      </div>

      <div className="h-1.5 rounded-full bg-surfacealt overflow-hidden">
        <div className={`h-full rounded-full ${barTone}`} style={{ width: `${student.percent}%` }} />
      </div>

      <div className="flex items-center justify-between text-[11.5px] text-ink3">
        <div>
          {student.approvedHours} / {student.target} ชม.
        </div>
        <div className="flex gap-2.5">
          {student.pendingCount > 0 && (
            <span className="text-[oklch(45%_0.14_70)] font-medium">รออนุมัติ {student.pendingCount}</span>
          )}
          {student.rejectedCount > 0 && (
            <span className="text-danger font-medium">ตีกลับ {student.rejectedCount}</span>
          )}
          <span>{student.lastActivity ? formatThaiDate(student.lastActivity) : "ยังไม่มีบันทึก"}</span>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ value, label, tone }) {
  const bg =
    tone === "primary"
      ? "bg-primarytint"
      : tone === "accent"
      ? "bg-accenttint"
      : tone === "danger"
      ? "bg-dangertint"
      : "bg-surface border border-border";
  const text =
    tone === "primary"
      ? "text-primarydark"
      : tone === "accent"
      ? "text-[oklch(45%_0.14_70)]"
      : tone === "danger"
      ? "text-danger"
      : "text-ink";
  return (
    <div className={`${bg} rounded-2xl py-3.5 px-3.5 flex flex-col gap-0.5`}>
      <div className={`font-head font-bold text-xl ${text}`}>{value}</div>
      <div className="text-[11px] text-ink3">{label}</div>
    </div>
  );
}
