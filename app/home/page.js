import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EntryRow from "@/components/EntryRow";
import AppFrame from "@/components/AppFrame";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (!profile) {
    return (
      <AppFrame>
        <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
          <div className="font-head font-semibold text-ink">กำลังตั้งค่าบัญชีของคุณ...</div>
          <div className="text-[13px] text-ink3">
            หากหน้านี้ค้างอยู่นานเกิน 1 นาที ให้ลอง refresh หน้านี้อีกครั้ง
          </div>
        </div>
      </AppFrame>
    );
  }

  if (profile.role === "student") {
    const { data: entries } = await supabase
      .from("internship_entries")
      .select("*")
      .eq("student_id", user.id)
      .order("submitted_at", { ascending: false })
      .limit(6);

    const { data: allEntries } = await supabase
      .from("internship_entries")
      .select("hours,status,work_category")
      .eq("student_id", user.id);

    const total = allEntries?.length ?? 0;
    const approvedEntries = (allEntries ?? []).filter((e) => e.status === "approved");
    const approvedHours = approvedEntries.reduce((s, e) => s + Number(e.hours), 0);
    const pendingCount = (allEntries ?? []).filter((e) => e.status === "pending").length;
    const approvedCount = approvedEntries.length;
    const target = Number(profile.target_hours) || 150;
    const percent = Math.min(100, Math.round((approvedHours / target) * 100));

    const categoryHours = { main: 0, secondary: 0, volunteer: 0 };
    approvedEntries.forEach((e) => {
      const cat = e.work_category ?? "main";
      categoryHours[cat] = (categoryHours[cat] ?? 0) + Number(e.hours);
    });
    const catPercent = (v) => Math.min(100, Math.round((v / target) * 100));
    const catColors = { main: "white", secondary: "oklch(85% 0.14 70)", volunteer: "oklch(75% 0.03 200)" };
    let accHours = 0;
    const stops = ["main", "secondary", "volunteer"]
      .map((key) => {
        const fromDeg = (Math.min(accHours, target) / target) * 360;
        accHours += categoryHours[key];
        const toDeg = (Math.min(accHours, target) / target) * 360;
        return `${catColors[key]} ${fromDeg}deg ${toDeg}deg`;
      })
      .join(", ");

    return (
      <AppFrame role={profile.role}>
      <div className="flex flex-col gap-5 p-5 pb-8">
        <div className="flex flex-col gap-0.5">
          <div className="text-[13px] text-ink3">สวัสดีตอนเช้า 👋</div>
          <div className="font-head font-bold text-xl text-ink">{profile.full_name}</div>
        </div>

        <div className="bg-primary rounded-[20px] p-[22px] flex flex-col gap-4">
          <div className="flex items-center gap-[18px]">
            <div
              className="w-[88px] h-[88px] rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `conic-gradient(${stops}, oklch(100% 0 0 / 0.22) 0deg)`,
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
              <div className="text-xs text-white/85">เหลืออีก {Math.max(0, target - approvedHours)} ชั่วโมง</div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-white/15 pt-3">
            <CategoryLegend color="white" label="หลัก" value={categoryHours.main} percent={catPercent(categoryHours.main)} note={categoryHours.main >= 50 ? "ครบ 50+" : "ต้องครบ 50"} />
            <CategoryLegend color="oklch(85% 0.14 70)" label="รอง" value={categoryHours.secondary} percent={catPercent(categoryHours.secondary)} />
            <CategoryLegend color="oklch(75% 0.03 200)" label="จิตอาสา" value={categoryHours.volunteer} percent={catPercent(categoryHours.volunteer)} />
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
                อาจารย์ที่ปรึกษารับรองผลแล้ว พิมพ์เอกสารรับรองได้เลย
              </div>
            </div>
            <Link
              href={`/certificate/${profile.id}`}
              className="flex-shrink-0 text-[11.5px] font-semibold text-primarydark bg-primarytint px-3 py-2 rounded-full whitespace-nowrap"
            >
              พิมพ์เอกสาร
            </Link>
          </div>
        ) : profile.completion_notified_at ? (
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
          <StatCard value={total} label="บันทึกทั้งหมด" />
          <StatCard value={pendingCount} label="รออนุมัติ" tone="accent" />
          <StatCard value={approvedCount} label="อนุมัติแล้ว" tone="primary" />
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="font-head font-semibold text-[15px] text-ink">กิจกรรมล่าสุด</div>
            <Link href="/search" className="text-primary text-[12.5px] font-semibold">
              ดูทั้งหมด
            </Link>
          </div>

          {(!entries || entries.length === 0) && (
            <EmptyState text="ยังไม่มีบันทึกชั่วโมงฝึกฯ เริ่มบันทึกครั้งแรกได้เลย" />
          )}

          {entries?.map((e) => (
            <EntryRow key={e.id} entry={e} />
          ))}
        </div>

        <Link
          href="/entries/new"
          className="fixed max-w-md w-full mx-auto left-0 right-0 flex justify-end pr-9"
          style={{ bottom: "108px" }}
        >
          <span className="w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </span>
        </Link>
      </div>
      </AppFrame>
    );
  }

  // Teacher view
  const { data: advisees } = await supabase.from("profiles").select("id").eq("advisor_id", user.id);
  const adviseeIds = (advisees ?? []).map((a) => a.id);

  let pending = [];
  if (adviseeIds.length) {
    const { data } = await supabase
      .from("internship_entries")
      .select("*, profiles!internship_entries_student_id_fkey(full_name,code)")
      .in("student_id", adviseeIds)
      .eq("status", "pending")
      .order("submitted_at", { ascending: false })
      .limit(8);
    pending = data ?? [];
  }

  return (
    <AppFrame role={profile.role}>
    <div className="flex flex-col gap-5 p-5 pb-8">
      <div className="flex flex-col gap-0.5">
        <div className="text-[13px] text-ink3">สวัสดีตอนเช้า</div>
        <div className="font-head font-bold text-xl text-ink">{profile.full_name}</div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-primary rounded-2xl p-4 flex flex-col gap-1">
          <div className="font-head font-bold text-2xl text-white">{adviseeIds.length}</div>
          <div className="text-xs text-white/85">นิสิตในความดูแล</div>
        </div>
        <div className="bg-accenttint rounded-2xl p-4 flex flex-col gap-1">
          <div className="font-head font-bold text-2xl text-[oklch(45%_0.14_70)]">{pending.length}</div>
          <div className="text-xs text-[oklch(45%_0.1_70)]">รายการรอตรวจ</div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="font-head font-semibold text-[15px] text-ink">รายการรอตรวจสอบ</div>

        {pending.length === 0 && <EmptyState text="ไม่มีรายการรอตรวจสอบในตอนนี้" />}

        {pending.map((e) => (
          <EntryRow key={e.id} entry={e} showStudent />
        ))}
      </div>
    </div>
    </AppFrame>
  );
}

function CategoryLegend({ color, label, value, percent, note }) {
  return (
    <div className="flex items-center gap-1.5 flex-1 min-w-0">
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <div className="flex flex-col min-w-0">
        <div className="text-[11px] text-white/85 truncate">
          {label} · {percent}%
        </div>
        <div className="text-[10.5px] text-white/70 truncate">
          {value} ชม.{note ? ` · ${note}` : ""}
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, tone }) {
  const bg = tone === "accent" ? "bg-accenttint" : tone === "primary" ? "bg-primarytint" : "bg-surface border border-border";
  const text = tone === "accent" ? "text-[oklch(45%_0.14_70)]" : tone === "primary" ? "text-primarydark" : "text-ink";
  return (
    <div className={`${bg} rounded-2xl py-3.5 px-2.5 flex flex-col items-center gap-0.5`}>
      <div className={`font-head font-bold text-lg ${text}`}>{value}</div>
      <div className="text-[11px] text-ink3 text-center">{label}</div>
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="text-[13px] text-ink3 bg-surfacealt rounded-2xl py-8 text-center">{text}</div>;
}
