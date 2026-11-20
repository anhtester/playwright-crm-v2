import { type Page, type Locator } from '@playwright/test';
import { ClientBasePage } from './client-base.page';

/** Trang kết quả tìm kiếm của Knowledge Base. Mỗi từ khoá là một URL */
export class KnowledgeBaseSearchPage extends ClientBasePage {
  readonly keyword: string;
  readonly searchInput: Locator;
  readonly articleLinks: Locator;
  readonly emptyMessage: Locator;

  constructor(page: Page, keyword: string) {
    // URLSearchParams mã hoá từ khoá đúng kiểu trình duyệt gửi biểu mẫu GET (dấu cách thành dấu +)
    super(page, `/knowledge-base/search?${new URLSearchParams({ q: keyword })}`, 'Search Knowledge Base Articles');
    this.keyword = keyword;
    this.searchInput = page.getByRole('searchbox', { name: 'Have a question?' });
    this.articleLinks = page.getByRole('heading', { level: 4 }).getByRole('link');
    this.emptyMessage = page.getByText('No knowledge base articles found');
  }
}
