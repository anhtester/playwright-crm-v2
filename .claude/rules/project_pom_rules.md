# Quy tắc Page Object Model riêng của project (Playwright TypeScript)

> Chỗ nào khác với mẫu code của bộ kit (vị trí thư mục, cách khai báo locator)
> thì LÀM THEO FILE NÀY. Các quy tắc còn lại của bộ kit giữ nguyên.

## Vị trí và tên gọi
- Page class đặt ở `pages/` tại gốc project (KHÔNG phải `src/pages/`).
- Tên file: `kebab-case.page.ts`. Tên class: PascalCase + hậu tố `Page`.
- Dùng `export class`, KHÔNG dùng `export default`. Một trang một class, một class một file.

## Cấu trúc class
- Khai báo `readonly page: Page;` và từng locator dạng `readonly tenPhanTu: Locator;`.
- GÁN locator TRONG constructor: `this.emailInput = page.getByLabel('Email Address');`
- KHÔNG gán locator tại dòng khai báo kiểu `readonly x = this.page.getBy...`
  (Playwright 1.65 báo TypeError vì this.page chưa có giá trị).
- Constructor chỉ gán, KHÔNG gọi `page.goto()`. Mở trang bằng hàm `async goto()`.
- Hàm thao tác là `async`, có `await` cho mọi thao tác, tên theo việc người dùng làm.
- Hàm làm chuyển trang thì trả về Page Object của trang mới. Không nối chuỗi quá một bước.

## Không đưa vào Page class
- KHÔNG `expect`, trừ hàm `expectLoaded()` (xem mục Assertion).
- KHÔNG `waitForTimeout`.
- KHÔNG viết cứng email, mật khẩu, dữ liệu test. Dữ liệu truyền qua tham số.
- Locator theo `.claude/rules/project_locator_rules.md`: getBy... trước, XPath sau, không CSS.

## BasePage và kế thừa
- Mọi Page class `extends BasePage` (`pages/base.page.ts`). Dòng ĐẦU TIÊN của constructor
  là `super(page, '/duong-dan')`. Không khai báo lại `page`, `url`, `goto()` ở class con.
- BasePage chỉ chứa thứ MỌI trang đều có: `page`, `path`, `url`, `goto()`, `title()`, `expectLoaded()`.
  KHÔNG thêm locator, luồng nghiệp vụ của riêng một trang. KHÔNG bọc lại `click()`, `fill()`.
- Nhóm trang chung bố cục thì có lớp cha riêng của nhóm (ví dụ `BookBasePage`), kế thừa BasePage.

## utils
- Hàm không cần `page` (tạo dữ liệu, tính ngày, đọc bảng từ một Locator) đặt ở `utils/`,
  viết dạng `export function`, không giữ trạng thái, không dùng biến toàn cục.

## Component Object
- Phần giao diện lặp lại ở nhiều trang là một class trong `components/`, tên file `ten.component.ts`.
- Constructor nhận MỘT `root: Locator`. Mọi phần tử con tìm từ `root`, KHÔNG tìm từ `page`.
- Component KHÔNG `extends` BasePage hay Page class nào. Trang dùng component qua thuộc tính:
  `this.table = new DataTable(page.getByRole('table'));`

## Assertion (thay cho dòng "KHÔNG expect" ở trên và cho quy định của automation_rules.md)
- Page class chỉ được có `expect` trong hàm `expectLoaded()`: đúng URL và một phần tử đặc trưng.
- Kết quả mong đợi của Test Case luôn viết trong file test. KHÔNG tạo hàm `verify...()` trong Page class.
- Trang demo dùng chung dữ liệu: KHÔNG ghi cứng nội dung dòng của bảng vào code.

## Fixture
- Fixture tự viết đặt ở `fixtures/`, tạo bằng `base.extend<Kieu>()`, file export `test` và `expect`.
- Fixture có đủ: setup -> `await use(giaTri)` -> teardown. Luôn `await use`, gọi đúng MỘT lần.
- Fixture không tự làm test rớt, trừ khi đó là mục đích được ghi rõ trong tên.

### Fixture cho Page Object
- Mỗi Page class có MỘT fixture trong `fixtures/pages.fixture.ts`, tên = tên class viết camelCase
  (`LoginPage` -> `loginPage`). Thêm kiểu vào `PageFixtures`.
- Fixture Page Object chỉ TẠO object: `await use(new LoginPage(page));`
  KHÔNG gọi `goto()`, KHÔNG đăng nhập, KHÔNG `expect` trong fixture. Test tự mở trang.
- File test KHÔNG viết `new XxxPage(page)` và không import Page class. Thiếu fixture thì thêm fixture.

### Fixture Chaining
- Fixture cần trang khác thì XIN fixture của trang đó (`async ({ loginPage }, use)`), không tự `new`.
- Chỉ fixture có tên nói rõ đường đi mới được mở trang (ví dụ `forgotPasswordPage`). Chuỗi tối đa 2 tầng.

### Phạm vi và tuỳ chọn
- Mặc định phạm vi test. Chỉ dùng `{ scope: 'worker' }` cho thứ chỉ đọc, dùng chung được (`runId`).
  KHÔNG để fixture worker giữ `page` hay Page Object.
- `{ auto: true }` chỉ cho fixture quan sát (log, ảnh khi rớt). KHÔNG dùng cho Page Object.

### Gộp và import
- Mỗi chủ đề một file `fixtures/<chu-de>.fixture.ts`, export `test` và kiểu. Gộp bằng `mergeTests`
  trong `fixtures/index.ts`. Không đặt hai fixture trùng tên ở hai file.
- File test chỉ import: `import { test, expect } from '../fixtures';`
