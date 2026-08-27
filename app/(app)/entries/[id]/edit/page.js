import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EntryForm from "@/components/EntryForm";

export default async function EditEntryPage({ params }) {
  const supabase = createClient();
  const { data: entry } = await supabase.from("internship_entries").select("*").eq("id", params.id).single();
  if (!entry) notFound();
  return <EntryForm initial={entry} />;
}
