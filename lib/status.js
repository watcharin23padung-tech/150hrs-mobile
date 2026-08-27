export const STATUS_META = {
  pending: { label: "รออนุมัติ", bg: "bg-accenttint", text: "text-[oklch(45%_0.14_70)]" },
  approved: { label: "อนุมัติแล้ว", bg: "bg-primarytint", text: "text-primarydark" },
  rejected: { label: "ถูกตีกลับ", bg: "bg-dangertint", text: "text-danger" },
};

export function formatThaiDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const months = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
}
