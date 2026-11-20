# Quy tắc report của project playwright-crm

## Reporter
- `playwright.config.ts` khai ba reporter: `list` (terminal), `html` (`open: 'never'`), `allure-playwright` (`resultsDir: 'allure-results'`).
- KHÔNG gõ `--reporter=<tên>` khi cần report: tuỳ chọn dòng lệnh thay thế cả danh sách trong config,
  lần chạy đó không có `playwright-report/` và `allure-results/`.
- Allure cài trong project (`allure`, `allure-playwright` ở devDependencies). Sinh report: `npm run allure:generate`,
  mở report: `npm run allure:open`. KHÔNG hướng dẫn cài Allure lên máy.
- `allure-results/`, `allure-report/`, `playwright-report/`, `test-results/` nằm trong `.gitignore`. KHÔNG commit.

## Trước khi sinh report
- Xoá `allure-results/` trước lần chạy cần report. Kết quả cũ không tự mất: test chạy lại bị đếm là "retry",
  test của lần chạy trước vẫn nằm trong report.
- `npx playwright test --list` cũng ghi `allure-results/` (mọi test ở trạng thái skipped). Chạy `--list` xong phải xoá.
- Sinh lại report vào thư mục đã có: `npm run allure:generate -- --clean`.

## Đọc trạng thái
- Allure: `failed` = phép kiểm không đạt, hoặc test khai `test.fail` mà lại đạt. `broken` = hết thời gian chờ (timeout).
  `skipped` = không chạy. Test khai `test.fail` và đỏ đúng như khai báo được tính `passed`.
- HTML Report của Playwright gộp timeout vào `Failed`. Hai report lệch số ở cột này là bình thường.
- Tỉ lệ phần trăm của Allure KHÔNG tính test skipped. Luôn đọc số skipped trước khi kết luận.
- KHÔNG thêm `retries` để report xanh. Test lúc xanh lúc đỏ thì tìm nguyên nhân bằng trace.

## Bước và file đính kèm
- Bước nghiệp vụ viết bằng `test.step('<mô tả tiếng Việt>', ...)`. Client API đã bọc sẵn trong `BaseApi.send()`.
- Đính kèm dữ liệu cần cho người đọc report bằng `test.info().attach(<tên>, { body, contentType })`.
  KHÔNG đính kèm body có email, token, mật khẩu.
- KHÔNG dùng `console.log` trong test: nội dung thành file đính kèm `stdout` trong Allure.

## Bí mật trong report
- Tên bước do Playwright sinh có cả giá trị điền vào ô (`Fill "<giá trị>"`). Report của lần chạy có project `setup`
  chứa mật khẩu đăng nhập. Report chia sẻ ra ngoài nhóm chỉ lấy từ lần chạy `--no-deps`.
- `trace.zip` của test API chứa header `Authorization: Bearer <token>`; trace của `api-setup` chứa body đăng nhập.
  KHÔNG gửi `trace.zip`, `allure-results/`, `allure-report/` cho AI trên web hay kênh chat công khai.
