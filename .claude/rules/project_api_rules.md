# Quy tắc test API riêng của project (Playwright TypeScript)

> Chỗ nào khác với lệnh `/generate-automation-api` và skill của bộ kit (vị trí thư mục, cách lấy token)
> thì LÀM THEO FILE NÀY. Các quy tắc còn lại của bộ kit giữ nguyên.

## Vị trí và project
- Test API nằm ở `tests/api/`, tên file `<chủ-đề>.api.spec.ts`. Đuôi `.api.spec.ts` là bắt buộc:
  project `api` chọn file theo đuôi này, project trình duyệt bỏ qua file này.
- Project `api` có `baseURL` là Book (`env.bookURL`). Trong test và client chỉ viết đường dẫn: `'/api/book'`.
- Test API KHÔNG mở trình duyệt (`page`) chỉ để gọi API.

## Cấu trúc thư mục
- Client API đặt ở `api/` tại gốc project (KHÔNG phải `src/api/`), tên file `<nhóm>.api.ts`,
  tên class PascalCase + hậu tố `Api` (`BookApi`). Mỗi nhóm endpoint (`/api/book`, `/api/category-book`) một class.
- Mọi client `extends BaseApi` (`api/base.api.ts`) và gửi request qua `this.send()`. KHÔNG gọi `this.request.get()` thẳng.
- Hàm của client đặt tên theo việc nghiệp vụ (`list`, `get`, `create`, `update`, `remove`), trả về `ApiResult<T>`
  (`status` + `body` đã đọc sẵn). Client KHÔNG `expect`: kết quả mong đợi viết trong test.
- Kiểu body (`Book`, `BookBody`, `BookList`, `BookQuery`) đặt ở `utils/book-data.ts`. KHÔNG dùng `any`.
- Client có fixture ở `fixtures/api.fixture.ts`, tên camelCase (`bookApi`). Test KHÔNG viết `new BookApi(...)`.

## Đăng nhập
- Đăng nhập API DUY NHẤT ở `tests/book-api.setup.ts` (project `api-setup`), lưu token ra
  `playwright/.auth/book-token.json`. Project `api` có `dependencies: ['api-setup']`.
- Token gắn vào request context của fixture `authRequest` qua `extraHTTPHeaders`. Client nhận context này,
  nên test gọi `bookApi.create()` là đã có token.
- KHÔNG đặt `extraHTTPHeaders` có token trong `playwright.config.ts`: file cấu hình chạy TRƯỚC `api-setup`,
  lúc đó file token chưa có hoặc là token cũ.
- Kịch bản cần "không token" thì dùng fixture `request` gốc. Kịch bản token sai thì truyền `headers` riêng cho request đó.
- KHÔNG gọi `/api/login` trong file test, KHÔNG viết token vào code, KHÔNG in token ra log hay report.

## Tham số và body
- Tham số trên URL truyền qua `params: {...}`, KHÔNG tự ghép chuỗi `?a=1&b=2` (dễ quên mã hoá dấu cách, tiếng Việt).
- Body JSON truyền qua `data`. Form thường qua `form`. Upload file qua `multipart` với `{ name, mimeType, buffer }`.
- File mẫu để upload nằm ở `data/files/`.
- Giá trị ghép vào đường dẫn (tên danh mục) phải qua `encodeURIComponent()`.

## Kiểm tra kết quả
- Luôn kiểm mã trạng thái VÀ nội dung body. Sau POST, PATCH, DELETE phải GET lại để kiểm dữ liệu đã lưu thật.
- Phân trang: đi hết các trang theo `totalPage`, kiểm tổng số, không trùng, không sót.
- Hệ thống sai so với kỳ vọng (bug đã biết): giữ nguyên kỳ vọng đúng và đánh dấu `test.fail(true, '<lý do>')`.
  KHÔNG hạ assertion cho test xanh.

## Dữ liệu
- Chỉ sửa, xoá dữ liệu do CHÍNH test tạo ra. KHÔNG lấy id từ danh sách rồi PATCH hay DELETE.
- Cần sách có sẵn để test thì xin fixture `createBook()`: tạo qua API, tự xoá sách và danh mục sau test.
- Tạo dữ liệu không qua fixture (danh mục, file) thì tự dọn trong `finally`.
- Dữ liệu tạo mới có tiền tố `AT Auto` (`buildBook()`, `buildCategoryName()`). Kiểm theo `search` một mã riêng
  của test (`uniqueSuffix()`), không phụ thuộc dữ liệu của người khác.
- PATCH chỉ gửi trường cần đổi, rồi GET lại kiểm cả trường đã đổi lẫn một trường KHÔNG gửi (phải giữ nguyên).

## Network Interception (test giao diện)
- Chặn hoặc giả lập request bằng `page.route(<pattern>, handler)` ĐẶT TRƯỚC `goto()`. Pattern viết thành hằng
  ở đầu file (`'**/api/book?*'`): request có query thì pattern phải có `?*`, không thì route không chạy và không báo lỗi.
- Response giả (body JSON) đặt ở `data/<tên>.mock.json`, đủ các trường giao diện dùng. KHÔNG viết JSON dài trong test.
- Chỉ dùng tên, giá CHỈ CÓ trong dữ liệu giả để kiểm (`Sách giả lập: ...`), để chắc giao diện đang hiện dữ liệu giả.
- Trạng thái giao diện có thể trùng lúc đang tải ("No Data"): chờ `page.waitForResponse(<cùng pattern>)`
  (hoặc `waitForEvent('requestfailed')` khi `abort`) rồi mới kiểm. KHÔNG dùng `waitForTimeout`.
- `waitForResponse` phải đăng ký TRƯỚC thao tác gây ra request (`const p = page.waitForResponse(...)`, rồi `goto`, rồi `await p`).
- Sửa một phần response thật: `route.fetch()` → sửa body → `route.fulfill({ response, json })`.
- KHÔNG so chữ báo lỗi mạng (`failure().errorText`): mỗi trình duyệt một kiểu.

## Kết hợp API và UI
- Dữ liệu cần có sẵn cho test giao diện thì tạo bằng API (`createBook()`), KHÔNG tạo qua form trừ khi chính form là thứ cần test.
- Fixture API luôn gọi địa chỉ Book (`env.bookURL`), kể cả trong project trình duyệt (baseURL là CRM).
- Project trình duyệt có `dependencies: ['setup', 'api-setup']` vì test kết hợp cần token Book.
- Đổi dữ liệu bằng API giữa test giao diện thì `page.reload()` rồi mới kiểm lại giao diện.
