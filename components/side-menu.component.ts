import { type Locator } from '@playwright/test';

/** Menu điều hướng bên trái của Book demo. Có mặt ở mọi trang */
export class SideMenu {
  readonly root: Locator;
  readonly links: Locator;

  constructor(root: Locator) {
    this.root = root;
    // Tìm BÊN TRONG root, không tìm từ page. Mỗi mục menu có data-testid "nav-item-<tên>",
    // nhờ vậy không lẫn với link logo cũng nằm trong vùng menu
    this.links = root.getByTestId(/^nav-item-/);
  }

  /** Một mục menu theo đúng chữ hiển thị */
  link(name: string): Locator {
    return this.root.getByRole('link', { name, exact: true });
  }

  async open(name: string): Promise<void> {
    await this.link(name).click();
  }
}
