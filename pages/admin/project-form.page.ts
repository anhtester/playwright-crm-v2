import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../base.page';
import { BootstrapSelect } from '../../components/bootstrap-select.component';
import { type ProjectData } from '../../utils/crm-data';

/** Form Add new project của khu Admin: Projects > New Project */
export class ProjectFormPage extends BasePage {
  readonly heading: Locator;
  readonly nameInput: Locator;
  readonly customer: BootstrapSelect;
  readonly estimatedHoursInput: Locator;
  readonly startDateInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page, '/admin/projects/project');
    this.heading = page.getByRole('heading', { name: 'Add new project' });
    this.nameInput = page.getByRole('textbox', { name: 'Project Name' });
    // Ô Customer tìm trên máy chủ: phải gõ tên thì danh sách mới có lựa chọn
    this.customer = new BootstrapSelect(page.locator('//button[@data-id="clientid"]/parent::div'));
    this.estimatedHoursInput = page.getByRole('spinbutton', { name: 'Estimated Hours' });
    // CRM điền sẵn ngày hôm nay, định dạng dd-mm-yyyy
    this.startDateInput = page.getByRole('textbox', { name: 'Start Date' });
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
  }

  async fill(project: ProjectData): Promise<void> {
    await this.nameInput.fill(project.name);
    await this.customer.choose(project.customer);
    if (project.estimatedHours) await this.estimatedHoursInput.fill(project.estimatedHours);
  }

  /** Bấm Save. Lưu xong CRM chuyển sang trang chi tiết: /admin/projects/view/<id> */
  async save(): Promise<void> {
    await this.saveButton.click();
  }
}
