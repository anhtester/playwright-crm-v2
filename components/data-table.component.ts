import { type Locator } from '@playwright/test';
import { columnIndex, dataRows, readTable } from '../utils/table';

/** Một bảng dữ liệu bất kỳ. Trang nào có bảng thì đưa root của bảng đó vào */
export class DataTable {
  readonly root: Locator;
  readonly headers: Locator;
  readonly rows: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.headers = root.getByRole('columnheader');
    this.rows = dataRows(root); // hàm của utils/table.ts
  }

  /** Chữ của mọi ô trong một cột, tìm cột theo tiêu đề */
  async columnValues(header: string): Promise<string[]> {
    const index = await columnIndex(this.root, header);
    const values: string[] = [];
    for (const row of await this.rows.all()) {
      values.push((await row.getByRole('cell').nth(index).innerText()).trim());
    }
    return values;
  }

  /** Cả bảng thành mảng object, tên thuộc tính là tiêu đề cột */
  async read(): Promise<Record<string, string>[]> {
    return readTable(this.root);
  }
}
