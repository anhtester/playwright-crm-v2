import { type Page, type Locator } from '@playwright/test';
import { ClientBasePage } from './client-base.page';
import { KnowledgeBaseSearchPage } from './knowledge-base-search.page';
import { KnowledgeBaseCategoryPage } from './knowledge-base-category.page';

export class KnowledgeBasePage extends ClientBasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly categoryLinks: Locator;

  constructor(page: Page) {
    super(page, '/knowledge-base', 'Search Knowledge Base Articles');
    this.searchInput = page.getByRole('searchbox', { name: 'Have a question?' });
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.categoryLinks = page.getByRole('heading', { level: 3 }).getByRole('link');
  }

  /** Tên các danh mục đang có. Dữ liệu demo dùng chung nên đọc từ trang, không ghi cứng */
  async categoryNames(): Promise<string[]> {
    const names = await this.categoryLinks.allInnerTexts();
    return names.map((name) => name.trim());
  }

  /** Tìm kiếm là yêu cầu GET, chỉ đọc dữ liệu. Trả về Page Object của trang kết quả */
  async search(keyword: string): Promise<KnowledgeBaseSearchPage> {
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
    return new KnowledgeBaseSearchPage(this.page, keyword);
  }

  /** Mở danh mục theo tên hiển thị, trả về Page Object của trang danh mục */
  async openCategory(name: string): Promise<KnowledgeBaseCategoryPage> {
    const link = this.categoryLinks.filter({ hasText: name });
    const href = (await link.getAttribute('href')) ?? '';
    await link.click();
    return new KnowledgeBaseCategoryPage(this.page, new URL(href).pathname);
  }
}
