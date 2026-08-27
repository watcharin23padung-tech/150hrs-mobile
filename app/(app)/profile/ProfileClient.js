"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProfileClient({ profile, stats }) {
  const router = useRouter();
  const supabase = createClient();
  const [notifOn, setNotifOn] = useState(profile.notifications_enabled);
  const isStudent = profile.role === "student";
  const initials = profile.full_name?.slice(0, 2) ?? "?";

  async function toggleNotif() {
    const next = !notifOn;
    setNotifOn(next);
    await supabase.from("profiles").update({ notifications_enabled: next }).eq("id", profile.id);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5 p-5 pb-8">
      <div className="flex flex-col items-center gap-2.5 pt-1.5">
        <div className="w-[76px] h-[76px] rounded-full bg-primarytint flex items-center justify-center">
          <div className="font-head font-bold text-2xl text-primarydark">{initials}</div>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <div className="font-head font-bold text-lg text-ink">{profile.full_name}</div>
          <div className="text-[13px] text-ink2">
            {isStudent ? `รหัสนิสิต ${profile.code ?? "-"} · วิทยาศาสตร์การกีฬา` : "อาจารย์ที่ปรึกษาฝึกประสบการณ์"}
          </div>
        </div>
        <div className="text-xs text-ink3">{profile.email}</div>
      </div>

      {isStudent ? (
        <div className="bg-surface border border-border rounded-[18px] p-[18px] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-semibold text-ink">ความคืบหน้าการฝึกฯ</div>
            <div className="text-xs text-ink3">
              {stats.approvedHours} / {stats.target} ชม.
            </div>
          </div>
          <div className="h-2 rounded-full bg-surfacealt overflow-hidden">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(100, Math.round((stats.approvedHours / stats.target) * 100))}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <MiniStat value={stats.total} label="บันทึกทั้งหมด" />
            <MiniStat value={stats.approvedCount} label="อนุมัติแล้ว" />
            <MiniStat value={stats.remaining} label="เหลือ (ชม.)" />
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-[18px] p-[18px] flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="text-[13px] font-semibold text-ink">นิสิตในความดูแล</div>
            <div className="text-xs text-ink3">รายวิชาฝึกประสบการณ์</div>
          </div>
          <div className="font-head font-bold text-[22px] text-primary">{stats.adviseeCount}</div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <div className="text-[12.5px] font-semibold text-ink3 px-1">บัญชีของฉัน</div>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <Row label="เชื่อมต่อ Google Drive" right={<span className="text-[11px] font-semibold text-primarydark bg-primarytint px-2.5 py-1 rounded-full">แนบลิงก์ต่อรายการ</span>} />
          <Row
            label="การแจ้งเตือน"
            right={
              <button onClick={toggleNotif} className="w-[42px] h-[25px] rounded-full relative" style={{ background: notifOn ? "oklch(55% 0.13 165)" : "oklch(88% 0.01 80)" }}>
                <span
                  className="w-[19px] h-[19px] rounded-full bg-white absolute top-[3px] shadow"
                  style={{ left: notifOn ? "20px" : "3px", transition: "left .15s" }}
                />
              </button>
            }
          />
          <Row label="ภาษา" right={<span className="text-[12.5px] text-ink3">ไทย</span>} last />
        </div>
      </div>

      <button onClick={logout} className="h-[50px] rounded-2xl border border-danger bg-dangertint text-danger font-semibold text-sm">
        ออกจากระบบ
      </button>
    </div>
  );
}

function MiniStat({ value, label }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="font-head font-bold text-[15px] text-ink">{value}</div>
      <div className="text-[10.5px] text-ink3">{label}</div>
    </div>
  );
}

function Row({ label, right, last }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 ${last ? "" : "border-b border-border"}`}>
      <div className="text-[13.5px] text-ink flex-grow">{label}</div>
      {right}
    </div>
  );
}
