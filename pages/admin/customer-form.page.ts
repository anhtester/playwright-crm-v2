import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../base.page';
import { BootstrapSelect } from '../../components/bootstrap-select.component';
import { type CustomerData } from '../../utils/crm-data';

/** Form Add new customer của khu Admin: Customers > New Customer */
export class CustomerFormPage extends BasePage {
  readonly companyInput: Locator;
  readonly vatInput: Locator;
  readonly phoneInput: Locator;
  readonly websiteInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly country: BootstrapSelect;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page, '/admin/clients/client');
    // getByRole chỉ khớp ô đang hiển thị. getByLabel('City') khớp 3 ô vì tab Billing & Shipping (đang ẩn) cũng có City
    this.companyInput = page.getByRole('textbox', { name: 'Company' });
    this.vatInput = page.getByRole('textbox', { name: 'VAT Number' });
    this.phoneInput = page.getByRole('textbox', { name: 'Phone' });
    this.websiteInput = page.getByRole('textbox', { name: 'Website' });
    this.addressInput = page.getByRole('textbox', { name: 'Address' });
    this.cityInput = page.getByRole('textbox', { name: 'City' });
    this.country = new BootstrapSelect(page.locator('//button[@data-id="country"]/parent::div'));
    // exact: true để không khớp nút "Save and create contact"
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
  }

  /** Điền các ô có trong dữ liệu, ô nào không truyền thì bỏ qua */
  async fill(customer: CustomerData): Promise<void> {
    await this.companyInput.fill(customer.company);
    if (customer.vat) await this.vatInput.fill(customer.vat);
    if (customer.phone) await this.phoneInput.fill(customer.phone);
    if (customer.website) await this.websiteInput.fill(customer.website);
    if (customer.address) await this.addressInput.fill(customer.address);
    if (customer.city) await this.cityInput.fill(customer.city);
    if (customer.country) await this.country.choose(customer.country);
  }

  /** Bấm Save. Lưu xong CRM mở lại chính form này ở chế độ sửa: /admin/clients/client/<id> */
  async save(): Promise<void> {
    await this.saveButton.click();
  }
}
