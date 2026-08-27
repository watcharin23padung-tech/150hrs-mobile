import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReportClient from "./ReportClient";
import StudentReportClient from "./StudentReportClient";

export default async function ReportPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");

  if (profile.role === "student") {
    const { data: entries } = await supabase
      .from("internship_entries")
      .select("id, place, hours, status, activity_date, reviewer_comment, submitted_at")
      .eq("student_id", user.id)
      .order("activity_date", { ascending: false });

    return <StudentReportClient profile={profile} entries={entries ?? []} />;
  }

  const { data: advisees } = await supabase
    .from("profiles")
    .select("id, full_name, code, major, year_level, target_hours")
    .eq("advisor_id", user.id)
    .order("full_name");

  const adviseeIds = (advisees ?? []).map((a) => a.id);

  let entriesByStudent = {};
  if (adviseeIds.length) {
    const { data: entries } = await supabase
      .from("internship_entries")
      .select("student_id, hours, status, activity_date")
      .in("student_id", adviseeIds);

    (entries ?? []).forEach((e) => {
      if (!entriesByStudent[e.student_id]) entriesByStudent[e.student_id] = [];
      entriesByStudent[e.student_id].push(e);
    });
  }

  const students = (advisees ?? []).map((a) => {
    const entries = entriesByStudent[a.id] ?? [];
    const approved = entries.filter((e) => e.status === "approved");
    const approvedHours = approved.reduce((s, e) => s + Number(e.hours), 0);
    const pendingCount = entries.filter((e) => e.status === "pending").length;
    const rejectedCount = entries.filter((e) => e.status === "rejected").length;
    const target = Number(a.target_hours) || 150;
    const percent = Math.min(100, Math.round((approvedHours / target) * 100));
    const lastActivity = entries
      .map((e) => e.activity_date)
      .filter(Boolean)
      .sort()
      .at(-1);

    return {
      id: a.id,
      fullName: a.full_name,
      code: a.code,
      major: a.major,
      yearLevel: a.year_level,
      target,
      approvedHours,
      percent,
      totalEntries: entries.length,
      pendingCount,
      rejectedCount,
      lastActivity: lastActivity ?? null,
    };
  });

  return <ReportClient students={students} />;
}
