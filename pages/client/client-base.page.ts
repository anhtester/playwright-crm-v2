import { expect, type Page, type Locator } from '@playwright/test';
import { BasePage } from '../base.page';
import { ClientNavbar } from '../../components/client-navbar.component';

/** Lớp cha của các trang khu khách hàng CRM: trang nào cũng có navbar và một tiêu đề */
export class ClientBasePage extends BasePage {
  readonly navbar: ClientNavbar;
  readonly heading: Locator;

  constructor(page: Page, path: string, headingName: string) {
    super(page, path); // không truyền baseUrl: dùng use.baseURL của file cấu hình
    this.navbar = new ClientNavbar(page.getByRole('navigation'));
    this.heading = page.getByRole('heading', { name: headingName, exact: true });
  }

  /** Đúng URL và đã thấy tiêu đề của trang */
  async expectLoaded(): Promise<void> {
    await super.expectLoaded();
    await expect(this.heading).toBeVisible();
  }
}
