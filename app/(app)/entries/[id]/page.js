import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DetailClient from "./DetailClient";

export default async function EntryDetailPage({ params }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) notFound();

  const { data: entry } = await supabase
    .from("internship_entries")
    .select("*, profiles!internship_entries_student_id_fkey(full_name,code)")
    .eq("id", params.id)
    .single();

  if (!entry) notFound();

  const isOwner = entry.student_id === user.id;
  const isAdvisor = profile.role === "teacher";

  return <DetailClient entry={entry} role={profile.role} isOwner={isOwner} isAdvisor={isAdvisor} />;
}
