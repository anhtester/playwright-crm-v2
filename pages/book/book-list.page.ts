import { type Page, type Locator, type Response } from '@playwright/test';
import { BookBasePage } from './book-base.page';

/** Trang Book Management: lưới thẻ sách, dữ liệu lấy từ GET /api/book */
export class BookListPage extends BookBasePage {
  /** Số sách mỗi trang của lưới. Trang còn gọi thêm một request limit=3 cho khu sách nổi bật */
  static readonly PAGE_SIZE = 20;

  readonly noData: Locator;
  readonly notifications: Locator;
  /** Dòng "Showing 1–20 of 35 books" phía trên lưới */
  readonly results: Locator;

  constructor(page: Page) {
    super(page, '/book-management', 'Find your next great read');
    this.noData = page.getByRole('heading', { name: 'No Data' });
    this.results = page.getByTestId('book-results');
    // Vùng thông báo nổi góc phải (toast)
    this.notifications = page.getByRole('region', { name: /Notifications/ });
  }

  /** Tên sách trên thẻ sách của LƯỚI. Khu sách nổi bật cũng hiện tên, nên chỉ tìm bên trong thẻ book-card-<slug> */
  bookTitle(name: string): Locator {
    return this.page.getByTestId(/^book-card-/).getByTitle(name, { exact: true });
  }

  /** Chờ response của request lấy sách cho lưới (limit=20), bỏ qua request của khu sách nổi bật (limit=3) */
  waitForGridResponse(): Promise<Response> {
    return this.page.waitForResponse((response) => {
      const url = new URL(response.url());
      return url.pathname === '/api/book' && url.searchParams.get('limit') === String(BookListPage.PAGE_SIZE);
    });
  }
}
