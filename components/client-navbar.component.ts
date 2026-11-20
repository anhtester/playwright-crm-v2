import { type Locator } from '@playwright/test';

/** Thanh điều hướng trên cùng của khu khách hàng CRM. Có mặt ở mọi trang công khai */
export class ClientNavbar {
  readonly root: Locator;
  readonly logoLink: Locator;
  readonly menuLinks: Locator;
  readonly knowledgeBaseLink: Locator;
  readonly loginLink: Locator;
  /** Nút 3 gạch: chỉ hiện khi màn hình hẹp (điện thoại), menu bị thu gọn sau nút này */
  readonly menuToggle: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.logoLink = root.getByRole('link', { name: 'Perfex CRM | Anh Tester Demo' });
    this.menuLinks = root.getByRole('listitem').getByRole('link'); // các mục menu, không tính logo
    this.knowledgeBaseLink = root.getByRole('link', { name: 'Knowledge Base' });
    // KHÔNG thêm exact: true. Tên của link này có kèm ký tự icon đứng trước chữ Login
    this.loginLink = root.getByRole('link', { name: 'Login' });
    this.menuToggle = root.getByRole('button', { name: 'Toggle navigation' });
  }

  /** Màn hình hẹp thì bấm nút 3 gạch để mở menu; màn hình rộng thì không làm gì */
  private async openMenuIfCollapsed(): Promise<void> {
    if (await this.menuToggle.isVisible()) {
      // Nút 3 gạch chỉ mở được menu khi JavaScript của trang đã chạy xong
      await this.root.page().waitForLoadState();
      await this.menuToggle.click();
    }
  }

  async openKnowledgeBase(): Promise<void> {
    await this.openMenuIfCollapsed();
    await this.knowledgeBaseLink.click();
  }

  async openLogin(): Promise<void> {
    await this.openMenuIfCollapsed();
    await this.loginLink.click();
  }
}
