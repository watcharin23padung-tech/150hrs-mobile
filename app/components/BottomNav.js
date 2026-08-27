"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/home",
    label: "หน้าแรก",
    icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-8z" stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/search",
    label: "ค้นหา",
    icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="6.5" stroke={c} strokeWidth="1.8" />
        <path d="M20 20l-4.5-4.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/notifications",
    label: "แจ้งเตือน",
    icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M6 10a6 6 0 1112 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10z" stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M10 19a2 2 0 004 0" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/report",
    label: "รายงาน",
    icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="4.5" y="3.5" width="15" height="17" rx="2" stroke={c} strokeWidth="1.8" />
        <path d="M8 8.5h8M8 12h8M8 15.5h5" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "โปรไฟล์",
    icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3.5" stroke={c} strokeWidth="1.8" />
        <path d="M5 20c1-3.8 4-6 7-6s6 2.2 7 6" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function BottomNav({ role }) {
  const pathname = usePathname();
  const visibleItems = items.filter((item) => !item.teacherOnly || role === "teacher");

  return (
    <div className="flex-shrink-0 h-[76px] bg-surface border-t border-border flex items-center px-2">
      {visibleItems.map((item) => {
        const active = pathname.startsWith(item.href);
        const color = active ? "oklch(55% 0.13 165)" : "oklch(64% 0.015 80)";
        return (
          <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center gap-[3px]">
            {item.icon(color)}
            <div className={`text-[10.5px] ${active ? "font-semibold text-primary" : "text-ink3"}`}>{item.label}</div>
          </Link>
        );
      })}
    </div>
  );
}
