import { type Page, type Locator } from '@playwright/test';
import { BookBasePage } from './book-base.page';
import { DataTable } from '../../components/data-table.component';

export class PromotionPage extends BookBasePage {
  readonly searchInput: Locator;
  readonly table: DataTable;

  constructor(page: Page) {
    super(page, '/promotion-book-management', 'Promotion Management');
    this.searchInput = page.getByPlaceholder('Search...');
    this.table = new DataTable(page.getByRole('table'));
  }
}
