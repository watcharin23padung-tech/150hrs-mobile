"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role, full_name: fullName } },
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
      setError(err.message === "Invalid login credentials" ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง" : err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col items-center gap-3 px-8 pt-14 pb-5">
        <div className="w-16 h-16 rounded-[20px] bg-primary flex items-center justify-center">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="13" r="8" stroke="white" strokeWidth="1.8" />
            <path d="M12 9v4l3 2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 2h6M12 2v2" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="font-head font-bold text-lg text-ink text-center leading-snug">
            ระบบการฝึกประสบการณ์ด้านบริการวิชาการแก่ชุมชน 150 ชั่วโมง
          </div>
          <div className="text-sm text-ink2 text-center">คณะวิทยาศาสตร์การกีฬา มหาวิทยาลัยบูรพา</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 pb-6 flex-grow overflow-y-auto">
        <div className="flex bg-surfacealt rounded-xl p-1 gap-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold ${
              mode === "login" ? "bg-white text-primary shadow-sm" : "text-ink2"
            }`}
          >
            เข้าสู่ระบบ
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold ${
              mode === "signup" ? "bg-white text-primary shadow-sm" : "text-ink2"
            }`}
          >
            สมัครสมาชิก
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
                placeholder="เช่น ณิชา พงษ์ไพบูลย์"
                className="input"
              />
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
                <select value={advisorId} onChange={(e) => setAdvisorId(e.target.value)} className="input">
                  <option value="">-- เลือกอาจารย์ที่ปรึกษา (เลือกภายหลังได้) --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name}
                    </option>
                  ))}
                </select>
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
            placeholder="name@ku.ac.th"
            className="input"
          />
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
          className="h-[52px] rounded-2xl bg-primary text-white font-semibold text-[15px] disabled:opacity-60"
        >
          {loading ? "กำลังดำเนินการ..." : mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
        </button>
      </form>

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
