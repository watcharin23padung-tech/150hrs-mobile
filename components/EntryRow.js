import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { formatThaiDate } from "@/lib/status";

export default function EntryRow({ entry, showStudent }) {
  const studentName = entry.profiles?.full_name;
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
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <div className="font-head font-semibold text-[13px] text-ink">{entry.hours} ชม.</div>
        <StatusBadge status={entry.status} />
      </div>
    </Link>
  );
}
