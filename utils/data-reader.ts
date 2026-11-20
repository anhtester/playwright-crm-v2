import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import ExcelJS from 'exceljs';

/** Đường dẫn tính từ gốc project, nên đứng ở thư mục nào gõ lệnh cũng đọc đúng file */
function fromRoot(relativePath: string): string {
  return path.resolve(__dirname, '..', relativePath);
}

/** Đọc file JSON thành object kiểu T */
export function readJson<T>(relativePath: string): T {
  const text = fs.readFileSync(fromRoot(relativePath), 'utf8');
  return JSON.parse(text) as T;
}

/** Đọc file CSV có dòng tiêu đề: mỗi dòng thành một object, tên thuộc tính lấy từ tiêu đề cột */
export function readCsv(relativePath: string): Record<string, string>[] {
  const text = fs.readFileSync(fromRoot(relativePath), 'utf8');
  return parse(text, {
    columns: true, // dòng đầu là tiêu đề cột
    skip_empty_lines: true, // bỏ dòng trống, hay gặp ở cuối file
    trim: true, // bỏ dấu cách thừa quanh mỗi ô
    bom: true, // file lưu từ Excel thường có ký tự BOM ở đầu, làm tên cột đầu tiên bị lệch
  });
}

/** Đọc một sheet Excel có dòng tiêu đề. Mọi ô đọc thành chuỗi đúng như đang hiển thị trong Excel */
export async function readExcel(relativePath: string, sheetName: string): Promise<Record<string, string>[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(fromRoot(relativePath));
  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet) {
    throw new Error(`Không có sheet "${sheetName}" trong file ${relativePath}`);
  }

  const headers: string[] = [];
  sheet.getRow(1).eachCell((cell, col) => {
    headers[col] = cell.text.trim();
  });

  const rows: Record<string, string>[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // bỏ dòng tiêu đề
    const item: Record<string, string> = {};
    headers.forEach((header, col) => {
      if (header) item[header] = row.getCell(col).text.trim();
    });
    rows.push(item);
  });
  return rows;
}

/** Lấy đúng một dòng theo giá trị của cột key. Không thấy thì báo rõ các key đang có */
export function findRow(rows: Record<string, string>[], key: string): Record<string, string> {
  const row = rows.find((item) => item.key === key);
  if (!row) {
    throw new Error(`Không có dòng key="${key}". Các key đang có: ${rows.map((item) => item.key).join(', ')}`);
  }
  return row;
}
