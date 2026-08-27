import BottomNav from "@/components/BottomNav";

export default function AppFrame({ role, children }) {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow overflow-y-auto">{children}</div>
      <BottomNav role={role} />
    </div>
  );
}
