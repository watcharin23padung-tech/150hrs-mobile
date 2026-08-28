"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ICON = {
  approved: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M5 13l4 4 10-10" stroke="oklch(55% 0.13 165)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  rejected: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="oklch(55% 0.18 25)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  reminder: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 10a6 6 0 1112 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10z" stroke="oklch(60% 0.14 70)" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  ),
  system: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 10a6 6 0 1112 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10z" stroke="oklch(60% 0.14 70)" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  ),
};

const BG = {
  approved: "bg-primarytint",
  rejected: "bg-dangertint",
  reminder: "bg-accenttint",
  system: "bg-accenttint",
};

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "เมื่อสักครู่";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hrs / 24);
  return `${days} วันที่แล้ว`;
}

export default function NotificationsClient({ notifications }) {
  const supabase = createClient();
  const router = useRouter();
  const [items, setItems] = useState(notifications);

  async function markRead(id) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  }

  async function handleClick(n) {
    if (!n.is_read) await markRead(n.id);
    if (n.entry_id) router.push(`/entries/${n.entry_id}`);
  }

  async function markAll() {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    const ids = items.filter((n) => !n.is_read).map((n) => n.id);
    if (ids.length) await supabase.from("notifications").update({ is_read: true }).in("id", ids);
  }

  return (
    <div className="flex flex-col gap-4 p-5 pb-8">
      <div className="flex items-center justify-between">
        <div className="font-head font-bold text-xl text-ink">แจ้งเตือน</div>
        <button onClick={markAll} className="text-primary text-[12.5px] font-semibold">
          อ่านทั้งหมด
        </button>
      </div>

      {items.length === 0 && (
        <div className="text-[13px] text-ink3 bg-surfacealt rounded-2xl py-10 text-center">ยังไม่มีการแจ้งเตือน</div>
      )}

      <div className="flex flex-col gap-2">
        {items.map((n) => (
          <button
            key={n.id}
            onClick={() => handleClick(n)}
            className="text-left bg-surface border border-border rounded-2xl p-3.5 flex gap-3 items-start"
          >
            <div className={`w-[38px] h-[38px] rounded-[11px] ${BG[n.type] ?? BG.system} flex items-center justify-center flex-shrink-0`}>
              {ICON[n.type] ?? ICON.system}
            </div>
            <div className="flex flex-col gap-0.5 flex-grow min-w-0">
              <div className="text-[13.5px] font-semibold text-ink">{n.title}</div>
              {n.body && <div className="text-xs text-ink2 leading-snug">{n.body}</div>}
              <div className="text-[11px] text-ink3">{timeAgo(n.created_at)}</div>
            </div>
            {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
          </button>
        ))}
      </div>
    </div>
  );
}
