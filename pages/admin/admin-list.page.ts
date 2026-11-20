import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Lớp cha của các trang danh sách khu Admin (Customers, Projects...).
 * Trang nào cũng có một bảng id="<tableId>" và vùng lọc id="<tableId>_filter" của thư viện DataTables.
 */
export class AdminListPage extends BasePage {
  readonly searchInput: Locator;
  readonly table: Locator;
  readonly rows: Locator;

  constructor(page: Page, path: string, tableId: string) {
    super(page, path);
    // Trang có 2 ô searchbox (tìm toàn hệ thống ở thanh trên và ô lọc của bảng): lấy ô nằm trong vùng lọc của bảng
    this.searchInput = page.locator(`//div[@id="${tableId}_filter"]`).getByRole('searchbox');
    this.table = page.locator(`//table[@id="${tableId}"]`);
    // Bảng CRM có role="grid" nên ô dữ liệu là gridcell, KHÔNG phải cell như bảng Book.
    // Dòng dữ liệu = dòng có gridcell (bỏ dòng tiêu đề chỉ có columnheader)
    this.rows = this.table.getByRole('row').filter({ has: page.getByRole('gridcell') });
  }

  /** Gõ vào ô lọc của bảng, bảng tự tải lại theo từ khoá */
  async search(text: string): Promise<void> {
    await this.searchInput.fill(text);
  }

  /** Dòng của bảng có chứa đoạn chữ cho trước */
  row(text: string): Locator {
    return this.rows.filter({ hasText: text });
  }
}
