"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAJORS = [
  "สาขาวิชาสื่อสารทางกีฬา",
  "สาขาวิชาวิทยาศาสตร์การออกกำลังกายและการกีฬา",
  "สาขาวิชาการจัดการกีฬาและการเป็นผู้ฝึกสอนกีฬา",
];

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState("login"); // login | signup
  const [role, setRole] = useState("student");
  const [fullName, setFullName] = useState("");
  const [code, setCode] = useState("");
  const [major, setMajor] = useState("");
  const [advisorId, setAdvisorId] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "signup" && role === "student" && teachers.length === 0) {
      supabase.rpc("list_teachers").then(({ data }) => setTeachers(data ?? []));
    }
  }, [mode, role]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (mode === "signup" && !/@(go\.)?buu\.ac\.th$/i.test(email.trim())) {
      setError("กรุณาใช้อีเมลของมหาวิทยาลัยที่ลงท้ายด้วย @go.buu.ac.th หรือ @buu.ac.th เท่านั้น");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role, full_name: fullName.trim() } },
        });
        if (error) throw error;
        if (data.user && (code || major || (role === "student" && advisorId))) {
          const updates = {};
          if (role === "student" && code) updates.code = code;
          if (major) updates.major = major;
          if (role === "student" && advisorId) updates.advisor_id = advisorId;
          await supabase.from("profiles").update(updates).eq("id", data.user.id);
        }
      }
      router.push("/home");
      router.refresh();
    } catch (err) {
      const msg =
        err.message === "Invalid login credentials"
          ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
          : /go\.buu\.ac\.th/i.test(err.message)
          ? "กรุณาใช้อีเมลของมหาวิทยาลัยที่ลงท้ายด้วย @go.buu.ac.th หรือ @buu.ac.th เท่านั้น"
          : err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col items-center gap-3 px-8 pt-10 pb-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Burapha University x Faculty of Sport Science" className="w-full max-w-[210px] h-auto" />
        <div className="w-10 h-[3px] rounded-full bg-accent" />
        <div className="flex flex-col items-center gap-1">
          <div className="font-head font-bold text-lg text-ink text-center leading-snug">
            ระบบการฝึกประสบการณ์ด้านบริการวิชาการแก่ชุมชน 150 ชั่วโมง
          </div>
          <div className="text-sm text-ink2 text-center">คณะวิทยาศาสตร์การกีฬา มหาวิทยาลัยบูรพา</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 pb-6 flex-grow overflow-y-auto">
        <div className="flex bg-surfacealt rounded-xl p-1 gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`relative flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              mode === "login" ? "bg-white text-primarydark shadow-md" : "text-ink2"
            }`}
          >
            เข้าสู่ระบบ
            {mode === "login" && <span className="absolute left-1/2 -translate-x-1/2 bottom-1 w-6 h-[3px] rounded-full bg-accent" />}
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`relative flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              mode === "signup" ? "bg-white text-primarydark shadow-md" : "text-ink2"
            }`}
          >
            ลงทะเบียนใช้งาน
            {mode === "signup" && <span className="absolute left-1/2 -translate-x-1/2 bottom-1 w-6 h-[3px] rounded-full bg-accent" />}
          </button>
        </div>

        {mode === "signup" && (
          <>
            <div className="flex bg-surfacealt rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold ${
                  role === "student" ? "bg-white text-primary shadow-sm" : "text-ink2"
                }`}
              >
                นิสิต
              </button>
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold ${
                  role === "teacher" ? "bg-white text-primary shadow-sm" : "text-ink2"
                }`}
              >
                อาจารย์
              </button>
            </div>
            <Field label="ชื่อ-นามสกุล">
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={role === "teacher" ? "เช่น ดร.วัชชริน ผดุงรัชดากิจ" : "เช่น นางสาวณิชา พงษ์ไพบูลย์"}
                className="input"
              />
              <div className="text-[11.5px] text-ink3">
                {role === "teacher"
                  ? "กรุณาใส่คำนำหน้า เช่น ดร. ผศ. รศ. นำหน้าชื่อด้วย"
                  : "กรุณาใส่คำนำหน้า นาย/นางสาว นำหน้าชื่อด้วย"}
              </div>
            </Field>
            {role === "student" ? (
              <Field label="รหัสนิสิต">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="เช่น 6512345678"
                  className="input"
                />
              </Field>
            ) : null}
            {role === "student" ? (
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
                  placeholder="เช่น วิทยาศาสตร์การออกกำลังกายและการกีฬา"
                  className="input"
                />
              </Field>
            )}
            {role === "student" && (
              <Field label="อาจารย์ที่ปรึกษา">
                <select required value={advisorId} onChange={(e) => setAdvisorId(e.target.value)} className="input">
                  <option value="">-- เลือกอาจารย์ที่ปรึกษา --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name}
                    </option>
                  ))}
                </select>
                <div className="text-[11.5px] text-ink3">แก้ไขเปลี่ยนอาจารย์ที่ปรึกษาภายหลังได้จากหน้าโปรไฟล์</div>
              </Field>
            )}
          </>
        )}

        <Field label="อีเมล">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@go.buu.ac.th"
            className="input"
          />
          {mode === "signup" && (
            <div className="text-[11.5px] text-ink3">ใช้ได้เฉพาะอีเมลที่ลงท้ายด้วย @go.buu.ac.th หรือ @buu.ac.th เท่านั้น</div>
          )}
        </Field>
        <Field label="รหัสผ่าน">
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="อย่างน้อย 6 ตัวอักษร"
            className="input"
          />
        </Field>

        {error && <div className="text-danger text-sm bg-dangertint rounded-lg px-3 py-2">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="h-[52px] rounded-2xl bg-gradient-to-b from-primary to-primarydark text-white font-semibold text-[15px] shadow-lg shadow-primary/25 transition-transform active:scale-[0.98] disabled:opacity-60 disabled:shadow-none"
        >
          {loading ? "กำลังดำเนินการ..." : mode === "login" ? "เข้าสู่ระบบ" : "ลงทะเบียนใช้งาน"}
        </button>
      </form>

      <div className="text-center text-[11px] text-ink2 leading-relaxed pb-4">
        พัฒนาและดูแลระบบ: ดร.วัชชริน ผดุงรัชดากิจ @2569
        <br />
        สาขาวิชาสื่อสารทางกีฬา คณะวิทยาศาสตร์การกีฬา
        <br />
        มหาวิทยาลัยบูรพา
      </div>

      <style jsx global>{`
        .input {
          height: 48px;
          border-radius: 12px;
          border: 1px solid oklch(90% 0.012 80);
          background: white;
          padding: 0 14px;
          font-size: 14px;
          color: oklch(22% 0.02 80);
        }
        .input:focus {
          outline: 2px solid oklch(55% 0.13 165);
          outline-offset: 1px;
        }
      `}</style>
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
