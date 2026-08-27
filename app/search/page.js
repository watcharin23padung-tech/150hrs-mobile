import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SearchClient from "./SearchClient";
import AppFrame from "@/components/AppFrame";

export default async function SearchPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");

  let entries = [];
  if (profile.role === "student") {
    const { data } = await supabase
      .from("internship_entries")
      .select("*")
      .eq("student_id", user.id)
      .order("activity_date", { ascending: false });
    entries = data ?? [];
  } else {
    const { data: advisees } = await supabase.from("profiles").select("id").eq("advisor_id", user.id);
    const adviseeIds = (advisees ?? []).map((a) => a.id);
    if (adviseeIds.length) {
      const { data } = await supabase
        .from("internship_entries")
        .select("*, profiles!internship_entries_student_id_fkey(full_name,code)")
        .in("student_id", adviseeIds)
        .order("activity_date", { ascending: false });
      entries = data ?? [];
    }
  }

  return (
    <AppFrame role={profile.role}>
      <SearchClient entries={entries} role={profile.role} />
    </AppFrame>
  );
}
