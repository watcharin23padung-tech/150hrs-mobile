"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/StatusBadge";
import { formatThaiDate } from "@/lib/status";

export default function DetailClient({ entry, role, isOwner, isAdvisor }) {
  const router = useRouter();
  const supabase = createClient();
  const [comment, setComment] = useState(entry.reviewer_comment ?? "");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  async function review(status) {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase
      .from("internship_entries")
      .update({
        status,
        reviewer_id: user.id,
        reviewer_comment: comment || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", entry.id);
    setSaving(false);
    router.refresh();
  }

  async function copyLink() {
    if (entry.evidence_url) {
      try {
        await navigator.clipboard.writeText(entry.evidence_url);
      } catch {}
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const canReview = role === "teacher" && isAdvisor && entry.status === "pending";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 pt-6 pb-3 flex-shrink-0">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-[11px] bg-surface border border-border flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="oklch(22% 0.02 80)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="font-head font-bold text-[17px] text-ink">รายละเอียดกิจกรรม</div>
      </div>

      <div className="flex-grow overflow-y-auto px-5 pb-5 flex flex-col gap-4">
        <div className="bg-surface border border-border rounded-[18px] p-[18px] flex flex-col gap-3.5">
          <div className="flex items-start justify-between gap-2.5">
            <div className="font-head font-bold text-[17px] text-ink">{entry.place}</div>
            <StatusBadge status={entry.status} />
          </div>
          <div className="flex flex-col gap-2.5 text-[13px] text-ink2">
            <div>
              {formatThaiDate(entry.activity_date)}
              {entry.start_time && entry.end_time ? ` · ${entry.start_time.slice(0, 5)} - ${entry.end_time.slice(0, 5)} น.` : ""}
            </div>
            <div>รวม {entry.hours} ชั่วโมง</div>
            {role === "teacher" && (
              <div>
                {entry.profiles?.full_name} {entry.profiles?.code ? `· ${entry.profiles.code}` : ""}
              </div>
            )}
          </div>
          {entry.description && (
            <>
              <div className="h-px bg-border" />
              <div className="flex flex-col gap-1.5">
                <div className="text-[12.5px] font-semibold text-ink2">รายละเอียดกิจกรรม</div>
                <div className="text-[13.5px] leading-relaxed text-ink">{entry.description}</div>
              </div>
            </>
          )}
        </div>

        {entry.evidence_url && (
          <div className="flex flex-col gap-2">
            <div className="font-head font-semibold text-sm text-ink">หลักฐานประกอบ</div>
            <div className="bg-surface border border-border rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-[42px] h-[42px] rounded-xl bg-primarytint flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M14 3H6a1 1 0 00-1 1v16a1 1 0 001 1h12a1 1 0 001-1V8l-5-5z" stroke="oklch(55% 0.13 165)" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M14 3v5h5" stroke="oklch(55% 0.13 165)" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex flex-col gap-0.5 flex-grow min-w-0">
                <div className="text-[13px] font-semibold text-ink truncate">{entry.evidence_name || "หลักฐานประกอบ"}</div>
                <div className="text-[11.5px] text-ink3">เก็บไว้บน Google Drive</div>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={entry.evidence_url}
                target="_blank"
                rel="noreferrer"
                className="flex-grow h-11 rounded-xl bg-surface border border-border flex items-center justify-center gap-2 text-[13px] font-semibold text-ink"
              >
                เปิดใน Google Drive
              </a>
              <button onClick={copyLink} className="w-11 h-11 rounded-xl bg-surface border border-border flex items-center justify-center flex-shrink-0">
                {copied ? "✓" : "⧉"}
              </button>
            </div>
          </div>
        )}

        {isAdvisor && (
          <div className="flex flex-col gap-2">
            <div className="font-head font-semibold text-sm text-ink">ความคิดเห็นถึงนิสิต (ถ้ามี)</div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="เพิ่มความคิดเห็น เช่น เหตุผลการตีกลับ"
              className="min-h-[72px] rounded-xl border border-border bg-surface p-3 text-[13px] text-ink resize-none"
            />
          </div>
        )}

        {isOwner && entry.status === "rejected" && entry.reviewer_comment && (
          <div className="bg-dangertint rounded-2xl p-3.5 flex flex-col gap-1">
            <div className="text-[12.5px] font-semibold text-danger">ความคิดเห็นจากอาจารย์</div>
            <div className="text-[13px] leading-snug text-[oklch(35%_0.1_25)]">{entry.reviewer_comment}</div>
          </div>
        )}
      </div>

      {canReview && (
        <div className="flex-shrink-0 flex gap-2.5 px-5 pt-3.5 pb-6 bg-surface border-t border-border">
          <button
            disabled={saving}
            onClick={() => review("rejected")}
            className="flex-1 h-[50px] rounded-2xl border border-danger text-danger font-semibold text-sm disabled:opacity-60"
          >
            ตีกลับ
          </button>
          <button
            disabled={saving}
            onClick={() => review("approved")}
            className="flex-1 h-[50px] rounded-2xl bg-primary text-white font-semibold text-sm disabled:opacity-60"
          >
            อนุมัติ
          </button>
        </div>
      )}
      {isOwner && entry.status === "rejected" && (
        <div className="flex-shrink-0 px-5 pt-3.5 pb-6 bg-surface border-t border-border">
          <a
            href={`/entries/${entry.id}/edit`}
            className="block text-center w-full h-[50px] leading-[50px] rounded-2xl border border-border text-ink font-semibold text-sm"
          >
            แก้ไขและส่งใหม่
          </a>
        </div>
      )}
    </div>
  );
}
