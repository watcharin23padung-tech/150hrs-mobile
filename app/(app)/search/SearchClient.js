"use client";

import { useMemo, useState } from "react";
import EntryRow from "@/components/EntryRow";

const FILTERS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pending", label: "รออนุมัติ" },
  { key: "approved", label: "อนุมัติแล้ว" },
  { key: "rejected", label: "ถูกตีกลับ" },
];

export default function SearchClient({ entries, role }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const isStudent = role === "student";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      const statusOk = filter === "all" || e.status === filter;
      if (!statusOk) return false;
      if (!q) return true;
      const haystack = isStudent
        ? e.place
        : `${e.profiles?.full_name ?? ""} ${e.profiles?.code ?? ""} ${e.place}`;
      return haystack.toLowerCase().includes(q);
    });
  }, [entries, filter, query, isStudent]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-3.5 px-5 pt-6 pb-3 flex-shrink-0">
        <div className="font-head font-bold text-xl text-ink">{isStudent ? "ค้นหากิจกรรม" : "ค้นหานิสิต"}</div>
        <div className="flex items-center gap-2.5 h-[46px] rounded-2xl bg-surface border border-border px-3.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="6.5" stroke="oklch(64% 0.015 80)" strokeWidth="1.8" />
            <path d="M20 20l-4.5-4.5" stroke="oklch(64% 0.015 80)" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isStudent ? "ค้นหาสถานที่ฝึก หรือกิจกรรม" : "ค้นหาชื่อ หรือรหัสนิสิต"}
            className="border-none bg-transparent flex-grow text-[13.5px] text-ink outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 border rounded-full px-3.5 py-2 text-[12.5px] font-semibold ${
                filter === f.key ? "bg-primary text-white border-primary" : "bg-surface text-ink2 border-border"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto px-5 pb-6 flex flex-col gap-2.5">
        <div className="text-xs text-ink3 py-1">{filtered.length} รายการ</div>
        {filtered.length === 0 && (
          <div className="text-[13px] text-ink3 bg-surfacealt rounded-2xl py-8 text-center">ไม่พบรายการที่ตรงกัน</div>
        )}
        {filtered.map((e) => (
          <EntryRow key={e.id} entry={e} showStudent={!isStudent} />
        ))}
      </div>
    </div>
  );
}
