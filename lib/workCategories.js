export const MIN_MAIN_HOURS = 50;

// นับชั่วโมงตามหมวด (หลัก/รอง/จิตอาสา) จากรายการที่บันทึกไว้
// กติกาเสริม: หมวดงานหลักนับได้สูงสุด MIN_MAIN_HOURS (50) ชม. เท่านั้น
// ส่วนที่เกินจะถูกปัดไปนับรวมในหมวดจิตอาสาแทน ใช้กติกาเดียวกันทุกสาขาวิชา
export function computeCategoryHours(entries) {
  const totals = { main: 0, secondary: 0, volunteer: 0 };
  (entries ?? []).forEach((e) => {
    const cat = e.work_category ?? "main";
    totals[cat] = (totals[cat] ?? 0) + Number(e.hours);
  });
  if (totals.main > MIN_MAIN_HOURS) {
    const excess = totals.main - MIN_MAIN_HOURS;
    totals.main = MIN_MAIN_HOURS;
    totals.volunteer += excess;
  }
  return totals;
}

export const CATEGORY_META = {
  main: { label: "ภาระงานหลัก", short: "หลัก", bg: "bg-primarytint", text: "text-primarydark" },
  secondary: { label: "ภาระงานรอง", short: "รอง", bg: "bg-accenttint", text: "text-[oklch(45%_0.14_70)]" },
  volunteer: { label: "จิตอาสา", short: "จิตอาสา", bg: "bg-surfacealt", text: "text-ink2" },
};

export const OTHER_VALUE = "__other__";

// ตัวเลือกประเภทงาน แยกตามสาขาวิชา และประเภทภาระงาน (หลัก/รอง)
// จิตอาสาไม่มีตัวเลือกย่อย เป็นการระบุกิจกรรมอิสระ
const MAJOR_WORK_TYPES = {
  "สาขาวิชาสื่อสารทางกีฬา": {
    main: ["งานประชาสัมพันธ์", "งานผลิตสื่อสิ่งพิมพ์ ภาพนิ่ง ภาพเคลื่อนไหว เสียง"],
    secondary: ["จัดการแข่งขันกีฬา", "ผู้ตัดสินกีฬา", "ผู้ช่วยนักวิจัย", "ทดสอบสมรรถภาพ"],
  },
  "สาขาวิชาวิทยาศาสตร์การออกกำลังกายและการกีฬา": {
    main: ["เจ้าหน้าที่ทดสอบสมรรถภาพ", "ผู้ช่วยงานวิจัย", "การฝึกและเสริมสร้างสมรรถภาพ", "ผู้นำออกกำลังกาย"],
    secondary: ["จัดการแข่งขันกีฬา", "ผู้ตัดสินกีฬา", "ผู้ฝึกสอนกีฬา"],
  },
  "สาขาวิชาการจัดการกีฬาและการเป็นผู้ฝึกสอนกีฬา": {
    main: ["ผู้ตัดสินกีฬา", "ผู้ฝึกสอนกีฬา", "จัดการแข่งขันกีฬา", "การฝึกและเสริมสร้างสมรรถภาพ"],
    secondary: ["เจ้าหน้าที่ทดสอบสมรรถภาพ", "ผู้ช่วยงานวิจัย"],
  },
};

// ให้ทางเลือกสำรอง เผื่อนิสิตยังไม่ได้ระบุสาขา หรือสาขาไม่ตรงกับที่กำหนดไว้
const FALLBACK_TYPES = { main: [], secondary: [] };

export function getWorkTypeOptions(major, category) {
  if (category === "volunteer") return [];
  const set = MAJOR_WORK_TYPES[major] ?? FALLBACK_TYPES;
  return set[category] ?? [];
}

export function hasMajorWorkTypes(major) {
  return Boolean(MAJOR_WORK_TYPES[major]);
}
