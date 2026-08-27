import { STATUS_META } from "@/lib/status";

export default function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-full ${meta.bg} ${meta.text}`}>
      {meta.label}
    </span>
  );
}
