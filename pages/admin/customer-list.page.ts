import { type Page, type Locator } from '@playwright/test';
import { AdminListPage } from './admin-list.page';
import { CustomerFormPage } from './customer-form.page';

/** Trang danh sách Customers của khu Admin */
export class CustomerListPage extends AdminListPage {
  readonly newCustomerLink: Locator;

  constructor(page: Page) {
    super(page, '/admin/clients', 'clients');
    this.newCustomerLink = page.getByRole('link', { name: 'New Customer' });
  }

  /** Bấm New Customer và trả về form vừa mở */
  async openNewCustomer(): Promise<CustomerFormPage> {
    await this.newCustomerLink.click();
    return new CustomerFormPage(this.page);
  }
}
