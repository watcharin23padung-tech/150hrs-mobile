import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EntryForm from "@/components/EntryForm";
import AppFrame from "@/components/AppFrame";

export default async function NewEntryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role, major").eq("id", user.id).single();
  if (!profile) redirect("/login");

  return (
    <AppFrame role={profile.role}>
      <EntryForm major={profile.major} />
    </AppFrame>
  );
}
