# Quy tắc Locator riêng của project (Playwright TypeScript)

> File này THAY CHO thứ tự ưu tiên locator ở mục 1 của `locator_strategy.md`
> và mục 3 của `playwright_rules.md`. Chỗ nào khác nhau thì LÀM THEO FILE NÀY.
> Các quy tắc còn lại của bộ kit giữ nguyên.

## Thứ tự ưu tiên (cao xuống thấp)

1. `getByRole()` kèm `name`
2. `getByLabel()`
3. `getByPlaceholder()`
4. `getByText()` cho phần tử không tương tác, `getByAltText()`, `getByTitle()`
5. `getByTestId()` - chỉ khi DOM thật có thuộc tính test id
6. XPath tương đối qua `page.locator('//...')` - lựa chọn cuối cùng

## Không dùng trong code

- KHÔNG dùng CSS Selector: `locator('#id')`, `locator('.class')`,
  `locator('tag[attr="..."]')`, `:has()`, `:has-text()`, `:nth-child()`.
- KHÔNG dùng XPath tuyệt đối hoặc theo vị trí (`//div[3]/button[2]`).
- KHÔNG dùng `first()`, `last()`, `nth()` để né lỗi strict mode.

## Khi trả kết quả locator

- Primary: một hàm getBy... theo thứ tự trên. Fallback: XPath tương đối, không phải CSS.
- Ghi rõ locator đã được kiểm khớp đúng 1 element trên DOM thật.

## Quy tắc viết XPath (chỉ khi không hàm getBy... nào dùng được)

- Chỉ dùng XPath tương đối, bắt đầu bằng `//`. KHÔNG dùng `/html/body/...`.
- Bám vào thuộc tính ổn định (`id`, `name`, `type`, `href`) hoặc chữ hiển thị.
  KHÔNG bám vào class tạo kiểu, id tự sinh (`ember123`, `:r1:`), class có mã băm (`css-1x2y`).
- So chữ bằng `normalize-space()`. Luôn ghi tên thẻ cụ thể, không dùng `//*`.
- KHÔNG dùng index `(...)[n]`, `div[3]`, trừ khi thứ tự chính là ý nghĩa (cột thứ n của bảng).
- Dòng trong bảng hoặc danh sách: dùng `getByRole('row').filter({ hasText / has })`
  rồi tìm tiếp bên trong dòng, trước khi nghĩ tới trục XPath.
- KHÔNG dùng hàm của công cụ khác: `page.$x()`, `page.waitForXPath()`.
- Mỗi XPath phải kèm số phần tử khớp đã đo trên DOM thật (phải bằng 1).
