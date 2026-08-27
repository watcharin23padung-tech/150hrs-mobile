import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EntryForm from "@/components/EntryForm";
import AppFrame from "@/components/AppFrame";

export default async function EditEntryPage({ params }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile) redirect("/login");

  const { data: entry } = await supabase.from("internship_entries").select("*").eq("id", params.id).single();
  if (!entry) notFound();

  return (
    <AppFrame role={profile.role}>
      <EntryForm initial={entry} />
    </AppFrame>
  );
}
