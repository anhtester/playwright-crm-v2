import { expect, type Page, type Locator } from '@playwright/test';
import { BasePage } from '../base.page';
import { env } from '../../utils/env.config';

/** Trang chi tiết một cuốn sách: /book-management/detail/<slug>, dữ liệu lấy từ GET /api/book/<slug> */
export class BookDetailPage extends BasePage {
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page, '/book-management/detail', env.bookURL);
    this.backButton = page.getByRole('button', { name: 'Back' });
  }

  /** Mở chi tiết theo slug. Trang này không có menu trái nên không kế thừa BookBasePage */
  async open(slug: string): Promise<void> {
    await this.page.goto(`${this.url}/${slug}`);
  }

  /** Dòng tiêu đề trên trang chi tiết: tên sách, giá */
  heading(name: string): Locator {
    return this.page.getByRole('heading', { name, exact: true });
  }

  /** URL có slug ở cuối nên chỉ so phần đầu */
  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${this.path}/`));
    await expect(this.backButton).toBeVisible();
  }
}
