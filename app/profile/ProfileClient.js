"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAJORS = [
  "สาขาวิชาสื่อสารทางกีฬา",
  "สาขาวิชาวิทยาศาสตร์การออกกำลังกายและการกีฬา",
  "สาขาวิชาการจัดการกีฬาและการเป็นผู้ฝึกสอนกีฬา",
];

export default function ProfileClient({ profile, stats, teachers = [] }) {
  const router = useRouter();
  const supabase = createClient();
  const [notifOn, setNotifOn] = useState(profile.notifications_enabled);
  const [advisorId, setAdvisorId] = useState(profile.advisor_id ?? "");
  const [savingAdvisor, setSavingAdvisor] = useState(false);
  const isStudent = profile.role === "student";
  const initials = profile.full_name?.slice(0, 2) ?? "?";
  const currentAdvisorName = teachers.find((t) => t.id === profile.advisor_id)?.full_name;

  const [editing, setEditing] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoError, setInfoError] = useState("");
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [code, setCode] = useState(profile.code ?? "");
  const [major, setMajor] = useState(profile.major ?? "");
  const [yearLevel, setYearLevel] = useState(profile.year_level ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");

  async function toggleNotif() {
    const next = !notifOn;
    setNotifOn(next);
    await supabase.from("profiles").update({ notifications_enabled: next }).eq("id", profile.id);
  }

  async function saveInfo(e) {
    e.preventDefault();
    if (!fullName.trim()) {
      setInfoError("กรุณากรอกชื่อ-นามสกุล");
      return;
    }
    setInfoError("");
    setSavingInfo(true);
    const updates = {
      full_name: fullName.trim(),
      major: major.trim() || null,
      phone: phone.trim() || null,
    };
    if (isStudent) {
      updates.code = code.trim() || null;
      updates.year_level = yearLevel ? Number(yearLevel) : null;
    }
    const { error } = await supabase.from("profiles").update(updates).eq("id", profile.id);
    setSavingInfo(false);
    if (error) {
      setInfoError(error.message);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function changeAdvisor(e) {
    const next = e.target.value;
    setAdvisorId(next);
    setSavingAdvisor(true);
    await supabase.from("profiles").update({ advisor_id: next || null }).eq("id", profile.id);
    setSavingAdvisor(false);
    router.refresh();
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
            {isStudent
              ? `รหัสนิสิต ${profile.code ?? "-"}${profile.year_level ? " · ปี " + profile.year_level : ""}${
                  profile.major ? " · " + profile.major : " · วิทยาศาสตร์การกีฬา"
                }`
              : `อาจารย์ที่ปรึกษาฝึกประสบการณ์${profile.major ? " · " + profile.major : ""}`}
          </div>
        </div>
        <div className="text-xs text-ink3">{profile.email}</div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-[12.5px] font-semibold text-primary border border-primary rounded-full px-4 py-1.5"
          >
            แก้ไขข้อมูลส่วนตัว
          </button>
        )}
      </div>

      {editing && (
        <form onSubmit={saveInfo} className="bg-surface border border-border rounded-[18px] p-[18px] flex flex-col gap-3.5">
          <div className="text-[13px] font-semibold text-ink">แก้ไขข้อมูลส่วนตัว</div>
          <Field label="ชื่อ-นามสกุล">
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" />
          </Field>
          {isStudent ? (
            <Field label="รหัสนิสิต">
              <input value={code} onChange={(e) => setCode(e.target.value)} className="input" />
            </Field>
          ) : null}
          {isStudent ? (
            <Field label="สาขาวิชา">
              <select value={major} onChange={(e) => setMajor(e.target.value)} className="input">
                <option value="">-- เลือกสาขาวิชา --</option>
                {MAJORS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label="สาขาวิชา">
              <input
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="input"
                placeholder="เช่น วิทยาศาสตร์การออกกำลังกายและการกีฬา"
              />
            </Field>
          )}
          {isStudent && (
            <Field label="ชั้นปี">
              <select value={yearLevel} onChange={(e) => setYearLevel(e.target.value)} className="input">
                <option value="">-- เลือกชั้นปี --</option>
                <option value="1">ปี 1</option>
                <option value="2">ปี 2</option>
                <option value="3">ปี 3</option>
                <option value="4">ปี 4</option>
                <option value="5">ปี 5 ขึ้นไป</option>
              </select>
            </Field>
          )}
          <Field label="เบอร์โทรศัพท์ติดต่อ">
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="เช่น 0812345678" />
          </Field>
          {infoError && <div className="text-danger text-[12.5px] bg-dangertint rounded-lg px-3 py-2">{infoError}</div>}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setInfoError("");
                setFullName(profile.full_name ?? "");
                setCode(profile.code ?? "");
                setMajor(profile.major ?? "");
                setYearLevel(profile.year_level ?? "");
                setPhone(profile.phone ?? "");
              }}
              className="flex-1 h-[46px] rounded-2xl border border-border text-ink2 font-semibold text-sm"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={savingInfo}
              className="flex-1 h-[46px] rounded-2xl bg-primary text-white font-semibold text-sm disabled:opacity-60"
            >
              {savingInfo ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      )}

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
      ) : null}

      {isStudent ? (
        <div className="flex flex-col gap-1.5">
          <div className="text-[12.5px] font-semibold text-ink3 px-1">อาจารย์ที่ปรึกษา</div>
          <div className="bg-surface border border-border rounded-2xl px-4 py-3.5 flex flex-col gap-2">
            <select
              value={advisorId}
              onChange={changeAdvisor}
              disabled={savingAdvisor}
              className="input"
            >
              <option value="">-- ยังไม่ได้เลือก --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name}
                </option>
              ))}
            </select>
            {currentAdvisorName && (
              <div className="text-[11.5px] text-ink3">อาจารย์ที่ปรึกษาปัจจุบัน: {currentAdvisorName}</div>
            )}
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

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-ink2">{label}</label>
      {children}
    </div>
  );
}
