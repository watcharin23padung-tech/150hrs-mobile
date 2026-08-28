import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { formatThaiDate } from "@/lib/status";
import { CATEGORY_META } from "@/lib/workCategories";

export default function EntryRow({ entry, showStudent }) {
  const studentName = entry.profiles?.full_name;
  const catMeta = entry.work_category ? CATEGORY_META[entry.work_category] : null;
  return (
    <Link
      href={`/entries/${entry.id}`}
      className="bg-surface border border-border rounded-2xl p-3.5 flex gap-3 items-start"
    >
      <div className="flex flex-col gap-0.5 flex-grow min-w-0">
        <div className="text-[13.5px] font-semibold text-ink truncate">
          {showStudent && studentName
            ? `${studentName}${entry.profiles?.code ? " · " + entry.profiles.code : ""}`
            : entry.place}
        </div>
        <div className="text-xs text-ink3">{showStudent ? entry.place : formatThaiDate(entry.activity_date)}</div>
        {catMeta && (
          <span className={`self-start mt-0.5 rounded-full px-2 py-0.5 text-[10.5px] font-medium ${catMeta.bg} ${catMeta.text}`}>
            {catMeta.label}
            {entry.work_type ? ` · ${entry.work_type}` : ""}
          </span>
        )}
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <div className="font-head font-semibold text-[13px] text-ink">{entry.hours} ชม.</div>
        <StatusBadge status={entry.status} />
      </div>
    </Link>
  );
}
