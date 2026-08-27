import Link from "next/link";

export default function AppNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-10 text-center h-full">
      <div className="font-head font-bold text-lg text-ink">ไม่พบหน้าที่ต้องการ</div>
      <div className="text-[13px] text-ink3">หน้านี้อาจถูกย้ายหรือไม่มีอยู่จริง</div>
      <Link href="/home" className="text-primary text-sm font-semibold">
        กลับหน้าแรก
      </Link>
    </div>
  );
}
