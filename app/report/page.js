import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReportClient from "./ReportClient";
import StudentReportClient from "./StudentReportClient";
import AppFrame from "@/components/AppFrame";
import { MIN_MAIN_HOURS, computeCategoryHours } from "@/lib/workCategories";
import { computeYearLevel } from "@/lib/yearLevel";

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
      .select(
        "id, place, hours, status, activity_date, reviewer_comment, submitted_at, work_category, work_type, supervisor_name"
      )
      .eq("student_id", user.id)
      .order("activity_date", { ascending: false });

    return (
      <AppFrame role={profile.role}>
        <StudentReportClient profile={profile} entries={entries ?? []} />
      </AppFrame>
    );
  }

  const isAdmin = profile.role === "admin";
  const isStaff = profile.role === "staff";
  const seesAllStudents = isAdmin || isStaff;

  const adviseesQuery = supabase
    .from("profiles")
    .select("id, full_name, code, major, year_level, target_hours, completion_certified_at, advisor_id, is_active")
    .order("full_name");

  const { data: advisees } = seesAllStudents
    ? await adviseesQuery.eq("role", "student")
    : await adviseesQuery.eq("advisor_id", user.id);

  let teachers = [];
  if (seesAllStudents) {
    const { data: teacherList } = await supabase
      .from("profiles")
      .select("id, full_name, email, is_active")
      .eq("role", "teacher")
      .order("full_name");
    teachers = teacherList ?? [];
  }
  const teacherNameById = Object.fromEntries(teachers.map((t) => [t.id, t.full_name]));

  const adviseeIds = (advisees ?? []).map((a) => a.id);

  let entriesByStudent = {};
  if (adviseeIds.length) {
    const { data: entries } = await supabase
      .from("internship_entries")
      .select("student_id, hours, status, activity_date, work_category")
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

    const categoryHours = computeCategoryHours(approved);

    const eligible =
      approvedHours >= target &&
      (categoryHours.main ?? 0) >= MIN_MAIN_HOURS &&
      (categoryHours.secondary ?? 0) > 0 &&
      (categoryHours.volunteer ?? 0) > 0;

    return {
      id: a.id,
      fullName: a.full_name,
      code: a.code,
      major: a.major,
      yearLevel: computeYearLevel(a.code),
      target,
      approvedHours,
      percent,
      totalEntries: entries.length,
      pendingCount,
      rejectedCount,
      lastActivity: lastActivity ?? null,
      categoryHours,
      entries,
      eligible,
      certifiedAt: a.completion_certified_at ?? null,
      advisorId: a.advisor_id ?? null,
      advisorName: a.advisor_id ? teacherNameById[a.advisor_id] ?? null : null,
      isActive: a.is_active !== false,
    };
  });

  return (
    <AppFrame role={profile.role}>
      <ReportClient students={students} isAdmin={isAdmin} teachers={teachers} readOnly={isStaff} />
    </AppFrame>
  );
}
