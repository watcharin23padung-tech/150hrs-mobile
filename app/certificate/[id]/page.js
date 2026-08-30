import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CertificateClient from "./CertificateClient";
import { MIN_MAIN_HOURS } from "@/lib/workCategories";
import { computeYearLevel } from "@/lib/yearLevel";

export default async function CertificatePage({ params }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: student } = await supabase
    .from("profiles")
    .select(
      "id, full_name, code, major, year_level, target_hours, advisor_id, completion_certified_at, completion_certified_by"
    )
    .eq("id", params.id)
    .single();

  if (!student) notFound();

  const isSelf = student.id === user.id;
  const isAdvisor = student.advisor_id === user.id;
  if (!isSelf && !isAdvisor) notFound();

  const { data: entries } = await supabase
    .from("internship_entries")
    .select("hours, work_category")
    .eq("student_id", student.id)
    .eq("status", "approved");

  const categoryHours = { main: 0, secondary: 0, volunteer: 0 };
  (entries ?? []).forEach((e) => {
    const cat = e.work_category ?? "main";
    categoryHours[cat] = (categoryHours[cat] ?? 0) + Number(e.hours);
  });
  const totalHours = (entries ?? []).reduce((s, e) => s + Number(e.hours), 0);
  const target = Number(student.target_hours) || 150;
  const eligible = totalHours >= target && (categoryHours.main ?? 0) >= MIN_MAIN_HOURS;

  if (!student.completion_certified_at) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-2 p-8 text-center">
        <div className="text-3xl">⏳</div>
        <div className="font-head font-bold text-ink">ยังไม่สามารถออกเอกสารรับรองได้</div>
        <div className="text-[13px] text-ink3">นิสิตยังไม่ได้รับการรับรองผลจากอาจารย์ที่ปรึกษา</div>
      </div>
    );
  }

  // ป้องกันเอกสารหลุดออกไปโดยข้อมูลไม่ตรงกับความเป็นจริง เช่น มีการแก้ไข/ลบรายการหลังรับรองแล้ว
  if (!eligible) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-2 p-8 text-center">
        <div className="text-3xl">⚠️</div>
        <div className="font-head font-bold text-ink">เอกสารรับรองถูกระงับชั่วคราว</div>
        <div className="text-[13px] text-ink3 max-w-xs">
          ข้อมูลชั่วโมงของนิสิตมีการเปลี่ยนแปลงหลังการรับรองผล กรุณาให้อาจารย์ที่ปรึกษาตรวจสอบและรับรองผลอีกครั้ง
        </div>
      </div>
    );
  }

  const { data: advisor } = student.advisor_id
    ? await supabase
        .from("profiles")
        .select("full_name, major, signature_data")
        .eq("id", student.advisor_id)
        .single()
    : { data: null };

  return (
    <CertificateClient
      student={{ ...student, year_level: computeYearLevel(student.code) }}
      advisor={advisor}
      categoryHours={categoryHours}
      totalHours={totalHours}
      minMainHours={MIN_MAIN_HOURS}
    />
  );
}
