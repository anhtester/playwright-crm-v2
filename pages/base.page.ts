import { expect, type Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly path: string;
  readonly url: string;

  /**
   * baseUrl để trống: url là đường dẫn tương đối, Playwright tự ghép với use.baseURL trong playwright.config.ts.
   * Trang của hệ thống khác (Book) thì truyền địa chỉ gốc đầy đủ của hệ thống đó.
   */
  constructor(page: Page, path: string, baseUrl: string = '') {
    this.page = page;
    this.path = path;
    this.url = baseUrl + path;
  }

  /** Mở thẳng trang này bằng URL */
  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  /** Tiêu đề trên thẻ trình duyệt */
  async title(): Promise<string> {
    return this.page.title();
  }

  /** Chốt "đã ở đúng trang". Class con ghi đè để kiểm thêm phần tử đặc trưng của mình */
  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(this.url);
  }
}
