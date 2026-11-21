import { type Locator } from '@playwright/test';

/** Các dòng dữ liệu của bảng: dòng có ô <td>, bỏ dòng tiêu đề (chỉ có <th>) */
export function dataRows(table: Locator): Locator {
  return table.getByRole('row').filter({ has: table.page().getByRole('cell') });
}

/** Vị trí (tính từ 0) của cột có tiêu đề cho trước. Không thấy cột thì báo lỗi rõ ràng */
export async function columnIndex(table: Locator, header: string): Promise<number> {
  // allTextContents() lấy chữ gốc trong HTML. allInnerTexts() lấy chữ SAU khi CSS biến đổi:
  // Book in hoa tiêu đề cột bằng CSS nên innerText trả về "START" thay vì "Start"
  const headers = await table.getByRole('columnheader').allTextContents();
  const index = headers.map((text) => text.trim()).indexOf(header);
  if (index === -1) {
    throw new Error(`Không thấy cột "${header}". Bảng đang có các cột: ${headers.join(' | ')}`);
  }
  return index;
}

/** Đọc cả bảng thành mảng object, tên thuộc tính lấy từ tiêu đề cột */
export async function readTable(table: Locator): Promise<Record<string, string>[]> {
  const headers = await table.getByRole('columnheader').allTextContents();
  const rows = dataRows(table);
  const data: Record<string, string>[] = [];
  for (let i = 0; i < await rows.count(); i++) {
    const cells = await rows.nth(i).getByRole('cell').allInnerTexts();
    const item: Record<string, string> = {};
    headers.forEach((header, col) => {
      item[header.trim()] = (cells[col] ?? '').trim();
    });
    data.push(item);
  }
  return data;
}
