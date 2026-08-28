"use client";

import { useMemo, useState } from "react";
import { formatThaiDate } from "@/lib/status";
import { MIN_MAIN_HOURS } from "@/lib/workCategories";
import { academicYearLabel, getAcademicYear, listAcademicYears } from "@/lib/academicYear";

const SORTS = {
  progress_asc: { label: "คืบหน้าน้อยสุดก่อน", fn: (a, b) => a.percent - b.percent },
  progress_desc: { label: "คืบหน้ามากสุดก่อน", fn: (a, b) => b.percent - a.percent },
  name: { label: "ชื่อ (ก-ฮ)", fn: (a, b) => (a.fullName || "").localeCompare(b.fullName || "", "th") },
  pending: { label: "รออนุมัติมากสุดก่อน", fn: (a, b) => b.pendingCount - a.pendingCount },
};

export default function ReportClient({ students }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("progress_asc");
  const [yearFilter, setYearFilter] = useState("all");

  const academicYears = useMemo(
    () => listAcademicYears(students.flatMap((s) => s.entries ?? [])),
    [students]
  );

  // คำนวณชั่วโมงแยกภาระงานใหม่ตามปีการศึกษาที่เลือก (ไม่กระทบยอดสะสมรวม/percent ซึ่งนับตลอดหลักสูตร)
  const studentsForYear = useMemo(() => {
    if (yearFilter === "all") return students;
    return students.map((s) => {
      const approvedInYear = (s.entries ?? []).filter(
        (e) => e.status === "approved" && getAcademicYear(e.activity_date) === yearFilter
      );
      const categoryHours = { main: 0, secondary: 0, volunteer: 0 };
      approvedInYear.forEach((e) => {
        const cat = e.work_category ?? "main";
        categoryHours[cat] = (categoryHours[cat] ?? 0) + Number(e.hours);
      });
      const yearHours = approvedInYear.reduce((sum, e) => sum + Number(e.hours), 0);
      return { ...s, categoryHours, yearHours };
    });
  }, [students, yearFilter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? studentsForYear
      : studentsForYear.filter(
          (s) =>
            s.fullName?.toLowerCase().includes(q) ||
            s.code?.toLowerCase().includes(q) ||
            s.major?.toLowerCase().includes(q)
        );
    return [...list].sort(SORTS[sortKey].fn);
  }, [studentsForYear, query, sortKey]);

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

      {academicYears.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-ink2">ดูชั่วโมงแยกภาระงานของปีการศึกษา</label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="input"
          >
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

      {student.categoryHours && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <MiniTag
            label={`หลัก ${student.categoryHours.main ?? 0}/${MIN_MAIN_HOURS}+`}
            ok={(student.categoryHours.main ?? 0) >= MIN_MAIN_HOURS}
          />
          <span className="text-[10.5px] text-ink3">รอง {student.categoryHours.secondary ?? 0} ชม.</span>
          <span className="text-[10.5px] text-ink3">จิตอาสา {student.categoryHours.volunteer ?? 0} ชม.</span>
          {typeof student.yearHours === "number" && (
            <span className="text-[10.5px] text-ink3 ml-auto">รวมปีนี้ {student.yearHours} ชม.</span>
          )}
        </div>
      )}
    </div>
  );
}

function MiniTag({ label, ok }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${ok ? "bg-primarytint text-primarydark" : "bg-dangertint text-danger"}`}>
      {label}
    </span>
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
