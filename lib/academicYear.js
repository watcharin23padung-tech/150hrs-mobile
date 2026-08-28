// ปีการศึกษาไทย เริ่มมิถุนายน - พฤษภาคมปีถัดไป ระบุด้วยปี พ.ศ. ของปีที่เริ่ม
export function getAcademicYear(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = d.getMonth() + 1; // 1-12
  const startYear = m >= 6 ? y : y - 1;
  return startYear + 543;
}

export function academicYearLabel(ay) {
  if (!ay) return "ไม่ระบุปี";
  return `ปีการศึกษา ${ay}`;
}

// รายการปีการศึกษาทั้งหมดที่พบในรายการบันทึก เรียงล่าสุดก่อน
export function listAcademicYears(entries) {
  const set = new Set();
  (entries ?? []).forEach((e) => {
    const ay = getAcademicYear(e.activity_date);
    if (ay) set.add(ay);
  });
  return Array.from(set).sort((a, b) => b - a);
}
