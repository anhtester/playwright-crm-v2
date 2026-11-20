import { type Locator } from '@playwright/test';

/**
 * Ô chọn kiểu bootstrap-select của CRM (Country, Customer, Currency...).
 * Thẻ <select> gốc bị ẩn, người dùng bấm vào một nút giả rồi gõ vào ô Search để lọc.
 * root = thẻ div bọc ngoài: page.locator('//button[@data-id="country"]/parent::div')
 */
export class BootstrapSelect {
  readonly root: Locator;
  readonly toggle: Locator;
  readonly searchInput: Locator;
  readonly list: Locator;

  constructor(root: Locator) {
    this.root = root;
    // Nút giả có role="combobox", chữ trên nút đổi theo giá trị đang chọn nên không tìm theo tên được.
    // XPath bắt đầu bằng // đặt sau root vẫn chỉ tìm BÊN TRONG root (đo thật: trong root khớp 1, cả trang khớp 6)
    this.toggle = root.locator('//button[@data-id]');
    this.searchInput = root.getByRole('combobox', { name: 'Search' });
    this.list = root.getByRole('listbox');
  }

  /**
   * Mở danh sách, gõ từng ký tự rồi bấm đúng lựa chọn.
   * Ô Customer chỉ gọi máy chủ tìm kiếm khi thấy người gõ phím: fill() hoặc gõ không nghỉ
   * (delay 0) thì CRM không gửi yêu cầu nào. Nghỉ 50ms giữa các phím là đủ.
   */
  async choose(text: string): Promise<void> {
    await this.toggle.click();
    await this.searchInput.pressSequentially(text, { delay: 50 });
    await this.list.getByRole('option', { name: text, exact: true }).click();
  }
}
