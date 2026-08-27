import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileClient from "./ProfileClient";
import AppFrame from "@/components/AppFrame";

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");

  let stats = null;
  let teachers = [];
  if (profile.role === "student") {
    const { data: entries } = await supabase.from("internship_entries").select("hours,status").eq("student_id", user.id);
    const total = entries?.length ?? 0;
    const approved = (entries ?? []).filter((e) => e.status === "approved");
    const approvedHours = approved.reduce((s, e) => s + Number(e.hours), 0);
    const target = Number(profile.target_hours) || 150;
    stats = { total, approvedCount: approved.length, approvedHours, remaining: Math.max(0, target - approvedHours), target };

    const { data: teacherList } = await supabase.rpc("list_teachers");
    teachers = teacherList ?? [];
  } else {
    const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("advisor_id", user.id);
    stats = { adviseeCount: count ?? 0 };
  }

  return (
    <AppFrame role={profile.role}>
      <ProfileClient profile={profile} stats={stats} teachers={teachers} />
    </AppFrame>
  );
}
