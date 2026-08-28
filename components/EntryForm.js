"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_META, OTHER_VALUE, getWorkTypeOptions } from "@/lib/workCategories";

export default function EntryForm({ initial, major }) {
  const router = useRouter();
  const supabase = createClient();
  const isEdit = Boolean(initial);

  const [place, setPlace] = useState(initial?.place ?? "");
  const [date, setDate] = useState(initial?.activity_date ?? "");
  const [startTime, setStartTime] = useState(initial?.start_time?.slice(0, 5) ?? "");
  const [endTime, setEndTime] = useState(initial?.end_time?.slice(0, 5) ?? "");
  const [hours, setHours] = useState(initial?.hours ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [evidenceUrl, setEvidenceUrl] = useState(initial?.evidence_url ?? "");
  const [evidenceName, setEvidenceName] = useState(initial?.evidence_name ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [workCategory, setWorkCategory] = useState(initial?.work_category ?? "main");
  const typeOptions = useMemo(() => getWorkTypeOptions(major, workCategory), [major, workCategory]);
  const initialIsOther = Boolean(initial?.work_type) && !typeOptions.includes(initial?.work_type);
  const [workType, setWorkType] = useState(
    initial?.work_type ? (initialIsOther ? OTHER_VALUE : initial.work_type) : ""
  );
  const [workTypeOther, setWorkTypeOther] = useState(initialIsOther ? initial.work_type : "");

  function handleCategoryChange(cat) {
    setWorkCategory(cat);
    setWorkType("");
    setWorkTypeOther("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const resolvedWorkType =
        workCategory === "volunteer" ? null : workType === OTHER_VALUE ? workTypeOther || null : workType || null;

      const payload = {
        place,
        activity_date: date,
        start_time: startTime || null,
        end_time: endTime || null,
        hours: Number(hours),
        description: description || null,
        evidence_url: evidenceUrl || null,
        evidence_name: evidenceName || null,
        work_category: workCategory,
        work_type: resolvedWorkType,
      };

      if (isEdit) {
        const { error } = await supabase
          .from("internship_entries")
          .update({ ...payload, status: "pending", reviewer_comment: null, reviewed_at: null })
          .eq("id", initial.id);
        if (error) throw error;
        router.push(`/entries/${initial.id}`);
      } else {
        const { data, error } = await supabase
          .from("internship_entries")
          .insert({ ...payload, student_id: user.id })
          .select()
          .single();
        if (error) throw error;
        router.push(`/entries/${data.id}`);
      }
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 pt-6 pb-3 flex-shrink-0">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-[11px] bg-surface border border-border flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="oklch(22% 0.02 80)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="font-head font-bold text-[17px] text-ink">{isEdit ? "แก้ไขบันทึกชั่วโมง" : "บันทึกชั่วโมงใหม่"}</div>
      </div>

      <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto px-5 pb-6 flex flex-col gap-3.5">
        <Field label="ประเภทภาระงาน">
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(CATEGORY_META).map(([key, meta]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleCategoryChange(key)}
                className={`rounded-xl py-2.5 text-[12.5px] font-semibold text-center ${
                  workCategory === key ? "bg-primary text-white" : "bg-surfacealt text-ink2"
                }`}
              >
                {meta.short}
              </button>
            ))}
          </div>
        </Field>

        {workCategory !== "volunteer" && typeOptions.length > 0 && (
          <Field label="ประเภทงาน">
            <select value={workType} onChange={(e) => setWorkType(e.target.value)} className="input" required>
              <option value="" disabled>
                เลือกประเภทงาน
              </option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              <option value={OTHER_VALUE}>อื่น ๆ ที่เกี่ยวข้อง ระบุ...</option>
            </select>
          </Field>
        )}

        {workCategory !== "volunteer" && workType === OTHER_VALUE && (
          <Field label="ระบุประเภทงาน">
            <input
              required
              value={workTypeOther}
              onChange={(e) => setWorkTypeOther(e.target.value)}
              placeholder="ระบุประเภทงานที่ทำ"
              className="input"
            />
          </Field>
        )}

        <Field label="สถานที่ฝึกประสบการณ์">
          <input required value={place} onChange={(e) => setPlace(e.target.value)} placeholder="เช่น สนามกีฬาโรงเรียนสาธิตฯ" className="input" />
        </Field>
        <Field label="วันที่ทำกิจกรรม">
          <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
        </Field>
        <div className="flex gap-3">
          <Field label="เวลาเริ่ม" className="flex-1">
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input" />
          </Field>
          <Field label="เวลาสิ้นสุด" className="flex-1">
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="input" />
          </Field>
        </div>
        <Field label="จำนวนชั่วโมง">
          <input required type="number" min="0.5" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="เช่น 4" className="input" />
        </Field>
        <Field label="รายละเอียดกิจกรรม">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="อธิบายกิจกรรมที่ทำโดยย่อ"
            className="min-h-[90px] rounded-xl border border-border bg-white p-3 text-[13.5px] text-ink resize-none"
          />
        </Field>
        <Field label="ลิงก์หลักฐานจาก Google Drive">
          <input
            type="url"
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            placeholder="https://drive.google.com/..."
            className="input"
          />
        </Field>
        <Field label="ชื่อไฟล์หลักฐาน (ถ้ามี)">
          <input value={evidenceName} onChange={(e) => setEvidenceName(e.target.value)} placeholder="เช่น รายงานการฝึก_12ส.ค.pdf" className="input" />
        </Field>

        {error && <div className="text-danger text-sm bg-dangertint rounded-lg px-3 py-2">{error}</div>}

        <button
          type="submit"
          disabled={saving}
          className="h-[52px] rounded-2xl bg-primary text-white font-semibold text-[15px] disabled:opacity-60 mt-1"
        >
          {saving ? "กำลังบันทึก..." : isEdit ? "บันทึกและส่งใหม่" : "ส่งบันทึก"}
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
          width: 100%;
        }
        .input:focus {
          outline: 2px solid oklch(55% 0.13 165);
          outline-offset: 1px;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[13px] font-medium text-ink2">{label}</label>
      {children}
    </div>
  );
}
