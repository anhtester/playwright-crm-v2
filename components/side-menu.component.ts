import { type Locator } from '@playwright/test';

/** Menu điều hướng bên trái của Book demo. Có mặt ở mọi trang */
export class SideMenu {
  readonly root: Locator;
  readonly links: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.links = root.getByRole('link'); // tìm BÊN TRONG root, không tìm từ page
  }

  /** Một mục menu theo đúng chữ hiển thị */
  link(name: string): Locator {
    return this.root.getByRole('link', { name, exact: true });
  }

  async open(name: string): Promise<void> {
    await this.link(name).click();
  }
}
