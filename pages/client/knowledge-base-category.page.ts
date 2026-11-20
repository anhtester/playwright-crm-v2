import { type Page, type Locator } from '@playwright/test';
import { ClientBasePage } from './client-base.page';

/** Trang một danh mục của Knowledge Base: danh sách bài viết thuộc danh mục đó */
export class KnowledgeBaseCategoryPage extends ClientBasePage {
  readonly articleLinks: Locator;

  /** path lấy từ href của link danh mục, ví dụ /knowledge-base/category/java */
  constructor(page: Page, path: string) {
    super(page, path, 'Search Knowledge Base Articles');
    this.articleLinks = page.getByRole('heading', { level: 4 }).getByRole('link');
  }
}
