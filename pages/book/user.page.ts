import { type Page, type Locator } from '@playwright/test';
import { BookBasePage } from './book-base.page';
import { DataTable } from '../../components/data-table.component';

export class UserPage extends BookBasePage {
  readonly searchInput: Locator;
  readonly table: DataTable;

  constructor(page: Page) {
    super(page, '/user-management', 'User Management');
    this.searchInput = page.getByPlaceholder('Search user (name, email, phone or address)');
    this.table = new DataTable(page.getByRole('table'));
  }
}
