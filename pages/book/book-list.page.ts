import { type Page, type Locator } from '@playwright/test';
import { BookBasePage } from './book-base.page';

/** Trang Book Management: lưới thẻ sách, dữ liệu lấy từ GET /api/book */
export class BookListPage extends BookBasePage {
  readonly noData: Locator;
  readonly notifications: Locator;

  constructor(page: Page) {
    super(page, '/book-management', 'Book Management');
    this.noData = page.getByRole('heading', { name: 'No Data' });
    // Vùng thông báo nổi góc phải (toast)
    this.notifications = page.getByRole('region', { name: /Notifications/ });
  }

  /** Tên sách trên thẻ sách (heading cấp 6) */
  bookTitle(name: string): Locator {
    return this.page.getByRole('heading', { name, level: 6, exact: true });
  }
}
