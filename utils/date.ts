/** Trả về ngày mới = ngày gốc cộng thêm số ngày (số âm là lùi lại) */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Tách ngày theo GIỜ MÁY ĐANG CHẠY thành 3 chuỗi: dd, mm, yyyy */
export function dateParts(date: Date): { dd: string; mm: string; yyyy: string } {
  return {
    dd: String(date.getDate()).padStart(2, '0'),
    mm: String(date.getMonth() + 1).padStart(2, '0'), // getMonth() đếm từ 0
    yyyy: String(date.getFullYear()),
  };
}

/** 2026-11-25: định dạng mà thẻ input type="date" nhận */
export function formatYMD(date: Date): string {
  const { dd, mm, yyyy } = dateParts(date);
  return `${yyyy}-${mm}-${dd}`;
}
