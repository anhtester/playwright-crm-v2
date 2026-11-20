import { expect, type Page, type Locator } from '@playwright/test';
import { BasePage } from '../base.page';
import { SideMenu } from '../../components/side-menu.component';
import { env } from '../../utils/env.config';

/** Lớp cha của các trang Book demo: thêm những thứ trang Book nào cũng có */
export class BookBasePage extends BasePage {
  readonly menu: SideMenu;
  readonly heading: Locator;

  constructor(page: Page, path: string, headingName: string) {
    super(page, path, env.bookURL); // Book ở tên miền khác nên truyền địa chỉ gốc đầy đủ
    // Trang User có 2 vùng navigation (menu và phân trang) nên phải lọc ra đúng menu
    this.menu = new SideMenu(
      page.getByRole('navigation').filter({ has: page.getByRole('link', { name: 'Dashboard' }) }),
    );
    this.heading = page.getByRole('heading', { name: headingName, level: 4 });
  }

  /** Đúng URL và đã thấy tiêu đề của trang */
  async expectLoaded(): Promise<void> {
    await super.expectLoaded();
    await expect(this.heading).toBeVisible();
  }
}
