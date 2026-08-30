// คำนวณ "ชั้นปี" ของนิสิตโดยอัตโนมัติจากรหัสนิสิต (2 หลักแรก = ปี พ.ศ. ที่เข้าศึกษา)
// เช่น รหัส 6512345678 -> เข้าปี พ.ศ. 2565
// ปีการศึกษาไทยเริ่มประมาณเดือนมิถุนายน จึงถือว่าก่อนเดือนมิถุนายนยังอยู่ปีการศึกษาเดิม
export function computeYearLevel(code, referenceDate = new Date()) {
  if (!code) return null;
  const match = String(code).match(/^(\d{2})/);
  if (!match) return null;

  const entryBEYear = 2500 + parseInt(match[1], 10);

  const gregorianYear = referenceDate.getFullYear();
  const beYear = gregorianYear + 543;
  // เดือน 0-4 (ม.ค.-พ.ค.) ถือว่ายังเป็นปีการศึกษาก่อนหน้า
  const academicBEYear = referenceDate.getMonth() < 5 ? beYear - 1 : beYear;

  let level = academicBEYear - entryBEYear + 1;
  if (level < 1) level = 1;
  if (level > 8) level = 8;
  return level;
}
